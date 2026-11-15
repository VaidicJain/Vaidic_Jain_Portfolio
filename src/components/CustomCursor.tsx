"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    window.addEventListener("pointermove", onPointerMove);

    const onPointerEnterInteractive = () => el.classList.add("big");
    const onPointerLeaveInteractive = () => el.classList.remove("big");

    const setupInteractivity = () => {
      const interactives = document.querySelectorAll("a, button, [data-h]");
      interactives.forEach((item) => {
        item.addEventListener("pointerenter", onPointerEnterInteractive);
        item.addEventListener("pointerleave", onPointerLeaveInteractive);
      });
    };

    setupInteractivity();
    const observer = new MutationObserver(setupInteractivity);
    observer.observe(document.body, { childList: true, subtree: true });

    const loop = () => {
      cx += (tx - cx) * 0.25;
      cy += (ty - cy) * 0.25;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return <div id="cu" ref={cursorRef} aria-hidden="true" />;
}
