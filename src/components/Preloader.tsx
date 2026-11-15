"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [percent, setPercent] = useState(0);
  const [isOut, setIsOut] = useState(false);

  useEffect(() => {
    let c = 0;
    let animId: number;

    const step = () => {
      c += Math.max(0.8, (100 - c) * 0.05);
      if (c >= 99.5) {
        setPercent(100);
        setTimeout(() => {
          setIsOut(true);
          document.body.classList.add("ready");
        }, 250);
        return;
      }
      setPercent(Math.floor(c));
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div id="ld" className={isOut ? "out" : ""}>
      <b id="ln">{percent}</b>
      <span className="mono">%</span>
    </div>
  );
}
