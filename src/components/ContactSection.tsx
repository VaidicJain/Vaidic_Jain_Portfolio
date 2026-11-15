"use client";

import { useEffect, useState } from "react";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");
  const email = "vaidicdevelops@gmail.com";

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const updateTime = () => setTimeStr(formatter.format(new Date()));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section id="contact" className="dark">
      <div className="w">
        <span className="mono lbl">(04) — Contact</span>
        <h2>
          Got a problem
          <br />
          worth solving?
        </h2>

        <button
          className="mailb"
          data-h
          onClick={handleCopy}
          type="button"
          aria-label="Copy email address"
        >
          <span>{email}</span>
          <em>{copied ? "Copied ✓" : "Click to copy"}</em>
        </button>

        <div className="links mono">
          <a
            href="https://www.linkedin.com/in/vaidicjain"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <span>
            Bhopal · <span className="clk">{timeStr}</span> IST
          </span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
      <div className="giant" aria-hidden="true">
        VAIDIC JAIN
      </div>
    </section>
  );
}
