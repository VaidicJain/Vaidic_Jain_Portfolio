"use client";

import { useEffect, useState } from "react";

export default function Navigation() {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const updateTime = () => {
      setTimeStr(formatter.format(new Date()));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="mono">
      <a href="#top" className="font-semibold tracking-wider">
        VJ®
      </a>
      <div className="nl">
        <a href="#about">About</a>
        <a href="#work">Projects (03)</a>
        <a href="#life">Off-screen</a>
        <a href="#contact">Contact</a>
      </div>
      <div>
        <span className="dt" />
        Open to new roles · <span className="clk">{timeStr}</span> IST
      </div>
    </nav>
  );
}
