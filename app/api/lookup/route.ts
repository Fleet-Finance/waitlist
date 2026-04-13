import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [{ data: stats, error: statsError }, { data: row }] = await Promise.all([
      supabase.rpc("get_user_stats", { p_email: normalizedEmail }),
      supabase
        .from("waitlist")
        .select("verified")
        .eq("email", normalizedEmail)
        .maybeSingle(),
    ]);

    if (statsError) throw statsError;

    if (!stats) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ...stats, verified: row?.verified ?? false });
  } catch (err) {
    console.error("[lookup] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
