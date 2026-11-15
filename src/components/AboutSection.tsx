"use client";

import { useEffect, useRef, useState } from "react";

const fillText =
  "I’m a software engineer from Bhopal who lives for the moment a rough idea becomes something you can click. I’ve spent two years inside a fast-moving startup, owning features end-to-end — talking to the people who’d use them, shaping the spec, then building and shipping it. Figuring out what actually needs to exist, before deciding how to build it, is the part I enjoy most.";

export default function AboutSection() {
  const words = fillText.split(/\s+/);
  const fillRef = useRef<HTMLParagraphElement>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = fillRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.3)));
      const count = Math.floor(progress * 1.1 * words.length);
      setActiveCount(count);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [words.length]);

  return (
    <section id="about" className="sec">
      <div className="w ab">
        {/* Empty left column leaves space for the 3D model */}
        <div aria-hidden="true" />

        <div>
          <span className="mono lbl rv">(01) — About</span>
          <h2 className="rv">
            Hi, I’m
            <br />
            Vaidic.
          </h2>

          <p id="fill" ref={fillRef}>
            {words.map((word, i) => (
              <span key={i} className={i < activeCount ? "on" : ""}>
                {word}{" "}
              </span>
            ))}
          </p>

          <p className="t rv">
            I’m happiest on interfaces that have to stay fast and clear under real load — big tables, live data, dense dashboards — and on the details people feel but rarely notice: motion that explains, states that never flicker, layouts that hold up on every screen. Lately I’m stretching toward the backend, because I want to take an idea from a napkin to a reliable, shipped product on my own. Away from the screen I’m a nature person — happiest on a hike, on two wheels, or trying something that makes my heart race.
          </p>

          <div className="fx rv">
            <div>
              <span className="mono">Based in</span>Bhopal, India
            </div>
            <div>
              <span className="mono">Focus</span>React, Next.js, TypeScript
            </div>
            <div>
              <span className="mono">Exploring</span>FastAPI, Node.js, databases
            </div>
            <div>
              <span className="mono">Off-screen</span>Motorbikes, snooker, hikes &amp; adventure
            </div>
          </div>

          <div className="like">
            <p className="mono lbl rv">What I like working on</p>
            <div className="rv">
              <span className="mono">01</span>
              <h4>Interfaces under load</h4>
              <p>Large tables, live data and dense dashboards that still feel instant.</p>
            </div>
            <div className="rv">
              <span className="mono">02</span>
              <h4>Fuzzy → clear</h4>
              <p>Sitting with stakeholders until a vague request turns into a spec worth building.</p>
            </div>
            <div className="rv">
              <span className="mono">03</span>
              <h4>Craft you can feel</h4>
              <p>Pixel-accurate layouts, purposeful motion, accessible states.</p>
            </div>
            <div className="rv">
              <span className="mono">04</span>
              <h4>Full-stack curiosity</h4>
              <p>APIs, auth and data models — owning the whole path from click to database.</p>
            </div>
          </div>

          <div className="nums rv">
            <div>
              <b>500+</b>
              <p>businesses use the product I help build</p>
            </div>
            <div>
              <b>80K+</b>
              <p>rows rendered smoothly in a single view</p>
            </div>
            <div>
              <b>~40%</b>
              <p>fewer redundant API calls after a data-layer redesign</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
