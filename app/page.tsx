import WaitlistForm from "@/components/WaitlistForm";
import SignupCount from "@/components/SignupCount";
import LiveClock from "@/components/LiveClock";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* ── Decorative background ── */}
      <div className="bg-motif" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-halo" />
      </div>

      {/* ── App shell ── */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* Topbar */}
        <header
          className="topbar flex items-center justify-between"
          style={{ padding: "22px 40px", borderBottom: "1px solid var(--border)" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Fleets" width={28} height={19} aria-hidden="true" />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.4px" }}>fleets</span>
          </div>

          {/* Nav — Docs + Discord only */}
          <nav
            className="topbar-nav flex items-center"
            style={{ gap: 28, fontSize: 13.5, color: "rgba(255,255,255,0.5)" }}
          >
            <a
              href="https://docs.fleets.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Docs
            </a>
            <a
              href="https://discord.gg/NcVXCthTpd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Discord
            </a>
          </nav>

          {/* Pill */}
          <span
            className="flex items-center gap-2"
            style={{
              padding: "7px 12px 7px 10px",
              border: "1px solid var(--border)",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              background: "var(--panel-alpha)",
            }}
          >
            <span className="live-dot" />
            Mainnet launch — Q3 2026
          </span>
        </header>

        {/* Status bar — no Audit cell */}
        <div
          className="status-bar flex items-stretch"
          style={{ borderBottom: "1px solid var(--border)", fontSize: 11.5, letterSpacing: "0.02em" }}
        >
          <StatusCell label="Reserve" value="USYC" mono />
          <StatusCell label="Network" value="Solana" />
          <StatusCell label="Hackathon" value="Frontier" />
          <LiveClock />
        </div>

        {/* Hero */}
        <main className="hero">

          {/* Left column */}
          <section className="hero-left">
            <div>
              {/* Eyebrow */}
              <div
                className="flex items-center gap-2.5"
                style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 28 }}
              >
                <span style={{ display: "inline-block", width: 18, height: 1, background: "var(--accent)", flexShrink: 0 }} />
                Waitlist · v0 protocol
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontSize: "clamp(44px,6vw,84px)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.035em",
                  fontWeight: 500,
                  marginBottom: 28,
                }}
              >
                <span style={{ display: "block" }}>Real-world</span>
                <span style={{ display: "block" }}>yield without</span>
                <span style={{ display: "block", color: "var(--accent)", fontStyle: "italic", letterSpacing: "-0.04em" }}>
                  leaving DeFi
                </span>
              </h1>

              {/* Subhead */}
              <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", maxWidth: 520, marginBottom: 40 }}>
                Real assets, real repayments, real-time transparency. Deploy capital where
                it matters most.
              </p>

              {/* Token chips */}
              <div className="flex flex-wrap gap-2" style={{ marginBottom: 32 }}>
                <TokenChip tok="ffc" label="FFC" sub="FiLo coin" />
                <TokenChip tok="fyc" label="FYC" sub="Yield coin" />
                <TokenChip tok="usyc" label="USYC" sub="Reserve" />
              </div>
            </div>

            {/* Stats — 3 items (FiLo coverage / first-loss buffer removed) */}
            <div className="stats-grid">
              <StatItem k="Projected APR" v="10-20" unit="%" trend="Senior tranche" />
              <SignupCount />
            </div>
          </section>

          {/* Right column — card only, no capacity bar */}
          <aside className="hero-right">
            <WaitlistForm />
          </aside>
        </main>

        {/* Footer */}
        <footer
          className="site-footer flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)", padding: "18px 40px", fontSize: 11.5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}
        >
          <div>© 2026 Fleets Protocol · Built on Solana</div>
          <div className="flex gap-5">
            <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatusCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        padding: "12px 24px",
        borderRight: "1px solid var(--border)",
        whiteSpace: "nowrap",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      <span style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
      <span
        className={mono ? "font-mono" : ""}
        style={{ fontWeight: 500, color: "#fff", fontSize: mono ? 12 : undefined, letterSpacing: mono ? "-0.2px" : undefined }}
      >
        {value}
      </span>
    </div>
  );
}

function StatItem({ k, v, unit, trend, muted }: { k: string; v: string; unit: string; trend: string; muted?: boolean }) {
  return (
    <div
      className="stat-item flex flex-col gap-1.5"
      style={{ paddingRight: 16 }}
    >
      <span style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
        {k}
      </span>
      <span className="font-mono tabular-nums" style={{ fontSize: 30, letterSpacing: "-1.2px", fontWeight: 500 }}>
        {v}
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.3px", marginLeft: 2, fontWeight: 500 }}>
          {unit}
        </span>
      </span>
      <span style={{ fontSize: 11, color: muted ? "rgba(255,255,255,0.5)" : "#00C951", fontWeight: 500 }}>
        {!muted && "▲ "}{trend}
      </span>
    </div>
  );
}



function TokenChip({ tok, label, sub }: { tok: "ffc" | "fyc" | "usyc"; label: string; sub: string }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        padding: "6px 12px 6px 8px",
        border: "1px solid var(--border)",
        borderRadius: 9999,
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        background: "var(--panel-alpha)",
      }}
    >
      <span
        style={{
          display: "grid", placeItems: "center",
          flexShrink: 0, overflow: "hidden",
        }}
      >
        {tok === "ffc"  && <img src="/ffc.svg" alt="ffc logo" width={28} height={28} aria-hidden="true" />}
        {tok === "fyc"  && <img src="/fyc.svg" alt="fyc logo" width={28} height={28} aria-hidden="true" />}
        {tok === "usyc" && <img src="/usyc.svg" alt="usyc logo" width={28} height={28} aria-hidden="true" />}
      </span>
      {label}
      <em style={{ color: "rgba(255,255,255,0.35)", fontWeight: 500, fontStyle: "italic", marginLeft: 2 }}>
        {sub}
      </em>
    </span>
  );
}
