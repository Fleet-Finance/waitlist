import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
});

function confirmationEmail(email: string, position: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the waitlist!</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;width:64px;height:64px;border-radius:12px;background:rgba(59,131,246,0.1);border:1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td align="center" valign="middle" width="64" height="64">
                    <img src="https://raw.githubusercontent.com/Fleet-Finance/assets/a57f47ae9123c9d6fac7d0e9456836fae497dd37/logo.svg" alt="Fleet" width="40" height="27" style="display:block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(59,131,246,0.05);border:1px solid rgba(59,131,246,0.2);border-radius:20px;padding:40px 36px;">

              <!-- Checkmark -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table cellpadding="0" cellspacing="0" style="display:inline-table;width:56px;height:56px;border-radius:50%;background:rgba(59,131,246,0.15);border:1px solid rgba(59,131,246,0.3);">
                      <tr>
                        <td align="center" valign="middle" width="56" height="56">
                          <img src="https://raw.githubusercontent.com/Fleet-Finance/assets/refs/heads/main/check.svg" alt="Checkmark" width="40" height="40" style="display:block;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#3B83F6;letter-spacing:-0.5px;">
                      You&apos;re on the list!
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#f7f7f7;max-width:380px;">
                      Thanks for signing up, <strong style="color:#cbd5e1;">${email}</strong>.
                    </p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#f7f7f7;max-width:380px;">
                      Together, we&apos;re bringing real-world yield to DeFi and driving real-world impact. </br>
                    </p></br>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#f7f7f7;max-width:380px;">
                      We&apos;ll reach out as soon as we launch.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.07);padding-bottom:28px;"></td>
                </tr>

                <!-- Stats row -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" width="50%">
                          <p style="margin:0;font-size:28px;font-weight:900; -webkit-background-clip:text;color:#3B83F6;">#${position}</p>
                          <p style="margin:4px 0 0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">On the list</p>
                        </td>
                        <td style="border-left:1px solid rgba(255,255,255,0.07);" align="center" width="50%">
                          <p style="margin:0;font-size:28px;font-weight:900; -webkit-background-clip:text;color:#3B83F6;">10-20%</p>
                          <p style="margin:4px 0 0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">Projected APY</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#334155;">
                © 2026 Fleet — Built on Solana
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, twitter } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Insert into Supabase
    const { error: dbError } = await supabase.from("waitlist").insert([
      { email: email.trim().toLowerCase(), twitter: twitter?.trim() || null },
    ]);

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json({ error: "duplicate" }, { status: 409 });
      }
      throw dbError;
    }

    // Fetch current count — new user is already inserted, so count = their position
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    const position = count ?? 1;

    // Send confirmation email
    await transporter.sendMail({
      from: `Fleet <${process.env.ZOHO_EMAIL}>`,
      to: email.trim().toLowerCase(),
      subject: "You're on the Fleet waitlist 🚀",
      html: confirmationEmail(email.trim().toLowerCase(), position),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[join] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
