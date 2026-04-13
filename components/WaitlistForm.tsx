"use client";

import { useState, useEffect, FormEvent } from "react";

type FormState = "idle" | "loading" | "pending" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRefCode, setUserRefCode] = useState("");
  const [referredBy, setReferredBy] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const verified = params.get("verified");
    const code = params.get("code");

    if (ref) setReferredBy(ref);

    // Returning from email verification link
    if (verified === "1") {
      if (code) setUserRefCode(code);
      setState("success");
      // Clean the URL without reloading
      const clean = new URL(window.location.href);
      clean.searchParams.delete("verified");
      clean.searchParams.delete("code");
      window.history.replaceState({}, "", clean.toString());
    }
  }, []);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          twitter: twitter.trim(),
          referred_by: referredBy || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "duplicate") {
          setErrorMsg("You're already on the waitlist!");
        } else {
          setErrorMsg(data.error || "Something went wrong. Please try again.");
        }
        setState("error");
        return;
      }

      setState("pending");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "https://fleets.fi";
    const shareUrl = userRefCode ? `${baseUrl}?ref=${userRefCode}` : baseUrl;
    const tweetText ="I just joined the @usefleets waitlist! \n \n" +
      "The earlier you join, the better your chances of getting ahead before launch.\n \n"+
      "Be one of the first to test Fleets.\n";
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

    function handleCopyRefCode() {
      navigator.clipboard.writeText(userRefCode).then(() => {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      });
    }

    function handleCopyLink() {
      navigator.clipboard.writeText(`${tweetText} ${shareUrl}`).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }

    return (
      <div className="w-full text-center py-6 px-4 flex flex-col items-center gap-6">
        {/* Check icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <div>
          <p className="text-xl font-bold text-white mb-1">
            You&apos;re on the list!
          </p>
          <p className="text-sm text-slate-400">
            We&apos;ll notify you when we launch. Stay tuned.
          </p>
        </div>

        {/* Referral code box */}
        {userRefCode && (
          <div className="w-full rounded-2xl bg-[#3B83F61A] border border-[#3B83F640] px-5 py-4 text-left">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Your referral code
            </p>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-2xl font-black tracking-[0.2em] text-white font-mono">
                {userRefCode}
              </span>
              <button
                onClick={handleCopyRefCode}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0"
              >
                {copiedRef ? (
                  "Copied!"
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy code
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>
                <span className="text-blue-400 font-bold">10 pts</span> per
                direct referral
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span>
                <span className="text-blue-400 font-bold">2 pts</span> per
                their referral
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Twitter/X share button */}
          <a
            href={twitterIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1 flex items-center justify-center gap-2
              py-4 rounded-2xl font-semibold text-white text-[15px]
              bg-black hover:bg-zinc-900
              transition-all duration-200 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-white/20
            "
          >
            <XIcon className="w-4 h-4" />
            Share on X
          </a>

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="
              flex-1 flex items-center justify-center gap-2
              py-4 rounded-2xl font-semibold text-white text-[15px]
              gradient-btn transition-all duration-200
              hover:opacity-90 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            "
          >
            {copiedLink ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link
              </>
            )}
          </button>

          {/* Discord button */}
          <a
            href="https://discord.gg/NcVXCthTpd"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1 flex items-center justify-center gap-2
              py-4 rounded-2xl font-semibold text-white text-[15px]
              bg-[#5865F2] hover:bg-[#4752c4]
              transition-all duration-200 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-[#5865F2]/50
            "
          >
            <DiscordIcon className="w-5 h-5" />
            Join Discord
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Pending verification modal */}
      {state === "pending" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setState("idle")} />
          <div className="relative w-full max-w-sm bg-[#0a1220] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60 flex flex-col items-center gap-5 text-center">
            {/* Close */}
            <button
              onClick={() => setState("idle")}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Mail icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <p className="text-xl font-bold text-white mb-1">Check your inbox</p>
              <p className="text-sm text-slate-400">
                We sent a verification link to{" "}
                <span className="text-white font-medium">{email}</span>.
                Click it to confirm your spot on the waitlist.
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Didn&apos;t receive it? Check your spam folder.
            </p>
          </div>
        </div>
      )}

    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row gap-5">
        <div
          className="
            flex-1 flex items-center gap-3 px-4 lg:px-6 py-4 lg:py-6 rounded-2xl
            bg-[#3B83F61A] border border-[#3B83F640]
            transition-all duration-200 input-glow
            focus-within:border-blue-500/50
          "
        >
          <MailIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            className="
              flex-1 bg-transparent text-white placeholder-slate-500
              text-[15px] outline-none border-none
            "
            disabled={state === "loading"}
          />
        </div>
        <div
          className="
            flex-1 flex items-center gap-3 px-4 lg:px-6 py-4 lg:py-6 rounded-2xl
            bg-[#3B83F61A] border border-[#3B83F640]
            transition-all duration-200 input-glow
            focus-within:border-blue-500/50
          "
        >
          <XIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="X Username (Optional)"
            autoComplete="off"
            className="
              flex-1 bg-transparent text-white placeholder-slate-500
              text-[15px] outline-none border-none
            "
            disabled={state === "loading"}
          />
        </div>
      </div>
      {(state === "error" || errorMsg) && (
        <p className="text-red-400 text-sm px-1">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="
          w-full py-4 lg:py-6 rounded-2xl font-semibold text-white text-[16px]
          gradient-btn transition-all duration-200
          hover:opacity-90 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
        "
      >
        {state === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            Joining…
          </span>
        ) : (
          "Join Waitlist →"
        )}
      </button>
    </form>
    </>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
