"use client";

import { useState, useEffect } from "react";

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuItems = [
    { label: "About", href: "#about", num: "01" },
    { label: "Projects", href: "#work", num: "02" },
    { label: "Off-screen", href: "#life", num: "03" },
    { label: "Contact", href: "#contact", num: "04" },
  ];

  return (
    <>
      {/* Floating Menu Button (matching the screenshot) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#ff4d1c] hover:bg-[#ff5f33] text-white font-semibold text-sm sm:text-base flex items-center justify-center shadow-xl shadow-[#ff4d1c]/30 hover:shadow-[#ff4d1c]/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      {/* Fullscreen Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#09090b]/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between p-8 sm:p-16 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full pt-4">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            NAVIGATION
          </span>
          <span className="font-mono text-xs text-[#ff4d1c]">
            VAIDIC JAIN · PORTFOLIO
          </span>
        </div>

        <nav className="max-w-5xl mx-auto w-full py-8">
          <ul className="space-y-4 sm:space-y-6">
            {menuItems.map((item) => (
              <li key={item.num} className="border-b border-zinc-800/80 pb-4">
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-baseline justify-between text-3xl sm:text-5xl lg:text-6xl font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="group-hover:translate-x-3 transition-transform duration-200">
                    {item.label}
                  </span>
                  <span className="font-mono text-sm sm:text-lg text-zinc-600 group-hover:text-[#ff4d1c] transition-colors">
                    ({item.num})
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-5xl mx-auto w-full flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-zinc-500 pt-6 border-t border-zinc-800/60">
          <div className="flex gap-6">
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
            <a
              href="mailto:vaidicdevelops@gmail.com"
              className="hover:text-[#ff4d1c] transition-colors"
            >
              vaidicdevelops@gmail.com ↗
            </a>
          </div>
          <div>Bhopal, India · IST</div>
        </div>
      </div>
    </>
  );
}
