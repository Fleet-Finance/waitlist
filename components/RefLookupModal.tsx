"use client";

import { useState, FormEvent } from "react";

type LookupState = "idle" | "loading" | "success" | "error";

interface UserStats {
  ref_code: string;
  direct_refs: number;
  l2_refs: number;
  points: number;
  verified: boolean;
}

export default function RefLookupModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<LookupState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function handleOpen() {
    setOpen(true);
    setEmail("");
    setState("idle");
    setErrorMsg("");
    setStats(null);
  }

  function handleClose() {
    setOpen(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "not_found") {
          setErrorMsg("No account found with that email.");
        } else {
          setErrorMsg(data.error || "Something went wrong. Please try again.");
        }
        setState("error");
        return;
      }

      setStats(data);
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  function handleCopyCode() {
    if (!stats) return;
    navigator.clipboard.writeText(stats.ref_code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  function handleCopyLink() {
    if (!stats) return;
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "https://fleets.fi";
    navigator.clipboard.writeText(`${base}?ref=${stats.ref_code}`).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors underline underline-offset-2"
      >
        Already joined? Check your referral points
      </button>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-[#0a1220] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Check your referral points</h2>
            <p className="text-sm text-slate-400 mb-5">
              Enter the email you signed up with to see your code and points.
            </p>

            {state !== "success" ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div
                  className="
                    flex items-center gap-3 px-4 py-4 rounded-2xl
                    bg-[#3B83F61A] border border-[#3B83F640]
                    focus-within:border-blue-500/50 transition-colors
                  "
                >
                  <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent text-white placeholder-slate-500 text-[15px] outline-none"
                    disabled={state === "loading"}
                  />
                </div>

                {(state === "error" || errorMsg) && (
                  <p className="text-red-400 text-sm px-1">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="
                    w-full py-4 rounded-2xl font-semibold text-white text-[15px]
                    gradient-btn transition-all duration-200
                    hover:opacity-90 active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {state === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Looking up…
                    </span>
                  ) : (
                    "Look up my points"
                  )}
                </button>
              </form>
            ) : stats ? (
              <div className="flex flex-col gap-4">
                {/* Points total */}
                <div className="text-center py-4 rounded-2xl bg-[#3B83F61A] border border-[#3B83F640]">
                  <p
                    className="text-5xl font-black tabular-nums"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stats.points}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Total Points
                  </p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.direct_refs}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      Direct refs
                    </p>
                    <p className="text-[11px] text-blue-400 font-semibold mt-1">
                      {stats.direct_refs * 10} pts
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <p className="text-2xl font-black text-white">{stats.l2_refs}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      Level-2 refs
                    </p>
                    <p className="text-[11px] text-blue-400 font-semibold mt-1">
                      {stats.l2_refs * 2} pts
                    </p>
                  </div>
                </div>

                {/* Unverified warning */}
                {!stats.verified && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                    <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Your email is not verified. Check your inbox and click the verification link to unlock your referral code.
                    </p>
                  </div>
                )}

                {/* Ref code */}
                <div className={`rounded-2xl bg-[#3B83F61A] border border-[#3B83F640] px-4 py-3 ${!stats.verified ? "opacity-40 pointer-events-none select-none" : ""}`}>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Your referral code
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-black tracking-[0.2em] text-white font-mono">
                      {stats.verified ? stats.ref_code : "••••••••"}
                    </span>
                    {stats.verified && (
                      <button
                        onClick={handleCopyCode}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                      >
                        {copiedCode ? "Copied!" : "Copy code"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Share link */}
                <button
                  onClick={handleCopyLink}
                  disabled={!stats.verified}
                  className="
                    w-full py-3.5 rounded-2xl font-semibold text-white text-[15px]
                    gradient-btn transition-all duration-200
                    hover:opacity-90 active:scale-[0.98]
                    flex items-center justify-center gap-2
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  {copiedLink ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Referral Link
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
