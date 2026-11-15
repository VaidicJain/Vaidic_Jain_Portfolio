"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hand, wrist and finger calibrations tuned specifically for model.glb
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

// Aim bone segment solver for crossed-arms pose
const aimBoneSegment = (
  avatar: THREE.Object3D,
  bone: THREE.Object3D | null,
  child: THREE.Object3D | null,
  target: THREE.Vector3
) => {
  if (!bone || !child || !bone.parent) return;
  avatar.updateMatrixWorld(true);

  const bonePosition = new THREE.Vector3();
  const childPosition = new THREE.Vector3();
  bone.getWorldPosition(bonePosition);
  child.getWorldPosition(childPosition);

  const currentDirection = childPosition.sub(bonePosition).normalize();
  const targetDirection = target.clone().sub(bonePosition).normalize();
  if (currentDirection.lengthSq() < 1e-8 || targetDirection.lengthSq() < 1e-8) return;

  const worldDelta = new THREE.Quaternion().setFromUnitVectors(currentDirection, targetDirection);
  const parentWorldQuaternion = new THREE.Quaternion();
  const currentWorldQuaternion = new THREE.Quaternion();

  bone.parent.getWorldQuaternion(parentWorldQuaternion);
  bone.getWorldQuaternion(currentWorldQuaternion);

  const desiredWorldQuaternion = worldDelta.multiply(currentWorldQuaternion);
  bone.quaternion.copy(parentWorldQuaternion.invert().multiply(desiredWorldQuaternion));
  avatar.updateMatrixWorld(true);
};

const PROJECTS = [
  {
    title: "Flight Booking & Enquiry Platform",
    tag: "Full-stack · In development",
    desc: "A one-stop platform to search and book flights and handle travel enquiries, with a Next.js and TypeScript frontend, a FastAPI service and a PostgreSQL database.",
    built: "Frontend, API and database",
    stack: "Next.js · TypeScript · FastAPI · PostgreSQL",
    link: "https://github.com",
    demo: "#",
  },
  {
    title: "Employee Management Dashboard",
    tag: "Full-stack · 2024",
    desc: "An HR platform covering attendance, leave and projects in one place, with live dashboard stats, Excel report exports and a clean light and dark interface.",
    built: "Design, frontend and API",
    stack: "Next.js 15 · Redux Toolkit · FastAPI · MongoDB · JWT",
    link: "https://github.com",
    demo: "#",
  },
  {
    title: "FinGuard",
    tag: "Fintech app",
    desc: "A banking app that connects real bank accounts through Plaid and moves money between people with Dwolla: an exploration of linked accounts, transfers and trust.",
    built: "Full product, end to end",
    stack: "Plaid · Dwolla · Next.js · TypeScript",
    link: "https://github.com",
    demo: "#",
  },
];

const SKILLS = [
  {
    title: "Data-heavy interfaces",
    desc: "TanStack Table and RTK Query, built to stay instant under real load with virtualization and caching.",
    tags: ["TanStack Table", "RTK Query", "Virtualization", "Performance"],
  },
  {
    title: "Product frontends",
    desc: "React, Next.js and TypeScript, from fuzzy stakeholder discussions to pixel-perfect shipped features.",
    tags: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "Full-stack APIs",
    desc: "Designing fast REST services, async workers, schemas, and relational and document databases.",
    tags: ["FastAPI", "Node.js", "PostgreSQL", "MongoDB"],
  },
  {
    title: "Testing and quality",
    desc: "End-to-end regression test suites, unit testing, and automated release verification pipelines.",
    tags: ["Playwright", "Jest", "Vitest", "CI/CD"],
  },
  {
    title: "3D and motion",
    desc: "Purposeful interaction, Three.js shaders, WebGL rigs, and fluid micro-animations that explain.",
    tags: ["Three.js", "WebGL Shaders", "Framer Motion", "GLTF Rigging"],
  },
];

const SECTION_NAMES = ["Hello", "Beliefs", "About", "Work", "Skills", "Contact"];

