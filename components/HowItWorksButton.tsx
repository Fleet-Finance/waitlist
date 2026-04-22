"use client";

import { useCallback, useEffect, useState } from "react";

export default function HowItWorksButton() {
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileNotice, setMobileNotice] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    setIsFullscreen(false);
  }, []);

  const handleOpen = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileNotice(true);
      setTimeout(() => setMobileNotice(false), 3500);
    }
    setOpen(true);
  };

  // Listen for postMessage from iframe (simulation's ✕ close button)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "close") handleClose();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handleClose]);

  // Escape from parent context
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const backdropClass = `hiw-backdrop${isFullscreen ? " hiw-fullscreen" : ""}`;
  const shellClass    = `hiw-shell${isFullscreen ? " hiw-fullscreen" : ""}`;

  return (
    <>
      <button
        onClick={handleOpen}
        className="hover:text-white transition-colors"
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "inherit",
          lineHeight: "inherit",
        }}
      >
        How It Works
      </button>

      {mobileNotice && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#070D1A",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: "14px 20px",
            width: "calc(100vw - 48px)",
            maxWidth: 360,
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            animation: "howItWorksIn 0.25s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
            Better on desktop
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            For the best experience, open Fleets on a larger screen. You can still explore the simulation here.
          </div>
        </div>
      )}

      {open && (
        <div
          className={backdropClass}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: isFullscreen ? "#04080F" : "rgba(3,8,18,0.88)",
            backdropFilter: isFullscreen ? "none" : "blur(10px)",
            display: "flex",
            alignItems: isFullscreen ? "stretch" : "center",
            justifyContent: "center",
            padding: isFullscreen ? 0 : 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isFullscreen) handleClose();
          }}
        >
          <div
            className={shellClass}
            style={{
              position: "relative",
              width: isFullscreen ? "100vw" : "100%",
              maxWidth: isFullscreen ? "none" : 1220,
              height: isFullscreen ? "100dvh" : "min(92vh, 840px)",
              borderRadius: isFullscreen ? 0 : 20,
              overflow: "hidden",
              border: isFullscreen ? "none" : "1px solid rgba(255,255,255,0.10)",
              boxShadow: isFullscreen
                ? "none"
                : "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,131,246,0.08)",
              animation: "howItWorksIn 0.35s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <iframe
              src="/how-it-works.html"
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              title="How Fleets Protocol Works — Interactive Simulation"
            />

            {/*
              Fullscreen toggle — absolutely overlaid in the modal header,
              left of the simulation's own ✕ (which sits at right:24px in its 56px header).
            */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              style={{
                position: "absolute",
                top: 13,
                right: 62,
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.92)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }}
            >
              {isFullscreen ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11,5 7,5 7,1" />
                  <polyline points="1,7 5,7 5,11" />
                  <line x1="7" y1="5" x2="11" y2="1" />
                  <line x1="5" y1="7" x2="1" y2="11" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7,1 11,1 11,5" />
                  <polyline points="1,7 1,11 5,11" />
                  <line x1="11" y1="1" x2="7" y2="5" />
                  <line x1="1" y1="11" x2="5" y2="7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
