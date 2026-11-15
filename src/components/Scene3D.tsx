
"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";

/**
 * Wrist and finger rotations calibrated for this exact model.glb.
 * Shoulder, elbow and wrist positions are solved below using the GLB's
 * actual bone segment lengths.
 */
const FOLDED_ARMS_POSE: Record<string, [number, number, number, number]> = {
  LeftHand: [0.001, 0.004, -0.0784, 0.9969],

  LeftHandIndex1: [0.299, 0.0071, 0.0247, 0.9539],

  LeftHandIndex2: [0.4666, -0.0185, -0.041, 0.8833],

  LeftHandIndex3: [0.3092, 0.0067, 0.0119, 0.9509],

  LeftHandMiddle1: [0.3384, -0.0054, -0.0187, 0.9408],

  LeftHandMiddle2: [0.5235, -0.0039, -0.0072, 0.852],

  LeftHandMiddle3: [0.3221, -0.0076, -0.0201, 0.9464],

  LeftHandRing1: [0.3917, -0.023, -0.0636, 0.9176],

  LeftHandRing2: [0.5344, 0.0047, 0.0063, 0.8452],

  LeftHandRing3: [0.3923, -0.0073, -0.0133, 0.9197],

  LeftHandPinky1: [0.3815, -0.071, -0.1967, 0.9004],

  LeftHandPinky2: [0.5078, 0.0052, 0.0007, 0.8615],

  LeftHandPinky3: [0.3951, 0.0136, 0.0389, 0.9177],

  LeftHandThumb1: [0.2231, 0.253, 0.4571, 0.823],

  LeftHandThumb2: [0.1775, -0.2266, -0.1073, 0.9516],

  LeftHandThumb3: [0.137, -0.0427, -0.0656, 0.9875],

  RightHand: [0.0393, -0.001, 0.0785, 0.9961],

  RightHandIndex1: [0.2476, -0.0083, -0.0242, 0.9685],

  RightHandIndex2: [0.4666, 0.0185, 0.041, 0.8833],

  RightHandIndex3: [0.3091, -0.0067, -0.012, 0.9509],

  RightHandMiddle1: [0.2877, 0.0051, 0.0144, 0.9576],

  RightHandMiddle2: [0.5235, 0.0061, 0.011, 0.852],

  RightHandMiddle3: [0.3222, 0.0076, 0.0201, 0.9464],

  RightHandRing1: [0.3421, 0.0266, 0.0623, 0.9372],

  RightHandRing2: [0.5343, -0.0046, -0.0063, 0.8452],

  RightHandRing3: [0.3923, 0.0072, 0.0134, 0.9197],

  RightHandPinky1: [0.3329, 0.0815, 0.1927, 0.9195],

  RightHandPinky2: [0.5078, -0.0052, -0.0006, 0.8615],

  RightHandPinky3: [0.395, -0.0138, -0.0391, 0.9177],

  RightHandThumb1: [0.1787, -0.2769, -0.4428, 0.8338],

  RightHandThumb2: [0.1775, 0.2267, 0.1073, 0.9516],

  RightHandThumb3: [0.1369, 0.0427, 0.0656, 0.9875],
};

// Rotate a bone in world space so the child joint points toward a target.
// Segment length remains the length defined by the GLB skeleton.
const aimBoneSegment = (
  avatar: THREE.Object3D,
  bone: THREE.Object3D | null,
  child: THREE.Object3D | null,
  target: THREE.Vector3,
) => {
  if (!bone || !child || !bone.parent) return;

  avatar.updateMatrixWorld(true);

  const bonePosition = new THREE.Vector3();
  const childPosition = new THREE.Vector3();

  bone.getWorldPosition(bonePosition);
  child.getWorldPosition(childPosition);

  const currentDirection = childPosition.sub(bonePosition).normalize();
  const targetDirection = target.clone().sub(bonePosition).normalize();

  if (currentDirection.lengthSq() < 1e-8 || targetDirection.lengthSq() < 1e-8) {
    return;
  }

  // Convert the required world-space rotation back into the bone's local space.
  const worldDelta = new THREE.Quaternion().setFromUnitVectors(
    currentDirection,
    targetDirection,
  );

  const parentWorldQuaternion = new THREE.Quaternion();
  const currentWorldQuaternion = new THREE.Quaternion();

  bone.parent.getWorldQuaternion(parentWorldQuaternion);
  bone.getWorldQuaternion(currentWorldQuaternion);

  const desiredWorldQuaternion = worldDelta.multiply(currentWorldQuaternion);

  bone.quaternion.copy(
    parentWorldQuaternion.invert().multiply(desiredWorldQuaternion),
  );

  avatar.updateMatrixWorld(true);
};

