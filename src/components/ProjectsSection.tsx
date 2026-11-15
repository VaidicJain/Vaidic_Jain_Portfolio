import React from "react";

export default function ProjectsSection() {
  return (
    <section id="work" className="sec dark">
      <div className="w">
        <span className="mono lbl rv">(02) — Projects</span>
        <h2 className="rv">
          Things I’ve
          <br />
          built<sup>(03)</sup>
        </h2>

        {/* Project 1 */}
        <div
          className="pj rv"
          style={{ marginTop: "9vh" } as React.CSSProperties}
        >
          <div
            className="vis"
            style={{ "--g": "linear-gradient(135deg, #0b3d91, #2bb3ff)" } as React.CSSProperties}
          >
            <div className="br">
              <div className="mn">
                <div className="fs">
                  <i>DEL → BOM</i>
                  <i>12 Dec</i>
                  <i>1 Adult</i>
                  <b>Search</b>
                </div>
                <div className="fr">
                  <span>
                    06:10 → 08:25
                    <small>Non-stop · 2h 15m</small>
                  </span>
                  <em>₹4,820</em>
                  <u>Book</u>
                </div>
                <div className="fr">
                  <span>
                    09:40 → 11:55
                    <small>Non-stop · 2h 15m</small>
                  </span>
                  <em>₹5,260</em>
                  <u>Book</u>
                </div>
                <div className="fr">
                  <span>
                    14:05 → 16:20
                    <small>Non-stop · 2h 15m</small>
                  </span>
                  <em>₹4,390</em>
                  <u>Book</u>
                </div>
                <div className="fe">
                  Can’t find what you need? <b>Send an enquiry →</b>
                </div>
              </div>
            </div>
          </div>

          <div className="pi">
            <span className="mono">01 — Full-stack · In development</span>
            <h3>Flight Booking &amp; Enquiry Platform</h3>
            <p>
              A complete one-stop platform to search and book flights and handle travel enquiries — a Next.js and TypeScript frontend backed by a Python FastAPI service and a PostgreSQL database.
            </p>
            <dl>
              <div>
                <dt className="mono">Built</dt>
                <dd>Frontend, API and database</dd>
              </div>
              <div>
                <dt className="mono">Stack</dt>
                <dd>Next.js · TypeScript · FastAPI · PostgreSQL</dd>
              </div>
            </dl>
            <div className="ls mono">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Live demo ↗
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Source ↗
              </a>
            </div>
          </div>
        </div>

        {/* Project 2 */}
        <div className="pj rv">
          <div
            className="vis"
            style={{ "--g": "linear-gradient(135deg, #ff4d1c, #ff9a3c)" } as React.CSSProperties}
          >
            <div className="br">
              <div className="sb">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="mn">
                <div className="t3">
                  <b>
                    128<small>Employees</small>
                  </b>
                  <b>
                    94%<small>Attendance</small>
                  </b>
                  <b>
                    12<small>On leave</small>
                  </b>
                </div>
                <div className="bars">
                  <i style={{ height: "45%" }} />
                  <i style={{ height: "70%" }} />
                  <i style={{ height: "55%" }} />
                  <i style={{ height: "90%" }} />
                  <i style={{ height: "65%" }} />
                  <i style={{ height: "80%" }} />
                  <i style={{ height: "50%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pi">
            <span className="mono">02 — Full-stack · 2024</span>
            <h3>Employee Management Dashboard</h3>
            <p>
              An HR platform covering the whole employee lifecycle — attendance, leave and projects in one place, with live dashboard stats, Excel report exports and a clean light/dark interface.
            </p>
            <dl>
              <div>
                <dt className="mono">Built</dt>
                <dd>Design, frontend and API</dd>
              </div>
              <div>
                <dt className="mono">Stack</dt>
                <dd>Next.js 15 · TypeScript · Redux Toolkit · FastAPI · MongoDB · JWT · Cloudinary</dd>
              </div>
            </dl>
            <div className="ls mono">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Live demo ↗
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Source ↗
              </a>
            </div>
          </div>
        </div>

        {/* Project 3 */}
        <div className="pj rv">
          <div
            className="vis"
            style={{ "--g": "linear-gradient(135deg, #2b3cff, #8a5cff)" } as React.CSSProperties}
          >
            <div className="phn">
              <div className="cd">
                <b>FinGuard</b>
                <span>•••• •••• ••••</span>
              </div>
              <div className="bl">$8,420.50</div>
              <div className="bt">
                <i>Link bank</i>
                <i>Send money</i>
              </div>
            </div>
          </div>

          <div className="pi">
            <span className="mono">03 — Fintech app</span>
            <h3>FinGuard</h3>
            <p>
              A banking app that connects real bank accounts through Plaid and moves money between people with Dwolla — an exploration of how financial products handle linked accounts, transfers and trust.
            </p>
            <dl>
              <div>
                <dt className="mono">Built</dt>
                <dd>Full product, end to end</dd>
              </div>
              <div>
                <dt className="mono">Stack</dt>
                <dd>Plaid · Dwolla</dd>
              </div>
            </dl>
            <div className="ls mono">
              <a href="#" target="_blank" rel="noopener noreferrer">
                Live demo ↗
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Source ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
