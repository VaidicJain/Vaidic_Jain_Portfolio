"use client";

import dynamic from "next/dynamic";

// Dynamically import V6Experience with SSR disabled to prevent Three.js SSR bundling issues
const V6Experience = dynamic(() => import("@/components/V6Experience"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative selection:bg-[#ff4d1c] selection:text-white bg-[#09090b]">
      <V6Experience />
    </main>
  );
}
