"use client";

import { useEffect, useState } from "react";

export default function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const n = new Date();
      const p = (x: number) => String(x).padStart(2, "0");
      setTime(`${p(n.getUTCHours())}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())} UTC`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        padding: "12px 24px",
        marginLeft: "auto",
        whiteSpace: "nowrap",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      <span style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
        Last sync
      </span>
      <span className="font-mono" style={{ fontWeight: 500, color: "#fff", fontSize: 12, letterSpacing: "-0.2px" }}>
        {time}
      </span>
    </div>
  );
}
