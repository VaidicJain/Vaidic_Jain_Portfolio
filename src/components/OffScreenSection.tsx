/* eslint-disable @next/next/no-img-element */
import React from "react";

export default function OffScreenSection() {
  return (
    <section id="life" className="sec">
      <div className="w">
        <span className="mono lbl rv">(03) — Off-screen</span>
        <h2 className="rv">
          Off the
          <br />
          keyboard<sup>(03)</sup>
        </h2>

        <div className="gal">
          <figure className="ti g1 rv">
            <img
              src="/images/bike.jpeg"
              alt="Vaidic on his motorbike by a lake"
              loading="lazy"
            />
            <figcaption className="mono">Weekend rides</figcaption>
          </figure>

          <figure className="ti g2 rv">
            <img
              src="/images/portrait.jpeg"
              alt="Portrait of Vaidic at sunset"
              loading="lazy"
            />
            <figcaption className="mono">Golden hour</figcaption>
          </figure>

          <figure className="ti g3 rv">
            <svg viewBox="0 0 700 300" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2b3cff" />
                  <stop offset="0.55" stopColor="#ff7a3c" />
                  <stop offset="1" stopColor="#ffc07a" />
                </linearGradient>
              </defs>
              <rect width="700" height="300" fill="url(#sk)" />
              <circle cx="470" cy="150" r="46" fill="#fff3d6" />
              <path
                d="M0 300V190l90-70 70 60 80-90 110 120 70-50 90 80 70-60 120 110v100z"
                fill="#5a4a8f"
              />
              <path
                d="M0 300V230l110-60 90 70 120-100 120 110 100-60 160 110v100z"
                fill="#2c2a55"
              />
              <path
                d="M0 300V265l80-35 70 30 90-50 110 60 80-30 110 50 160-40v50z"
                fill="#120f2a"
              />
            </svg>
            <figcaption className="mono">Trails &amp; summits</figcaption>
          </figure>
        </div>

        <div className="int rv">
          <div>
            <span className="mono">01</span>
            <h4>Riding</h4>
            <p>Long roads, open skies, still water.</p>
          </div>
          <div>
            <span className="mono">02</span>
            <h4>Snooker</h4>
            <p>Patience, angles, and planning a few shots ahead.</p>
          </div>
          <div>
            <span className="mono">03</span>
            <h4>Hiking</h4>
            <p>Trails, summits and very fresh air.</p>
          </div>
          <div>
            <span className="mono">04</span>
            <h4>Adventure</h4>
            <p>Anything that makes the heart race.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