export default function V6Experience() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);

  // Active section index (0 to 5)
  const [activeSection, setActiveSection] = useState(0);
  const activeSectionRef = useRef(0);
  activeSectionRef.current = activeSection;

  // Active belief card index in Beliefs section (0, 1, 2)
  const [activeBelief, setActiveBelief] = useState(0);

  // Active project index in Work section (0, 1, 2)
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const activeProjectRef = useRef(0);
  activeProjectRef.current = activeProjectIdx;

  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showAsciiCard, setShowAsciiCard] = useState(false);

  // Section navigation trigger
  const goToSection = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(SECTION_NAMES.length - 1, idx));
    setActiveSection(clamped);
    setMenuOpen(false);
  }, []);

  // Time ticker
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const update = () => setTimeStr(formatter.format(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Preloader counter
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.max(1.2, (100 - p) * 0.09);
      if (p >= 99.5) {
        setLoadingPercent(100);
        setIsReady(true);
        clearInterval(interval);
      } else {
        setLoadingPercent(Math.floor(p));
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Copy email handler
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("vaidicdevelops@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      window.location.href = "mailto:vaidicdevelops@gmail.com";
    }
  };

  // Wheel-based smooth section snapping
  useEffect(() => {
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelTime < 600) return; // Debounce 600ms for clean single-screen landing

      if (e.deltaY > 35) {
        lastWheelTime = now;
        goToSection(activeSectionRef.current + 1);
      } else if (e.deltaY < -35) {
        lastWheelTime = now;
        goToSection(activeSectionRef.current - 1);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToSection(activeSectionRef.current + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToSection(activeSectionRef.current - 1);
      }
      if (activeSectionRef.current === 3) {
        if (e.key === "ArrowRight") {
          setActiveProjectIdx((prev) => (prev + 1) % PROJECTS.length);
        }
        if (e.key === "ArrowLeft") {
          setActiveProjectIdx((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
        }
      }
    };

    // Touch swipe navigation
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goToSection(activeSectionRef.current + 1);
        else goToSection(activeSectionRef.current - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goToSection]);

  // Three.js & Background Blob Setup
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const glCanvas = glCanvasRef.current;
    if (!bgCanvas || !glCanvas) return;

    let isDisposed = false;

    // -------------------------------------------------------------
    // 1. BG MULTI-GRADIENT NOISE BLOB SHADER
    // -------------------------------------------------------------
    const r2 = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
    r2.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const s2 = new THREE.Scene();
    const c2 = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    c2.position.z = 11;

    const onResize2 = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      r2.setSize(w, h);
      c2.aspect = w / h;
      c2.updateProjectionMatrix();
    };
    onResize2();
    window.addEventListener("resize", onResize2);

    const blobUniforms = {
      uT: { value: 0 },
      uAmp: { value: 0.26 },
      uFreq: { value: 0.95 },
      uMS: { value: 0 },
      uM: { value: new THREE.Vector3() },
      uK: { value: new THREE.Vector3(1, 1, 1) },
      uA: { value: new THREE.Color("#ff5a3c") },
      uB: { value: new THREE.Color("#7c3aed") },
      uC: { value: new THREE.Color("#0ea5e9") },
    };

    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 48),
      new THREE.ShaderMaterial({
        uniforms: blobUniforms,
        vertexShader: `
          uniform float uT, uAmp, uFreq, uMS;
          uniform vec3 uM, uK;
          varying vec3 vN, vP, vL;
          void main(){
            vec3 p = position, n = normalize(p);
            float a = p.x * uFreq + uT;
            float b = p.y * uFreq * 1.2 + uT * 1.3;
            float c = p.z * uFreq * 0.9 + uT * 0.8;
            float d = uAmp * (sin(a) + sin(b) + sin(c)) * 0.95 + uAmp * 0.45 * sin((p.x + p.y) * uFreq * 1.7 + uT * 1.9);
            vec3 g = uAmp * 0.95 * vec3(uFreq * cos(a), uFreq * 1.2 * cos(b), uFreq * 0.9 * cos(c));
            vec3 nn = normalize(n - (g - n * dot(g, n)) * 0.5);
            vec3 q = (p + n * d) * uK;
            vec4 wp = modelMatrix * vec4(q, 1.0);
            vec3 wn = normalize(mat3(modelMatrix) * nn);
            vec2 dm = uM.xy - wp.xy;
            float dd = length(dm);
            float push = (1.0 - smoothstep(0.0, 3.5, dd)) * uMS * smoothstep(-0.3, 0.5, wn.z);
            wp.xyz += wn * push * 0.7;
            wp.xy += dm * push * 0.18;
            vN = normalize(mat3(viewMatrix) * wn);
            vL = q;
            vec4 mv = viewMatrix * wp;
            vP = mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uA, uB, uC;
          uniform float uT;
          varying vec3 vN, vP, vL;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main(){
            vec3 n = normalize(vN), v = normalize(-vP);
            float f = pow(1.0 - max(dot(n, v), 0.0), 2.2);
            float k = clamp(vL.y * 0.22 + 0.5 + 0.25 * sin(vL.x * 0.8 + uT * 0.45) + n.x * 0.15, 0.0, 1.0);
            vec3 col = mix(uA, uB, smoothstep(0.0, 0.55, k));
            col = mix(col, uC, smoothstep(0.45, 1.0, k));
            vec3 l = normalize(vec3(0.4, 0.75, 0.6));
            float df = max(dot(n, l), 0.0);
            col *= 0.68 + 0.48 * df;
            col += uA * f * 0.45;
            float s = pow(max(dot(reflect(-l, n), v), 0.0), 30.0);
            col += vec3(s) * 0.38;
            col += (h(gl_FragCoord.xy) - 0.5) / 150.0;
            gl_FragColor = vec4(col, 0.94);
          }
        `,
      })
    );
    s2.add(blob);

    // Dynamic Multi-Color Section Keyframes (Hero, Beliefs, About, Work, Skills, Contact)
    const SECTION_BLOB_CONFIG = [
      // 0: Hello - Electric Coral + Deep Violet + Ocean Cyan
      { x: 3.4, y: 0.1, s: 1.15, a: "#ff5a3c", b: "#7c3aed", c: "#0284c7" },
      // 1: Beliefs - Amber Gold + Neon Magenta + Indigo
      { x: -3.5, y: 0.2, s: 1.1, a: "#f59e0b", b: "#db2777", c: "#4f46e5" },
      // 2: About - Electric Coral + Wine Rose + Deep Navy
      { x: 3.5, y: -0.2, s: 1.15, a: "#ff4d1c", b: "#9333ea", c: "#1e1b4b" },
      // 3: Work - Electric Violet + Cyan + Orange Accent
      { x: 2.2, y: 0.0, s: 1.2, a: "#6366f1", b: "#06b6d4", c: "#ff5a3c" },
      // 4: Skills - Emerald/Teal + Purple + Coral
      { x: -2.8, y: -0.4, s: 1.1, a: "#0d9488", b: "#8b5cf6", c: "#f43f5e" },
      // 5: Contact - Deep Royal Violet + Electric Coral + Sapphire
      { x: -3.2, y: 0.8, s: 1.25, a: "#7c3aed", b: "#ff5a3c", c: "#1d4ed8" },
    ];

    // -------------------------------------------------------------
    // 2. MAIN THREE.JS STAGE (#gl Canvas, z-index 30)
    // -------------------------------------------------------------
    const r1 = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true });
    r1.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r1.toneMapping = THREE.ACESFilmicToneMapping;
    r1.toneMappingExposure = 1.18;
    r1.outputColorSpace = THREE.SRGBColorSpace;

    const s1 = new THREE.Scene();
    const c1 = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    c1.position.z = 11;

    const onResize1 = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      r1.setSize(w, h);
      c1.aspect = w / h;
      c1.updateProjectionMatrix();
    };
    onResize1();
    window.addEventListener("resize", onResize1);

    // Studio Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.3);
    s1.add(amb);
    const kl = new THREE.DirectionalLight(0xfff3e6, 2.0);
    kl.position.set(4, 5, 6);
    s1.add(kl);
    const orangeRim = new THREE.PointLight(0xff551c, 3.8, 30);
    orangeRim.position.set(-5, 2, -2);
    s1.add(orangeRim);
    const blueRim = new THREE.PointLight(0x6366f1, 3.2, 30);
    blueRim.position.set(5, -1, -2);
    s1.add(blueRim);

    // Particle dust (descending depth effect)
    const DUST_COUNT = 700;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 24;
      dustPos[i * 3 + 1] = -50 + Math.random() * 60;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustPts = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ size: 0.065, transparent: true, opacity: 0.6, color: 0xff6b3d })
    );
    s1.add(dustPts);

    // Avatar Root Group
    const avatarGroup = new THREE.Group();
    s1.add(avatarGroup);

    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;
    const baseHeadRot = new THREE.Euler();
    const baseNeckRot = new THREE.Euler();
    const baseSpineRot = new THREE.Euler();

    interface MorphBlinkMesh {
      mesh: THREE.Mesh;
      leftIdx: number;
      rightIdx: number;
    }
    const blinkMeshes: MorphBlinkMesh[] = [];

    // Dynamically load GLTF model on client
    import("three/examples/jsm/loaders/GLTFLoader.js").then(({ GLTFLoader }) => {
      if (isDisposed) return;
      const loader = new GLTFLoader();
      loader.load(
        "/models/model.glb",
        (gltf) => {
          if (isDisposed) return;
          const avatar = gltf.scene;

          avatar.traverse((child) => {
            if (child.name === "outfit_bottom" || child.name === "outfit_shoes") {
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
              if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                const lB = mesh.morphTargetDictionary["eyeBlinkLeft"];
                const rB = mesh.morphTargetDictionary["eyeBlinkRight"];
                if (lB !== undefined || rB !== undefined) {
                  blinkMeshes.push({ mesh, leftIdx: lB ?? -1, rightIdx: rB ?? -1 });
                }
              }
            }
          });

          headBone = avatar.getObjectByName("Head") || null;
          neckBone = avatar.getObjectByName("Neck") || null;
          spineBone =
            avatar.getObjectByName("Spine2") ||
            avatar.getObjectByName("Spine1") ||
            avatar.getObjectByName("Spine") ||
            null;

          // Apply tuned finger & wrist calibrations
          Object.entries(FOLDED_ARMS_POSE).forEach(([boneName, q]) => {
            const bone = avatar.getObjectByName(boneName);
            if (bone) bone.quaternion.set(q[0], q[1], q[2], q[3]);
          });

          // Crossed-arm IK solver
          const leftArm = avatar.getObjectByName("LeftArm") ?? null;
          const leftForeArm = avatar.getObjectByName("LeftForeArm") ?? null;
          const leftHand = avatar.getObjectByName("LeftHand") ?? null;
          const rightArm = avatar.getObjectByName("RightArm") ?? null;
          const rightForeArm = avatar.getObjectByName("RightForeArm") ?? null;
          const rightHand = avatar.getObjectByName("RightHand") ?? null;

          aimBoneSegment(avatar, leftArm, leftForeArm, new THREE.Vector3(0.19, 1.23, 0.12));
          aimBoneSegment(avatar, leftForeArm, leftHand, new THREE.Vector3(-0.04, 1.26, 0.17));
          aimBoneSegment(avatar, rightArm, rightForeArm, new THREE.Vector3(-0.19, 1.23, 0.12));
          aimBoneSegment(avatar, rightForeArm, rightHand, new THREE.Vector3(0.04, 1.26, 0.11));

          avatar.updateMatrixWorld(true);

          if (headBone) baseHeadRot.copy(headBone.rotation);
          if (neckBone) baseNeckRot.copy(neckBone.rotation);
          if (spineBone) baseSpineRot.copy(spineBone.rotation);

          // Calibrated scale & position
          const avatarScale = 5.5;
          avatar.scale.setScalar(avatarScale);
          avatar.position.set(0, -1.65 * avatarScale + 1.5, 0);

          avatarGroup.add(avatar);
        },
        undefined,
        (err) => console.warn("Failed to load /models/model.glb:", err)
      );
    });

    // -------------------------------------------------------------
    // 3. 3D PROJECT RING (Work Section)
    // -------------------------------------------------------------
    const ringGroup = new THREE.Group();
    s1.add(ringGroup);
    ringGroup.scale.setScalar(0.001);

    const makeCardTexture = (index: number) => {
      const c = document.createElement("canvas");
      c.width = 800;
      c.height = 600;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);

      const gradients = [
        ["#0f172a", "#1e3a8a"],
        ["#1c1917", "#44403c"],
        ["#18181b", "#27272a"],
      ];
      const gr = ctx.createLinearGradient(0, 0, 800, 600);
      gr.addColorStop(0, gradients[index][0]);
      gr.addColorStop(1, gradients[index][1]);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 800, 600);

      // Card mock UI
      ctx.fillStyle = "#ff4d1c";
      ctx.fillRect(60, 50, 680, 8);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText(PROJECTS[index].title, 60, 110);

      ctx.fillStyle = "#ff551c";
      ctx.font = "600 20px monospace";
      ctx.fillText(PROJECTS[index].tag.toUpperCase(), 60, 150);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "400 22px sans-serif";
      const words = PROJECTS[index].desc.split(" ");
      let line = "";
      let y = 210;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > 680) {
          ctx.fillText(line, 60, y);
          line = w + " ";
          y += 34;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, 60, y);

      ctx.fillStyle = "rgba(255, 77, 28, 0.15)";
      ctx.strokeStyle = "#ff4d1c";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(60, 480, 200, 50, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "600 18px monospace";
      ctx.fillText("TECH STACK ↗", 95, 512);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const panels: THREE.Mesh[] = [];
    [0, 1, 2].forEach((i) => {
      const sideMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      const frontMat = new THREE.MeshBasicMaterial({ map: makeCardTexture(i) });
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 2.33, 0.08),
        [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]
      );
      const angle = (i * Math.PI * 2) / 3;
      m.position.set(Math.sin(angle) * 2.7, 0, Math.cos(angle) * 2.7);
      m.rotation.y = angle;
      m.userData.a = angle;
      ringGroup.add(m);
      panels.push(m);
    });

    // -------------------------------------------------------------
    // 4. ANIMATION LOOP (Driven by activeSection)
    // -------------------------------------------------------------
    let nx = 0;
    let ny = 0;
    const onPointerMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove);

    let ax = -2.85;
    let ay = -0.1;
    let as = 1.05;
    let ringScale = 0;
    let ringRot = 0;
    const clock = new THREE.Clock();
    let animId: number;

    const lerpColorA = new THREE.Color();
    const lerpColorB = new THREE.Color();
    const lerpColorC = new THREE.Color();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const t = clock.elapsedTime;
      const isMobile = window.innerWidth < 800;
      const currentSec = activeSectionRef.current;
      const curProjIdx = activeProjectRef.current;

      // Particle dust drift
      dustPts.position.y = (currentSec / 5) * 40;

      // -----------------------------------------------------------
      // Avatar Coordinates Per Section
      // [gx, gy, gs]
      // -----------------------------------------------------------
      let gx = -2.85;
      let gy = -0.1;
      let gs = 1.05;

      if (currentSec === 0) {
        // Hello / Hero: Left stage, standing proudly
        gx = isMobile ? 0 : -2.85;
        gy = isMobile ? 1.4 : -0.1;
        gs = isMobile ? 0.85 : 1.08;
      } else if (currentSec === 1) {
        // Beliefs: Steps gracefully to the left, invisible
        gx = -4.5;
        gy = -0.1;
        gs = 0.001;
      } else if (currentSec === 2) {
        // About: Beautifully framed on the left of About
        gx = isMobile ? 0 : -2.85;
        gy = isMobile ? 1.4 : -0.1;
        gs = isMobile ? 0.85 : 1.05;
      } else if (currentSec === 3) {
        // Work: Steps out completely so 3D project ring has the stage
        gx = 4.5;
        gy = -0.1;
        gs = 0.001;
      } else if (currentSec === 4) {
        // Skills: Invisible, skills matrix spans the full layout
        gx = 4.5;
        gy = -0.1;
        gs = 0.001;
      } else {
        // Contact: ENLARGED at the bottom right corner, away from the email!
        // On desktop: gx = 2.6, gy = -2.4 (lower torso hidden, large bust peeking up)
        gx = isMobile ? 0 : 2.6;
        gy = isMobile ? -3.2 : -2.35;
        gs = isMobile ? 0.9 : 1.35;
      }

      ax += (gx - ax) * 0.07;
      ay += (gy - ay) * 0.07;
      as += (gs - as) * 0.07;

      avatarGroup.position.set(ax, ay, 0);
      avatarGroup.scale.setScalar(Math.max(as, 0.001));
      avatarGroup.visible = as > 0.03;

      // Cursor yaw & pitch tracking
      const yaw = (nx - ax / 6.5) * 0.55;
      const pit = (ny - 0.1) * 0.25;

      if (avatarGroup.visible) {
        if (spineBone) {
          spineBone.rotation.x += (baseSpineRot.x + pit * 0.08 - spineBone.rotation.x) * 0.05;
          spineBone.rotation.y += (baseSpineRot.y + yaw * 0.12 - spineBone.rotation.y) * 0.05;
        }
        if (neckBone) {
          neckBone.rotation.y += (baseNeckRot.y + yaw * 0.22 - neckBone.rotation.y) * 0.07;
          neckBone.rotation.x += (baseNeckRot.x + pit * 0.16 - neckBone.rotation.x) * 0.07;
        }
        if (headBone) {
          headBone.rotation.y += (baseHeadRot.y + yaw * 0.5 - headBone.rotation.y) * 0.09;
          headBone.rotation.x += (baseHeadRot.x + pit * 0.35 - headBone.rotation.x) * 0.09;
        }

        // Natural eyelid blinking
        const blinkCycle = t % 3.8;
        const isBlinking = blinkCycle > 3.65;
        const blinkWeight = isBlinking ? Math.sin(((blinkCycle - 3.65) / 0.15) * Math.PI) : 0;
        blinkMeshes.forEach(({ mesh, leftIdx, rightIdx }) => {
          if (mesh.morphTargetInfluences) {
            if (leftIdx >= 0) mesh.morphTargetInfluences[leftIdx] = blinkWeight;
            if (rightIdx >= 0) mesh.morphTargetInfluences[rightIdx] = blinkWeight;
          }
        });
      }

      // Work section Project Ring animation
      const targetRingScale = currentSec === 3 ? (isMobile ? 0.6 : 1.0) : 0;
      ringScale += (targetRingScale - ringScale) * 0.08;
      ringGroup.scale.setScalar(Math.max(ringScale, 0.001));
      ringGroup.position.set(isMobile ? 0 : 1.7, isMobile ? 1.4 : -0.1, -1);
      ringGroup.visible = ringScale > 0.02;

      const targetRot = -curProjIdx * ((Math.PI * 2) / 3);
      ringRot += (targetRot - ringRot) * 0.06;
      ringGroup.rotation.y = ringRot;
      panels.forEach((pMesh, i) => {
        pMesh.position.y = Math.sin(t * 1.1 + i * 2) * 0.08;
      });

      // -----------------------------------------------------------
      // Background Blob Gradient Lerping
      // -----------------------------------------------------------
      const curBlobCfg = SECTION_BLOB_CONFIG[currentSec] || SECTION_BLOB_CONFIG[0];
      blob.position.x += (curBlobCfg.x - blob.position.x) * 0.05;
      blob.position.y += (curBlobCfg.y - blob.position.y) * 0.05;
      const targetBlobScale = isMobile ? curBlobCfg.s * 0.75 : curBlobCfg.s;
      blob.scale.setScalar(
        blob.scale.x + (targetBlobScale - blob.scale.x) * 0.05
      );
      blob.rotation.set(ny * 0.2 + Math.sin(t * 0.2) * 0.2, t * 0.1 + nx * 0.35, 0);

      lerpColorA.set(curBlobCfg.a);
      lerpColorB.set(curBlobCfg.b);
      lerpColorC.set(curBlobCfg.c);
      blobUniforms.uA.value.lerp(lerpColorA, 0.05);
      blobUniforms.uB.value.lerp(lerpColorB, 0.05);
      blobUniforms.uC.value.lerp(lerpColorC, 0.05);
      blobUniforms.uT.value = t * 0.55;

      r2.render(s2, c2);
      r1.render(s1, c1);
    };

    loop();

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", onResize1);
      window.removeEventListener("resize", onResize2);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(animId);
      r1.dispose();
      r2.dispose();
    };
  }, []);

  const activeProj = PROJECTS[activeProjectIdx];

  // Beliefs data for section 1
  const BELIEFS = [
    {
      num: "01",
      title: "Fast under load.",
      desc: "Large tables, live data and dense dashboards that still feel instant and responsive.",
      metric: "80K+ rows rendered smoothly in a single view",
      color: "from-amber-500/20 to-orange-500/10",
      accent: "text-amber-400",
    },
    {
      num: "02",
      title: "Fuzzy to clear.",
      desc: "I sit with stakeholders until a vague request becomes a spec worth building, then ship it with care.",
      metric: "500+ businesses use the product features I helped build",
      color: "from-purple-500/20 to-pink-500/10",
      accent: "text-purple-400",
    },
    {
      num: "03",
      title: "Craft you feel.",
      desc: "Pixel-accurate layouts, purposeful motion, accessible semantics and zero layout shifts down to the data layer.",
      metric: "~40% fewer redundant API calls after an architecture refactor",
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-cyan-400",
    },
  ];

  return (
    <div className={`relative h-screen w-screen bg-[#09090b] text-[#f4f4f5] selection:bg-[#ff4d1c] selection:text-white overflow-hidden font-sans ${isReady ? "ready" : ""}`}>
      
      {/* 1. Preloader Overlay */}
      <div
        id="ld"
        className={`fixed inset-0 z-50 bg-[#09090b] text-[#f4f4f5] flex flex-col justify-end p-8 sm:p-14 transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          isReady ? "-translate-y-full pointer-events-none" : "translate-y-0"
        }`}
      >
        <p className="text-zinc-500 font-mono text-sm tracking-wider uppercase mb-2">
          Setting up the stage
        </p>
        <b className="font-extrabold text-[clamp(80px,20vw,260px)] leading-[0.8] tracking-tighter text-white">
          {loadingPercent}%
        </b>
      </div>

      {/* 2. Background Blob Shader Canvas (Multi-color dynamic gradient) */}
      <canvas
        id="bg"
        ref={bgCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* 3. Film Grain Overlay (z: 1) */}
      <div id="gr" aria-hidden="true" className="fixed inset-[-60%] z-[1] pointer-events-none" />

      {/* 4. Giant Hero Name (Only visible in Hello section 0) */}
      <h1
        id="nm"
        aria-label="Vaidic Jain"
        className={`fixed inset-x-0 z-[2] text-center font-extrabold text-[min(19vw,28vh)] leading-[0.85] tracking-tighter uppercase pointer-events-none text-white/90 select-none transition-opacity duration-700 ${
          activeSection === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="fixed left-0 right-0 top-[11vh] block overflow-hidden">
          {["V", "a", "i", "d", "i", "c"].map((char, i) => (
            <i key={i} style={{ transitionDelay: `${i * 0.07 + 0.2}s` }}>
              {char}
            </i>
          ))}
        </span>
        <span className="fixed left-0 right-0 bottom-[6vh] block overflow-hidden">
          {["J", "a", "i", "n"].map((char, i) => (
            <i key={i} style={{ transitionDelay: `${(i + 6) * 0.07 + 0.2}s` }}>
              {char}
            </i>
          ))}
          <b className="inline-block w-[0.14em] h-[0.14em] rounded-[32%] bg-[#ff4d1c] ml-[0.05em]" />
        </span>
      </h1>

      {/* 5. 3D WebGL Canvas (HIGHEST Z-INDEX = 30, pointer-events: none) */}
      <canvas
        id="gl"
        ref={glCanvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full z-[30] pointer-events-none"
      />

      {/* 6. Section Progress Indicator & Depth (bottom left) */}
      <div
        id="dp"
        aria-hidden="true"
        className="fixed left-6 sm:left-10 bottom-[4vh] z-40 font-mono text-xs sm:text-sm text-zinc-400 flex items-center gap-3 select-none"
      >
        <span className="text-zinc-500">0{activeSection + 1} / 06</span>
        <span className="text-white font-semibold">{SECTION_NAMES[activeSection]}</span>
        <i className="inline-block w-12 h-[2px] bg-zinc-700" />
      </div>

      {/* Side Dot Navigation */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {SECTION_NAMES.map((name, i) => (
          <button
            key={name}
            onClick={() => goToSection(i)}
            aria-label={`Go to ${name}`}
            className="group flex items-center justify-end gap-2 text-right"
          >
            <span className="opacity-0 group-hover:opacity-100 text-xs font-mono text-zinc-400 transition-opacity">
              {name}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeSection === i
                  ? "bg-[#ff4d1c] scale-125 shadow-[0_0_8px_#ff4d1c]"
                  : "bg-zinc-700 group-hover:bg-zinc-500"
              }`}
            />
          </button>
        ))}
      </div>

      {/* 7. Floating Menu Button (bottom right, z: 50) */}
      <button
        id="mb"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-controls="mn"
        className="fixed right-6 sm:right-10 bottom-[4vh] z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff4d1c] hover:bg-[#ff5f33] text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-xl shadow-[#ff4d1c]/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {menuOpen ? "Close" : "Menu"}
      </button>

      {/* 8. Fullscreen Expanding Circular Menu (z: 45) */}
      <nav
        id="mn"
        aria-label="Menu"
        className={`fixed inset-0 z-45 bg-[#09090b]/98 text-white flex flex-col justify-center px-8 sm:px-20 transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          menuOpen ? "open pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="space-y-3 sm:space-y-4 max-w-4xl">
          {SECTION_NAMES.map((name, idx) => (
            <a
              key={name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToSection(idx);
              }}
              className="block font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tighter hover:text-[#ff4d1c] hover:translate-x-4 transition-all duration-300"
            >
              {name}
            </a>
          ))}
        </div>
        <p className="mt-12 text-sm font-mono text-zinc-500">
          vaidicdevelops@gmail.com · Bhopal, India · <span>{timeStr}</span> IST
        </p>
      </nav>

      {/* ========================================================= */}
      {/* 9. MAIN SECTIONS CONTAINER (SNAP SCREEN VIEWS)           */}
      {/* ========================================================= */}
      <div className="relative w-full h-full z-10">
        <AnimatePresence mode="wait">
          
          {/* SECTION 0: HELLO / HERO */}
          {activeSection === 0 && (
            <motion.section
              key="sec-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-14 flex flex-col justify-end items-start pointer-events-none"
            >
              <div className="w-full flex justify-between items-end gap-5">
                <span className="flex items-center gap-3 font-semibold text-sm sm:text-base text-zinc-300">
                  <i className="block w-[2px] h-11 bg-[#ff4d1c]" />
                  Scroll down or use arrow keys to navigate
                </span>
              </div>

              <p className="fixed left-6 sm:left-14 top-[46vh] max-w-[280px] font-sans text-sm sm:text-base text-zinc-300 pointer-events-none leading-relaxed">
                Frontend engineer building fast, thoughtful interfaces, and growing into the one who ships the whole product.
              </p>

              <p className="fixed right-6 sm:right-14 top-[46vh] text-right font-sans text-sm sm:text-base text-zinc-300 pointer-events-none leading-relaxed">
                <span className="inline-block w-2 h-2 rounded-full bg-[#3dff7a] mr-2 animate-pulse" />
                Open to new roles
                <br />
                Software engineer
                <br />
                Bhopal, India
              </p>
            </motion.section>
          )}

          {/* SECTION 1: BELIEFS (INTERACTIVE 3 CARDS WITH SMOOTH TABS) */}
          {activeSection === 1 && (
            <motion.section
              key="sec-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-16 flex flex-col justify-center items-center pointer-events-auto"
            >
              <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#ff4d1c] font-semibold">
                    Core Engineering Beliefs
                  </span>
                  <div className="flex gap-2">
                    {BELIEFS.map((b, i) => (
                      <button
                        key={b.num}
                        onClick={() => setActiveBelief(i)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                          activeBelief === i
                            ? "bg-[#ff4d1c] text-white"
                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {b.num}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBelief}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.4 }}
                    className={`p-8 sm:p-14 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 shadow-2xl bg-gradient-to-br ${BELIEFS[activeBelief].color}`}
                  >
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                      Principle {BELIEFS[activeBelief].num}
                    </span>
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white">
                      {BELIEFS[activeBelief].title}
                    </h2>
                    <p className="text-lg sm:text-2xl text-zinc-300 mt-6 max-w-2xl leading-relaxed">
                      {BELIEFS[activeBelief].desc}
                    </p>
                    <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#ff4d1c]" />
                      <span className={`font-mono text-sm sm:text-base font-semibold ${BELIEFS[activeBelief].accent}`}>
                        {BELIEFS[activeBelief].metric}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* SECTION 2: ABOUT */}
          {activeSection === 2 && (
            <motion.section
              key="sec-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-14 flex items-center justify-end pointer-events-auto"
            >
              <div className="col in w-full lg:max-w-[700px] bg-zinc-950/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl">
                <div className="font-mono text-xs text-[#ff4d1c] tracking-widest uppercase mb-3 font-semibold">
                  01 — About
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95] text-white">
                  Engineer first.
                  <br />
                  <em className="not-italic text-[#ff4d1c]">Problem-solver</em> always.
                </h2>
                <p className="lead2 text-sm sm:text-base text-zinc-300 mt-4 leading-relaxed font-normal">
                  I’m a software engineer from Bhopal who owns features from the first conversation to the shipped release, shaping the spec with the people who’ll use it and then building it. I like interfaces that stay fast and clear under real load, and I’m growing toward the backend so I can take an idea from napkin to reliable product on my own.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-800/80">
                  <div>
                    <small className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                      BASED IN
                    </small>
                    <span className="text-sm font-semibold text-zinc-200">Bhopal, India</span>
                  </div>
                  <div>
                    <small className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                      FOCUS
                    </small>
                    <span className="text-sm font-semibold text-zinc-200">React · Next.js · TypeScript</span>
                  </div>
                  <div>
                    <small className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                      GROWING INTO
                    </small>
                    <span className="text-sm font-semibold text-zinc-200">FastAPI · Node.js · PostgreSQL</span>
                  </div>
                  <div>
                    <small className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                      OFF THE KEYBOARD
                    </small>
                    <span className="text-sm font-semibold text-zinc-200">Motorbikes, snooker, hikes & adventure sports</span>
                  </div>
                </div>

                {/* Photo Cards & ASCII Developer Profile */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <figure className="relative rounded-xl overflow-hidden h-24 sm:h-28 border border-zinc-800">
                    <img
                      src="/images/bike.jpeg"
                      alt="Riding"
                      className="w-full h-full object-cover"
                    />
                    <figcaption className="absolute left-2 bottom-2 bg-black/80 text-white px-2 py-0.5 rounded-full text-[11px] font-mono">
                      Riding
                    </figcaption>
                  </figure>

                  <figure className="relative rounded-xl overflow-hidden h-24 sm:h-28 border border-zinc-800">
                    <img
                      src="/images/portrait.jpeg"
                      alt="Golden hour"
                      className="w-full h-full object-cover"
                    />
                    <figcaption className="absolute left-2 bottom-2 bg-black/80 text-white px-2 py-0.5 rounded-full text-[11px] font-mono">
                      Golden hour
                    </figcaption>
                  </figure>

                  <figure
                    onClick={() => setShowAsciiCard(true)}
                    className="relative rounded-xl overflow-hidden h-24 sm:h-28 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer group transition-colors"
                  >
                    <img
                      src="/images/dark.svg"
                      alt="ASCII Developer Card"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <figcaption className="absolute left-2 bottom-2 bg-black/90 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[11px] font-mono flex items-center gap-1">
                      ASCII Card ↗
                    </figcaption>
                  </figure>
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 3: WORK / PROJECTS (CLEAN, NO OVERLAPS, 3D RING ACTIVE) */}
          {activeSection === 3 && (
            <motion.section
              key="sec-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-14 flex items-center justify-start pointer-events-auto"
            >
              <div className="col in w-full sm:max-w-[500px] bg-zinc-950/85 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-5xl sm:text-7xl tracking-tighter leading-none text-white">
                    0{activeProjectIdx + 1}
                    <span className="opacity-40 text-2xl sm:text-3xl ml-1">/03</span>
                  </div>
                  <div className="flex gap-2">
                    {PROJECTS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveProjectIdx(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          activeProjectIdx === i ? "bg-[#ff4d1c] scale-125" : "bg-zinc-700"
                        }`}
                        aria-label={`Project ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProjectIdx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-4 text-white">
                      {activeProj.title}
                    </h3>
                    <div className="font-mono text-xs text-[#ff4d1c] font-semibold mt-1">
                      {activeProj.tag}
                    </div>
                    <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                      {activeProj.desc}
                    </p>

                    <dl className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2 text-xs sm:text-sm">
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="text-zinc-500 font-mono">Built</dt>
                        <dd className="text-zinc-200">{activeProj.built}</dd>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <dt className="text-zinc-500 font-mono">Stack</dt>
                        <dd className="text-zinc-200 font-mono text-xs">{activeProj.stack}</dd>
                      </div>
                    </dl>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-800/60 font-mono text-xs font-semibold">
                  <a
                    href={activeProj.demo}
                    className="text-[#ff4d1c] hover:underline"
                  >
                    Live demo ↗
                  </a>
                  <a
                    href={activeProj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white"
                  >
                    Source ↗
                  </a>

                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() =>
                        setActiveProjectIdx((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length)
                      }
                      aria-label="Previous project"
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() =>
                        setActiveProjectIdx((prev) => (prev + 1) % PROJECTS.length)
                      }
                      aria-label="Next project"
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 4: SKILLS MATRIX (DEDICATED FULL-SCREEN SECTION, NEVER HIDDEN) */}
          {activeSection === 4 && (
            <motion.section
              key="sec-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-16 flex flex-col justify-center items-center pointer-events-auto"
            >
              <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#ff4d1c] font-semibold">
                    Core Technical Capabilities
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    Front-to-back craftsmanship
                  </span>
                </div>

                <div className="space-y-3">
                  {SKILLS.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="p-5 sm:p-6 rounded-2xl bg-zinc-950/75 backdrop-blur-xl border border-zinc-800/80 hover:border-zinc-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="max-w-xl">
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                          {skill.title}
                        </h3>
                        <p className="text-zinc-400 text-sm mt-1">
                          {skill.desc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {skill.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 5: CONTACT (AVATAR AT BOTTOM RIGHT, FULL EMAIL VISIBILITY) */}
          {activeSection === 5 && (
            <motion.section
              key="sec-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 sm:p-14 flex items-center justify-start pointer-events-auto"
            >
              <div className="in w-full max-w-2xl bg-zinc-950/85 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-zinc-800 shadow-2xl z-20">
                <span className="font-mono text-xs text-[#ff4d1c] uppercase tracking-widest block mb-2 font-semibold">
                  03 — Get in Touch
                </span>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-white max-w-lg">
                  Got a problem worth solving?
                </h2>

                <button
                  onClick={handleCopyEmail}
                  className="flex items-center gap-4 flex-wrap my-8 text-2xl sm:text-4xl font-extrabold tracking-tight border-b-2 border-white pb-3 hover:text-[#ff4d1c] hover:border-[#ff4d1c] transition-colors cursor-pointer group text-left"
                >
                  <span className="text-white group-hover:text-[#ff4d1c] transition-colors">
                    vaidicdevelops@gmail.com
                  </span>
                  <em className="not-italic text-xs sm:text-sm font-mono px-3.5 py-1.5 rounded-full bg-[#ff4d1c] text-white font-semibold group-hover:scale-105 transition-transform">
                    {copiedEmail ? "Copied ✓" : "Copy email"}
                  </em>
                </button>

                <div className="flex flex-wrap gap-8 text-sm font-mono text-zinc-400 pt-4 border-t border-zinc-800/80">
                  <a
                    href="https://www.linkedin.com/in/vaidicjain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#ff4d1c] transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#ff4d1c] transition-colors"
                  >
                    GitHub ↗
                  </a>
                  <span>
                    Bhopal · <span className="text-zinc-200">{timeStr}</span> IST
                  </span>
                </div>
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </div>

      {/* ASCII Developer Card Modal */}
      <AnimatePresence>
        {showAsciiCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAsciiCard(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-6 sm:p-12 flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-black"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-zinc-300 ml-2">vaidic-jain-developer-card.svg</span>
                </span>
                <button
                  onClick={() => setShowAsciiCard(false)}
                  className="px-2 py-1 hover:text-white transition-colors"
                >
                  ✕ Close
                </button>
              </div>
              <img
                src="/images/dark.svg"
                alt="Vaidic Jain Developer Profile"
                className="w-full h-auto object-contain block"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
