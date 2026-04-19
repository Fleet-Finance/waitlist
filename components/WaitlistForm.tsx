"use client";

import { useState, useEffect, FormEvent } from "react";

type FormState = "idle" | "loading" | "pending" | "success" | "error" | "lookup";
type LookupState = "idle" | "loading" | "success" | "error";

interface UserStats {
  ref_code: string;
  direct_refs: number;
  l2_refs: number;
  points: number;
  verified: boolean;
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [userRefCode, setUserRefCode] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lookup state
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupError, setLookupError] = useState("");
  const [lookupStats, setLookupStats] = useState<UserStats | null>(null);
  const [copiedLookupCode, setCopiedLookupCode] = useState(false);
  const [copiedLookupLink, setCopiedLookupLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const verified = params.get("verified");
    const code = params.get("code");
    if (ref) setReferredBy(ref);
    if (verified === "1") {
      if (code) setUserRefCode(code);
      setState("success");
      const clean = new URL(window.location.href);
      clean.searchParams.delete("verified");
      clean.searchParams.delete("code");
      window.history.replaceState({}, "", clean.toString());
    }
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim()) { setErrorMsg("Email is required."); return; }
    if (!validateEmail(email)) { setErrorMsg("Please enter a valid email address."); return; }
    setState("loading");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), twitter: twitter.trim(), referred_by: referredBy || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error === "duplicate" ? "You're already on the waitlist!" : (data.error || "Something went wrong. Please try again."));
        setState("error");
        return;
      }
      setState("pending");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  async function handleLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLookupError("");
    if (!lookupEmail.trim() || !validateEmail(lookupEmail)) {
      setLookupError("Please enter a valid email address.");
      return;
    }
    setLookupState("loading");
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lookupEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error === "not_found" ? "No account found with that email." : (data.error || "Something went wrong."));
        setLookupState("error");
        return;
      }
      setLookupStats(data);
      setLookupState("success");
    } catch {
      setLookupError("Something went wrong. Please try again.");
      setLookupState("error");
    }
  }

  // ── Success state ──
  if (state === "success") {
    const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://fleets.fi";
    const shareUrl = userRefCode ? `${base}?ref=${userRefCode}` : base;
    const tweetText = `I just joined the @usefleets waitlist!\n\nThe earlier you join, the better your chances of getting ahead before launch.\n\nBe one of the first to test Fleets.\n`;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

    return (
      <div className="fleets-card">
        <div className="flex flex-col gap-5">
          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--bg-input)", border: "1px solid var(--border-accent)", color: "var(--accent)" }}>
            <CheckIcon />
          </div>
          <div>
            <h3 style={{ fontSize: 20, letterSpacing: "-0.4px", marginBottom: 6, fontWeight: 600 }}>You&apos;re on the list</h3>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
              We&apos;ll notify you when Fleets v0 opens. Your referral code is live — share it and climb the cohort.
            </p>
          </div>

          {/* Ref code box */}
          {userRefCode && (
            <div
              className="ref-box-glow"
              style={{ padding: "18px 18px 16px", border: "1px solid var(--border-accent)", background: "var(--bg-input)", borderRadius: 14, position: "relative", overflow: "hidden" }}
            >
              <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 10 }}>
                Your referral code
              </div>
              <div className="flex items-center justify-between gap-2.5 relative" style={{ marginBottom: 12 }}>
                <span className="font-mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.2em" }}>
                  {userRefCode}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(userRefCode).then(() => { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); })}
                  className="flex items-center gap-1 transition-colors"
                  style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                >
                  <CopyIcon /> {copiedRef ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex items-center gap-3.5 relative" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>
                <span><b style={{ color: "var(--accent)" }}>+10 pts</b> per direct referral</span>
                <span style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
                <span><b style={{ color: "var(--accent)" }}>+2 pts</b> per level-2</span>
              </div>
            </div>
          )}

          {/* Share row */}
          <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <a
              href={twitterIntentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ padding: "12px 10px", background: "#000", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              <XIcon className="w-3.5 h-3.5" /> Share
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(`${tweetText} ${shareUrl}`).then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); })}
              className="flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ padding: "12px 10px", background: "var(--accent)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              <CopyIcon /> {copiedLink ? "Copied" : "Copy link"}
            </button>
            <a
              href="https://discord.gg/NcVXCthTpd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ padding: "12px 10px", background: "#5865F2", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              <DiscordIcon className="w-3.5 h-3.5" /> Discord
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Lookup state ──
  if (state === "lookup") {
    return (
      <div className="fleets-card">
        <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.2px" }}>Check your points</h3>
          <span className="flex items-center gap-2" style={{ fontSize: 10.5, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />
            Returning
          </span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 18, lineHeight: 1.45 }}>
          Enter the email you signed up with. We&apos;ll show your code, points, and cohort rank.
        </p>

        {lookupState !== "success" ? (
          <form onSubmit={handleLookup} className="flex flex-col gap-3.5">
            <label
              className="fleets-field flex items-center gap-3 transition-all"
              style={{ padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg-input)", borderRadius: 12 }}
            >
              <MailIcon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                disabled={lookupState === "loading"}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: 14, color: "#fff" }}
              />
            </label>
            {(lookupState === "error" || lookupError) && (
              <p style={{ fontSize: 12.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 8 }}>◈ {lookupError}</p>
            )}
            <button
              type="submit"
              disabled={lookupState === "loading"}
              className="flex items-center justify-center gap-2 w-full transition-all hover:brightness-108 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ padding: "14px 20px", background: "var(--accent)", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px -10px var(--accent-glow)" }}
            >
              {lookupState === "loading" ? <><SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> Looking up…</> : "Look up my points →"}
            </button>
          </form>
        ) : lookupStats ? (
          <div className="flex flex-col gap-3.5">
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: 14, border: "1px solid var(--border-accent)", background: "var(--bg-input)", borderRadius: 12 }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 4 }}>Points</div>
                <div className="font-mono tabular-nums" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px" }}>{lookupStats.points}</div>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateRows: "1fr 1fr" }}>
                <div className="flex items-center justify-between" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Direct</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>
                    {lookupStats.direct_refs} <span style={{ color: "var(--accent)", fontSize: 10.5, fontWeight: 600 }}>+{lookupStats.direct_refs * 10}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Level-2</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>
                    {lookupStats.l2_refs} <span style={{ color: "var(--accent)", fontSize: 10.5, fontWeight: 600 }}>+{lookupStats.l2_refs * 2}</span>
                  </span>
                </div>
              </div>
            </div>

            {!lookupStats.verified && (
              <div className="flex items-start gap-2.5" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#FCD34D", lineHeight: 1.5 }}>
                <span>⚠</span>
                Email not verified. Check your inbox to unlock your referral code.
              </div>
            )}

            <div style={{ padding: "16px 16px 14px", border: "1px solid var(--border-accent)", background: "var(--bg-input)", borderRadius: 14, opacity: lookupStats.verified ? 1 : 0.4, pointerEvents: lookupStats.verified ? "auto" : "none" }}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 8 }}>Referral code</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.2em" }}>
                  {lookupStats.verified ? lookupStats.ref_code : "••••••••"}
                </span>
                {lookupStats.verified && (
                  <button
                    onClick={() => navigator.clipboard.writeText(lookupStats.ref_code).then(() => { setCopiedLookupCode(true); setTimeout(() => setCopiedLookupCode(false), 2000); })}
                    style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                  >
                    {copiedLookupCode ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>

            {/* Share row — X + Copy link */}
            {(() => {
              const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://fleets.fi";
              const refUrl = `${base}?ref=${lookupStats.ref_code}`;
              const tweetText = `I joined the @usefleets waitlist!\n\nThe earlier you join, the better your chances of getting ahead before launch.\n\nBe one of the first to test Fleets.\n`;
              const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(refUrl)}`;
              return (
                <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <a
                    href={lookupStats.verified ? twitterIntentUrl : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={!lookupStats.verified ? (e) => e.preventDefault() : undefined}
                    className="flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ padding: "13px 10px", background: "#000", color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: "none", opacity: lookupStats.verified ? 1 : 0.4, pointerEvents: lookupStats.verified ? "auto" : "none" }}
                  >
                    <XIcon className="w-3.5 h-3.5" /> Share on X
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(refUrl).then(() => { setCopiedLookupLink(true); setTimeout(() => setCopiedLookupLink(false), 2000); })}
                    disabled={!lookupStats.verified}
                    className="flex items-center justify-center gap-1.5 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ padding: "13px 10px", background: "var(--accent)", color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <CopyIcon /> {copiedLookupLink ? "Copied!" : "Copy link"}
                  </button>
                </div>
              );
            })()}
          </div>
        ) : null}

        <button
          onClick={() => { setState("idle"); setLookupState("idle"); setLookupStats(null); setLookupError(""); setLookupEmail(""); }}
          className="flex items-center gap-1 mt-4 transition-colors hover:text-white"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          ← Back to signup
        </button>
      </div>
    );
  }

  // ── Default form ──
  return (
    <>
      {/* Pending modal */}
      {state === "pending" && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: 50, background: "rgba(2,4,10,0.78)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && setState("idle")}
        >
          <div
            className="relative w-full flex flex-col gap-5"
            style={{ maxWidth: 420, background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
          >
            <button
              onClick={() => setState("idle")}
              className="absolute transition-colors hover:text-white"
              style={{ top: 16, right: 16, width: 28, height: 28, background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", borderRadius: 8, display: "grid", placeItems: "center" }}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--bg-input)", border: "1px solid var(--border-accent)", color: "var(--accent)" }}>
              <MailBigIcon />
            </div>
            <div>
              <h3 style={{ fontSize: 20, letterSpacing: "-0.4px", marginBottom: 6, fontWeight: 600 }}>Check your inbox</h3>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 16 }}>
                We sent a verification link to <b style={{ color: "#fff", fontWeight: 600 }}>{email}</b>. Click it to confirm your spot.
              </p>
              <div className="flex items-center gap-2.5" style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.5)", background: "var(--panel-alpha)" }}>
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" style={{ borderColor: "rgba(59,131,246,0.2)", borderTopColor: "var(--accent)" }} />
                Waiting for verification…
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>
              Didn&apos;t get it? Check spam.
            </p>
          </div>
        </div>
      )}

      <div className="fleets-card">
        {/* Card header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.2px" }}>Reserve your cohort slot</h3>
          <span className="flex items-center gap-2" style={{ fontSize: 10.5, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }} />
            01 · Join
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5" noValidate>
          <label
            className="fleets-field flex items-center gap-3 transition-all"
            style={{ padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg-input)", borderRadius: 12 }}
          >
            <MailIcon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              disabled={state === "loading"}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: 14, color: "#fff" }}
            />
          </label>
          <label
            className="fleets-field flex items-center gap-3 transition-all"
            style={{ padding: "14px 16px", border: "1px solid var(--border)", background: "var(--bg-input)", borderRadius: 12 }}
          >
            <XIcon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="X username (optional)"
              autoComplete="off"
              disabled={state === "loading"}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "inherit", fontSize: 14, color: "#fff" }}
            />
          </label>

          {(state === "error" || errorMsg) && (
            <p style={{ fontSize: 12.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 8 }}>◈ {errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="flex items-center justify-center gap-2 w-full transition-all hover:brightness-108 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ padding: "14px 20px", background: "var(--accent)", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px -10px var(--accent-glow)", marginTop: 2 }}
          >
            {state === "loading" ? <><SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> Joining…</> : <>Join Waitlist <ArrowIcon /></>}
          </button>
        </form>

        {/* Helper row */}
        <div className="flex items-center justify-between" style={{ marginTop: 12, fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>
          <button
            onClick={() => setState("lookup")}
            className="transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", borderBottom: "1px dashed rgba(255,255,255,0.2)" }}
          >
            Already joined? Check points
          </button>
          <span>No spam · one email at launch</span>
        </div>

        {/* Referral tease */}
        <div
          className="flex items-center gap-3.5"
          style={{ marginTop: 14, padding: "14px 16px", border: "1px dashed var(--border-strong)", borderRadius: 12, background: "var(--panel-alpha)" }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <SparkIcon />
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.35, flex: 1 }}>
            <b style={{ color: "#fff", fontWeight: 600 }}>Refer friends, earn points.</b>{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>+10 per direct · +2 per level-2. Higher points, earlier access.</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Icons ── */

function MailIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function MailBigIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function XIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25A19.736 19.736 0 003.677 4.37C.533 9.046-.32 13.58.099 18.057a19.9 19.9 0 006.077 3.058c.462-.63.874-1.295 1.226-1.994a13.107 13.107 0 01-1.872-.892c.157-.116.31-.236.459-.358 3.928 1.793 8.18 1.793 12.062 0 .151.122.304.242.461.358-.6.357-1.226.654-1.873.892.353.699.764 1.364 1.226 1.994a19.839 19.839 0 006.002-3.03c.5-5.177-.838-9.674-3.549-13.66zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function SpinnerIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" width="14" height="14">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
    </svg>
  );
}
