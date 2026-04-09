"use client";

import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        body: JSON.stringify({ email: email.trim(), twitter: twitter.trim() }),
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

      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="w-full text-center py-6 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
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
        <p className="text-xl font-bold text-white mb-1">
          You&apos;re on the list! 🚀
        </p>
        <p className="text-sm text-slate-400">
          We&apos;ll notify you when we launch. Stay tuned.
        </p>
      </div>
    );
  }

  return (
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
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
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
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
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
