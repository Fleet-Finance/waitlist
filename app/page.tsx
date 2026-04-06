import { createClient } from "@supabase/supabase-js";
import WaitlistForm from "@/components/WaitlistForm";

export const revalidate = 300;
async function getSignupCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 0;

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.rpc("get_waitlist_count");
    if (error) {
      console.error("[waitlist count]", error.message);
      return 0;
    }
    return (data as number) ?? 0;
  } catch (e) {
    console.error("[waitlist count]", e);
    return 0;
  }
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default async function Home() {
  const signupCount = await getSignupCount();

  return (
    <main className="min-h-screen bg-[#04080F] flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl flex flex-col items-center gap-10">
        <div className="flex items-center justify-center w-20 h-20 rounded-[10px] bg-[#3B83F61A] border border-white/10 shadow-lg shadow-blue-900/20 overflow-hidden">
        <img src="/logo.svg" alt="Fleets logo" width={40} height={40} />
        </div>
        <div className="text-center space-y-10">
          <h1 className="font-black leading-[1.05] text-balance">
            <span
              className="block text-5xl sm:text-6xl lg:text-7xl pb-1"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Real-world
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl text-white pb-1">
              yield without
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl text-white">
              leaving DeFi
            </span>
          </h1>

          <p className="text-slate-400 text-[15px] sm:text-base lg:text-lg leading-relaxed mt-4 max-w-xs sm:max-w-sm lg:max-w-xl mx-auto">
            Real assets, real repayments, real-time transparency. Deploy capital
            where it compounds daily.
          </p>
        </div>
        <div className="w-full">
          <WaitlistForm />
        </div>
        <p className="text-slate-500 text-xs font-semibold tracking-[0.12em] uppercase">
          Launching Soon — Limited Slots Available
        </p>
        <div className="flex items-center justify-center gap-12 sm:gap-16 w-full pt-2">
          <StatCard number={formatCount(signupCount)} label="Signups" />
          <div className="w-px h-10 bg-white/10" />
          <StatCard number="12.3K" label="FUSD Supply" />
        </div>
      </div>
      <footer className="mt-16 text-center">
        <p className="text-slate-600 text-xs font-medium tracking-wider uppercase">
          © 2026 Fleet — Built on Solana
        </p>
      </footer>
    </main>
  );
}
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-4xl sm:text-5xl font-black tabular-nums"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {number}
      </span>
      <span className="text-slate-500 text-[10px] font-semibold tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
  );
}

