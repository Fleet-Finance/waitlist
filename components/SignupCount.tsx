"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SignupCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const { data, error } = await getSupabase().rpc("get_waitlist_count");
        if (!error && typeof data === "number") {
          setCount(data);
        }
      } catch {
        // silently fall back to no count
      }
    }
    fetchCount();
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-4xl sm:text-5xl font-black tabular-nums min-w-[2ch] text-center"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {count === null ? (
          /* skeleton pulse while loading */
          <span
            className="inline-block w-8 h-10 rounded-md animate-pulse"
            style={{ background: "rgba(59,130,246,0.2)" }}
          />
        ) : (
          formatCount(count)
        )}
      </span>
      <span className="text-slate-500 text-[10px] font-semibold tracking-[0.15em] uppercase">
        Signups
      </span>
    </div>
  );
}