export default function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let isDisposed = false;

    // 1. WebGL Renderer

    const renderer = new THREE.WebGLRenderer({
      canvas,

      antialias: true,

      alpha: true,

      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Camera & Scene

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

    camera.position.z = 11;

    const onResize = () => {
      const width = window.innerWidth;

      const height = window.innerHeight;

      renderer.setSize(width, height);

      camera.aspect = width / height;

      camera.updateProjectionMatrix();
    };

    onResize();

    window.addEventListener("resize", onResize);

    // 3. Editorial Studio Lighting

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);

    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);

    keyLight.position.set(4, 5, 6);

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce7ff, 1.1);

    fillLight.position.set(-4, 2, 4);

    scene.add(fillLight);

    // Warm orange rim light (matches portfolio accent #ff4d1c)

    const rimOrange = new THREE.PointLight(0xff551c, 3.8, 30);

    rimOrange.position.set(-5, 2, -2);

    scene.add(rimOrange);

    // Cool blue rim light

    const rimBlue = new THREE.PointLight(0x3b66ff, 3.0, 30);

    rimBlue.position.set(5, -1, -2);

    scene.add(rimBlue);

    // Overhead hair & shoulder highlight

    const topHighlight = new THREE.PointLight(0xffe8d6, 1.6, 20);

    topHighlight.position.set(0, 5, 2);

    scene.add(topHighlight);

    // Root stage group

    const rootGroup = new THREE.Group();

    scene.add(rootGroup);

    // 4. Procedural Character Group (Instant preview & fallback)

    const proceduralGroup = new THREE.Group();

    rootGroup.add(proceduralGroup);

    const toonGradient = new THREE.DataTexture(
      new Uint8Array([70, 150, 255]),

      3,

      1,

      renderer.capabilities.isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat,
    );

    toonGradient.minFilter = THREE.NearestFilter;

    toonGradient.magFilter = THREE.NearestFilter;

    toonGradient.needsUpdate = true;

    const mkToon = (
      geo: THREE.BufferGeometry,

      color: THREE.ColorRepresentation,

      p: [number, number, number] = [0, 0, 0],

      s: [number, number, number] = [1, 1, 1],
    ) => {
      const mesh = new THREE.Mesh(
        geo,

        new THREE.MeshToonMaterial({ color, gradientMap: toonGradient }),
      );

      mesh.position.set(...p);

      mesh.scale.set(...s);

      return mesh;
    };

    const SP = new THREE.SphereGeometry(1, 40, 32);

    const procHead = new THREE.Group();

    proceduralGroup.add(procHead);

    procHead.add(mkToon(SP, "#b57a53", [0, 0, 0], [0.9, 1.05, 0.95]));

    procHead.add(
      mkToon(
        new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, 1.05),

        "#15110f",

        [0, 0.02, -0.02],

        [0.94, 1.1, 1],
      ),
    );

    procHead.add(
      mkToon(SP, "#15110f", [0.12, 0.98, 0.38], [0.7, 0.3, 0.55]),

      mkToon(SP, "#15110f", [-0.35, 0.94, 0.3], [0.5, 0.28, 0.45]),

      mkToon(SP, "#15110f", [0.6, 0.82, 0.1], [0.4, 0.3, 0.5]),

      mkToon(SP, "#15110f", [-0.6, 0.78, 0], [0.38, 0.3, 0.5]),
    );

    procHead.add(
      mkToon(
        new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 1.814, 1.327),

        "#33241d",

        [0, -0.01, 0],

        [0.93, 1.08, 0.98],
      ),
    );

    procHead.add(
      mkToon(
        new THREE.CircleGeometry(0.23, 32, Math.PI, Math.PI),
        "#8a3b3b",
        [0, -0.38, 0.925],
      ),

      mkToon(
        new THREE.CircleGeometry(0.19, 32, Math.PI, Math.PI),
        "#f4f0e8",
        [0, -0.385, 0.935],
      ),
    );

    const procEyes = [-1, 1].map((s) => {
      const eg = new THREE.Group();

      eg.position.set(s * 0.34, 0.13, 0.885);

      eg.add(
        mkToon(SP, "#0b0908", [0, 0, 0], [0.075, 0.075, 0.075]),

        mkToon(SP, "#fff", [0.02, 0.035, 0.06], [0.022, 0.022, 0.022]),
      );

      procHead.add(eg);

      const eb = mkToon(new THREE.BoxGeometry(0.3, 0.055, 0.07), "#15110f", [
        s * 0.34,
        0.32,
        0.84,
      ]);

      eb.rotation.z = -s * 0.1;

      procHead.add(eb);

      return eg;
    });

    procHead.add(
      mkToon(SP, "#a8683f", [0, -0.07, 0.93], [0.13, 0.16, 0.13]),

      mkToon(SP, "#b57a53", [-0.88, 0, -0.02], [0.13, 0.22, 0.1]),

      mkToon(SP, "#b57a53", [0.88, 0, -0.02], [0.13, 0.22, 0.1]),
    );

    proceduralGroup.add(
      mkToon(
        new THREE.CylinderGeometry(0.3, 0.32, 0.5, 24),
        "#a8683f",
        [0, -1.2, 0],
      ),

      mkToon(SP, "#9fb4cf", [0, -2.45, -0.05], [1.75, 1.1, 0.85]),

      mkToon(SP, "#a8683f", [0, -1.9, 0.5], [0.5, 0.55, 0.3]),
    );

    const procCollar = mkToon(
      new THREE.TorusGeometry(0.33, 0.08, 10, 28),
      "#b4c6dc",
      [0, -1.4, 0],
    );

    procCollar.rotation.x = Math.PI / 2;

    proceduralGroup.add(procCollar);

    proceduralGroup.position.y = -0.3;

    // 5. GLTF Avatar Integration

    const gltfContainer = new THREE.Group();

    rootGroup.add(gltfContainer);

    gltfContainer.visible = false;

    let headBone: THREE.Object3D | null = null;

    let neckBone: THREE.Object3D | null = null;

    let spineBone: THREE.Object3D | null = null;

    const baseHeadRot = new THREE.Euler();

    const baseNeckRot = new THREE.Euler();

    const baseSpineRot = new THREE.Euler();

    interface MorphTargetMesh {
      mesh: THREE.Mesh;

      leftBlinkIdx: number;

      rightBlinkIdx: number;
    }

    const blinkMeshes: MorphTargetMesh[] = [];

    // Dynamically import GLTFLoader on client

    import("three/examples/jsm/loaders/GLTFLoader.js")

      .then(({ GLTFLoader }) => {
        if (isDisposed) return;

        const loader = new GLTFLoader();

        loader.load(
          "/models/model.glb",

          (gltf) => {
            if (isDisposed) return;

            const avatar = gltf.scene;

            avatar.traverse((child) => {
              // Hide pants and shoes so only top half is rendered

              if (
                child.name === "outfit_bottom" ||
                child.name === "outfit_shoes"
              ) {
                child.visible = false;

                return;
              }

              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                mesh.frustumCulled = false;

                if (mesh.material) {
                  const mat = mesh.material as THREE.MeshStandardMaterial;

                  mat.roughness = Math.max(mat.roughness ?? 0.5, 0.35);

                  mat.needsUpdate = true;
                }

                // Morph targets for natural eyelid blinking

                if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                  const leftBlink = mesh.morphTargetDictionary["eyeBlinkLeft"];

                  const rightBlink =
                    mesh.morphTargetDictionary["eyeBlinkRight"];

                  if (leftBlink !== undefined || rightBlink !== undefined) {
                    blinkMeshes.push({
                      mesh,

                      leftBlinkIdx: leftBlink ?? -1,

                      rightBlinkIdx: rightBlink ?? -1,
                    });
                  }
                }
              }
            });

            // Bone bindings

            headBone = avatar.getObjectByName("Head") || null;

            neckBone = avatar.getObjectByName("Neck") || null;

            spineBone =
              avatar.getObjectByName("Spine2") ||
              avatar.getObjectByName("Spine1") ||
              avatar.getObjectByName("Spine") ||
              null;

            // Apply the wrist and finger pose first. These are rig-specific local
            // rotations taken from this exact GLB.
            Object.entries(FOLDED_ARMS_POSE).forEach(([boneName, q]) => {
              const bone = avatar.getObjectByName(boneName);
              if (bone) bone.quaternion.set(q[0], q[1], q[2], q[3]);
            });

            // Crossed-arm IK for this model's actual segment lengths.
            // The target points define segment directions; bone lengths remain
            // unchanged. Coordinates are in GLB space; +Z faces the camera.
            const leftArm = avatar.getObjectByName("LeftArm") ?? null;
            const leftForeArm = avatar.getObjectByName("LeftForeArm") ?? null;
            const leftHand = avatar.getObjectByName("LeftHand") ?? null;

            const rightArm = avatar.getObjectByName("RightArm") ?? null;
            const rightForeArm = avatar.getObjectByName("RightForeArm") ?? null;
            const rightHand = avatar.getObjectByName("RightHand") ?? null;

            if (
              !leftArm ||
              !leftForeArm ||
              !leftHand ||
              !rightArm ||
              !rightForeArm ||
              !rightHand
            ) {
              console.warn(
                "Crossed-arm pose: one or more expected arm bones were not found.",
              );
            }

            // Elbows sit outward and below the shoulders. Wrists travel inward
            // across the chest. The left forearm is slightly closer to camera,
            // making the overlap readable instead of intersecting at one depth.
            aimBoneSegment(
              avatar,
              leftArm,
              leftForeArm,
              new THREE.Vector3(0.19, 1.23, 0.12),
            );
            aimBoneSegment(
              avatar,
              leftForeArm,
              leftHand,
              new THREE.Vector3(-0.04, 1.26, 0.17),
            );

            aimBoneSegment(
              avatar,
              rightArm,
              rightForeArm,
              new THREE.Vector3(-0.19, 1.23, 0.12),
            );
            aimBoneSegment(
              avatar,
              rightForeArm,
              rightHand,
              new THREE.Vector3(0.04, 1.26, 0.11),
            );

            // Refresh all skinned-mesh transforms before the first render.
            avatar.updateMatrixWorld(true);

            if (headBone) baseHeadRot.copy(headBone.rotation);

            if (neckBone) baseNeckRot.copy(neckBone.rotation);

            if (spineBone) baseSpineRot.copy(spineBone.rotation);

            // Scale & Position:

            // Scale 5.5 makes the character fill the orange circle like the original toon avatar.

            // Y offset centers the torso+head in view: head at model Y ≈ 1.65, so we shift down by that  scale.*

            // Then nudge up slightly (+0.6  avatarScale / 5.5) to show more of the chest for the crossed-arms pose.*

            const avatarScale = 5.5;

            avatar.scale.setScalar(avatarScale);

            avatar.position.set(0, -1.65 * avatarScale + 1.5, 0);

            gltfContainer.add(avatar);

            // Reveal realistic model and hide procedural fallback

            gltfContainer.visible = true;

            proceduralGroup.visible = false;
          },

          undefined,

          (error) => {
            console.warn(
              "Failed to load /models/model.glb, falling back to procedural avatar:",
              error,
            );
          },
        );
      })

      .catch((err) => {
        console.warn("Failed to dynamically load GLTFLoader:", err);
      });

    // 6. Interactive Cursor & Scroll Animation Loop

    let nx = 0;

    let ny = 0;

    const onPointerMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;

      ny = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointerMove);

    let sx = 3;

    let sy = 0;

    let ss = 0.01;

    const t0 = performance.now();

    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);

      const t = (performance.now() - t0) / 1000;

      const y = window.scrollY;

      const vh = window.innerHeight;

      const isMobile = window.innerWidth < 800;

      const aboutEl = document.getElementById("about");

      const contactEl = document.getElementById("contact");

      const aT = aboutEl ? aboutEl.offsetTop : 1000;

      const aH = aboutEl ? aboutEl.offsetHeight : 1000;

      const ct = contactEl ? contactEl.offsetTop : 4000;

      const mid = y + vh * 0.5;

      let gx: number, gy: number, gs: number;

      if (y + vh * 0.55 > ct) {
        // Contact section

        gx = 0;

        gy = isMobile ? 1.4 : 1.3;

        gs = isMobile ? 0.75 : 0.85;
      } else if (mid < aT) {
        // Hero section - aligned with left-column stage in new hero layout
        gx = isMobile ? 0 : -2.85;
        gy = isMobile ? 1.4 : -0.1;
        gs = isMobile ? 0.82 : 1.12;
      } else if (mid < aT + aH && !isMobile) {
        // About section (desktop)
        gx = -2.85;
        gy = -0.1;
        gs = 1.05;
      } else {
        // Hidden during Work / Projects & Off-screen (cull rendering)

        gx = isMobile ? 0 : -1;

        gy = 0;

        gs = 0.001;
      }

      // Smooth interpolation

      sx += (gx - sx) * 0.07;

      sy += (gy - sy) * 0.07;

      ss += (gs - ss) * 0.07;

      const isVisible = ss > 0.02;

      rootGroup.visible = isVisible;

      if (!isVisible) {
        return;
      }

      rootGroup.position.set(sx, sy, 0);

      rootGroup.scale.setScalar(Math.max(ss, 0.001));

      // Calculate smooth cursor tracking yaw and pitch

      const yaw = (nx - sx / 6.5) * 0.6;

      const pit = (ny - 0.1) * 0.28;

      if (gltfContainer.visible) {
        // Subtle breathing & idle float

        const breath = Math.sin(t * 1.5) * 0.015;

        const idleFloat = Math.sin(t * 0.8) * 0.004;

        rootGroup.position.y += idleFloat;

        if (spineBone) {
          spineBone.rotation.x +=
            (baseSpineRot.x + breath + pit * 0.08 - spineBone.rotation.x) *
            0.05;

          spineBone.rotation.y +=
            (baseSpineRot.y + yaw * 0.12 - spineBone.rotation.y) * 0.05;
        }

        if (neckBone) {
          neckBone.rotation.y +=
            (baseNeckRot.y + yaw * 0.22 - neckBone.rotation.y) * 0.07;

          neckBone.rotation.x +=
            (baseNeckRot.x + pit * 0.16 - neckBone.rotation.x) * 0.07;
        }

        if (headBone) {
          headBone.rotation.y +=
            (baseHeadRot.y + yaw * 0.5 - headBone.rotation.y) * 0.09;

          headBone.rotation.x +=
            (baseHeadRot.x + pit * 0.35 - headBone.rotation.x) * 0.09;
        }

        // Natural eyelid blinking via ARKit blendshapes

        const blinkCycle = t % 3.6;

        const isBlinking = blinkCycle > 3.45;

        const blinkWeight = isBlinking
          ? Math.sin(((blinkCycle - 3.45) / 0.15) * Math.PI)
          : 0;

        blinkMeshes.forEach(({ mesh, leftBlinkIdx, rightBlinkIdx }) => {
          if (mesh.morphTargetInfluences) {
            if (leftBlinkIdx >= 0)
              mesh.morphTargetInfluences[leftBlinkIdx] = blinkWeight;

            if (rightBlinkIdx >= 0)
              mesh.morphTargetInfluences[rightBlinkIdx] = blinkWeight;
          }
        });
      } else {
        procHead.rotation.y += (yaw - procHead.rotation.y) * 0.08;

        procHead.rotation.x += (pit - procHead.rotation.x) * 0.08;

        proceduralGroup.rotation.y +=
          (yaw * 0.25 - proceduralGroup.rotation.y) * 0.05;

        proceduralGroup.scale.y = 1 + Math.sin(t * 1.6) * 0.006;

        rootGroup.position.y += Math.sin(t) * 0.004;

        const blink = t % 4 > 3.85 ? 0.12 : 1;

        procEyes.forEach((e) => {
          e.scale.y += (blink - e.scale.y) * 0.5;
        });
      }

      renderer.render(scene, camera);
    };

    loop();

    return () => {
      isDisposed = true;

      window.removeEventListener("resize", onResize);

      window.removeEventListener("pointermove", onPointerMove);

      cancelAnimationFrame(animId);

      renderer.dispose();

      toonGradient.dispose();
    };
  }, []);

  return <canvas id="gl" ref={canvasRef} aria-hidden="true" />;
}
