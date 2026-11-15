"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [scrollDepth, setScrollDepth] = useState(38);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const depth = Math.round(38 + progress * 140);
      setScrollDepth(depth);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="top"
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 px-6 sm:px-10 lg:px-16"
    >
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        
        {/* Left Column: Dedicated stage area for the 3D Avatar (Rendered in Scene3D canvas) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[480px] sm:min-h-[560px] lg:min-h-[680px] relative pointer-events-none">
          {/* Status pill floating directly above model */}
          <div className="pt-2 pointer-events-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 backdrop-blur-md shadow-lg shadow-black/50">
              <span className="w-2 h-2 rounded-full bg-[#3dff7a] shadow-[0_0_8px_#3dff7a] animate-pulse" />
              <span>Open to new roles</span>
            </div>
          </div>

          {/* Spacer where the 3D model stands freely against the clean dark background */}
          <div className="flex-1" aria-hidden="true" />

          {/* Bottom Depth indicator matching the sample design */}
          <div className="pb-2 font-mono text-xs tracking-wider text-zinc-500 uppercase pointer-events-auto">
            Depth <span className="text-zinc-200 font-semibold">{scrollDepth} m</span>
          </div>
        </div>

        {/* Right Column: Hero Typography & Bio matching sample design */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8 z-10">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-[84px] font-extrabold tracking-tight leading-[0.94] text-white select-none">
            <span className="block text-white">Engineer</span>
            <span className="block text-[#ff4d1c]">first.</span>
            <span className="block text-[#ff4d1c]">Problem-</span>
            <span className="block text-white">solver</span>
            <span className="block text-white">always.</span>
          </h1>

          {/* Lead Bio */}
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl font-normal">
            I’m a software engineer from Bhopal who owns features from the first conversation to the shipped release, shaping the spec with the people who’ll use it and then building it. I like interfaces that stay fast and clear under real load, and I’m growing toward the backend so I can take an idea from napkin to reliable product on my own.
          </p>

          {/* 4-Item Metadata Grid with clean dark dividers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/80">
            <div>
              <span className="block text-[11px] font-mono tracking-widest uppercase text-[#ff4d1c] mb-1.5 font-semibold">
                BASED IN
              </span>
              <span className="text-sm sm:text-base font-medium text-zinc-100">
                Bhopal, India
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-mono tracking-widest uppercase text-[#ff4d1c] mb-1.5 font-semibold">
                FOCUS
              </span>
              <span className="text-sm sm:text-base font-medium text-zinc-100">
                React · Next.js · TypeScript
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-mono tracking-widest uppercase text-[#ff4d1c] mb-1.5 font-semibold">
                GROWING INTO
              </span>
              <span className="text-sm sm:text-base font-medium text-zinc-100">
                FastAPI · Node.js · PostgreSQL
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-mono tracking-widest uppercase text-[#ff4d1c] mb-1.5 font-semibold">
                OFF THE KEYBOARD
              </span>
              <span className="text-sm sm:text-base font-medium text-zinc-100">
                Motorbikes, snooker, hikes & racket sports
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
