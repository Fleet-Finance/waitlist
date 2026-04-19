"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SignupCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const { data, error } = await getSupabase().rpc("get_waitlist_count");
        if (!error && typeof data === "number") setCount(data);
      } catch {
        // silently fall back
      }
    }
    fetchCount();
  }, []);

  return (
    <div
      className="stat-item flex flex-col gap-1.5"
      style={{ paddingLeft: 24, borderLeft: "1px solid var(--border)" }}
    >
      <span style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
        Signups
      </span>

      <span className="font-mono tabular-nums" style={{ fontSize: 30, letterSpacing: "-1.2px", fontWeight: 500, minWidth: "2ch" }}>
        {count === null ? (
          <span
            className="inline-block rounded animate-pulse"
            style={{ width: 56, height: 32, background: "rgba(59,131,246,0.15)" }}
          />
        ) : (
          <>
            {formatCount(count)}
          </>
        )}
      </span>

      <span style={{ fontSize: 11, color: "#00C951", fontWeight: 500 }}>▲ on waitlist</span>
    </div>
  );
}
