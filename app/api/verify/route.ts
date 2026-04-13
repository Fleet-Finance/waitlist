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

function welcomeEmail(email: string, position: number, refCode: string, shareUrl: string): string {
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
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Checkmark -->
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
                      You're on the list!
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;max-width:380px;">
                      Thanks for signing up, <strong style="color:#cbd5e1;">${email}</strong>.
                    </p>
                    <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#475569;max-width:380px;">
                      Together, we're bringing real-world yield to DeFi and driving real-world impact.
                      We'll reach out as soon as we launch.
                    </p>
                  </td>
                </tr>

                <!-- Ref code box -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(59,131,246,0.08);border:1px solid rgba(59,131,246,0.2);border-radius:12px;padding:16px 20px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">Your referral code</p>
                          <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.2em;color:#3B83F6;font-family:monospace;">${refCode}</p>
                          <p style="margin:8px 0 0;font-size:12px;color:#475569;">
                            <span style="color:#3B83F6;font-weight:600;">10 pts</span> per direct referral &nbsp;·&nbsp;
                            <span style="color:#3B83F6;font-weight:600;">2 pts</span> per their referral
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Share link -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${shareUrl}"
                      style="display:inline-block;padding:14px 36px;background:#3B83F6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Share your referral link →
                    </a>
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
                          <p style="margin:0;font-size:28px;font-weight:900;color:#3B83F6;">#${position}</p>
                          <p style="margin:4px 0 0;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#475569;">On the list</p>
                        </td>
                        <td style="border-left:1px solid rgba(255,255,255,0.07);" align="center" width="50%">
                          <p style="margin:0;font-size:28px;font-weight:900;color:#3B83F6;">10-20%</p>
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

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid_token", req.url));
  }

  // Mark as verified (only if not already verified)
  const { data, error } = await supabase
    .from("waitlist")
    .update({ verified: true, verified_at: new Date().toISOString() })
    .eq("verification_token", token)
    .eq("verified", false)
    .select("email, ref_code")
    .maybeSingle();

  if (error || !data) {
    // Token invalid or already used — redirect with error
    return NextResponse.redirect(new URL("/?error=invalid_token", req.url));
  }

  // Fetch their verified position
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("verified", true);

  const position = count ?? 1;
  const shareUrl = `${origin}?ref=${data.ref_code}`;

  // Send welcome email now that they're confirmed
  try {
    await transporter.sendMail({
      from: `Fleet <${process.env.ZOHO_EMAIL}>`,
      to: data.email,
      subject: "You're on the Fleet waitlist!",
      html: welcomeEmail(data.email, position, data.ref_code, shareUrl),
    });
  } catch (emailErr) {
    console.error("[verify] welcome email failed:", emailErr);
    // Don't block the redirect if email fails
  }

  // Redirect to home with verified flag and ref code
  const redirectUrl = new URL("/", req.url);
  redirectUrl.searchParams.set("verified", "1");
  redirectUrl.searchParams.set("code", data.ref_code);
  return NextResponse.redirect(redirectUrl);
}
