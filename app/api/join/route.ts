import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

function generateRefCode(): string {
  // 8 chars, uppercase alphanumeric, no 0/1/I/O to avoid confusion
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

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

function verificationEmail(email: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email — Fleet</title>
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

                <!-- Mail icon -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table cellpadding="0" cellspacing="0" style="display:inline-table;width:56px;height:56px;border-radius:50%;background:rgba(59,131,246,0.15);border:1px solid rgba(59,131,246,0.3);">
                      <tr>
                        <td align="center" valign="middle" width="56" height="56" style="font-size:24px;">✉️</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:24px;font-weight:600;color:#3B83F6;letter-spacing:-0.5px;">
                      Verify your email
                    </h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;max-width:380px;">
                      Hi <strong style="color:#cbd5e1;">${email}</strong>, thanks for joining the Fleet waitlist.
                    </p>
                    <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#475569;max-width:380px;">
                      Click the button below to confirm your email address and secure your spot.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${verifyUrl}"
                      style="display:inline-block;padding:14px 36px;background:#3B83F6;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;letter-spacing:0.01em;">
                      Verify my email →
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.07);padding-bottom:20px;"></td>
                </tr>

                <!-- Fallback link -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
                      If the button doesn't work, copy and paste this link into your browser:<br/>
                      <a href="${verifyUrl}" style="color:#3B83F6;word-break:break-all;">${verifyUrl}</a>
                    </p>
                    <p style="margin:12px 0 0;font-size:12px;color:#334155;">
                      This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
                    </p>
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
    const { email, twitter, referred_by } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate a unique ref code — retry until unused (max 10 attempts)
    let ref_code = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateRefCode();
      const { data: existing } = await supabase
        .from("waitlist")
        .select("id")
        .eq("ref_code", candidate)
        .maybeSingle();
      if (!existing) {
        ref_code = candidate;
        break;
      }
    }
    if (!ref_code) {
      return NextResponse.json(
        { error: "Could not generate a unique referral code. Please try again." },
        { status: 500 }
      );
    }

    // Generate verification token
    const verification_token = generateVerificationToken();

    // Validate referred_by exists if provided
    let validReferredBy: string | null = null;
    if (referred_by && typeof referred_by === "string") {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("ref_code")
        .eq("ref_code", referred_by.trim().toUpperCase())
        .maybeSingle();
      if (referrer) validReferredBy = referrer.ref_code;
    }

    // Insert into Supabase as unverified
    const { error: dbError } = await supabase.from("waitlist").insert([
      {
        email: normalizedEmail,
        twitter: twitter?.trim() || null,
        ref_code,
        referred_by: validReferredBy,
        verified: false,
        verification_token,
      },
    ]);

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json({ error: "duplicate" }, { status: 409 });
      }
      throw dbError;
    }

    // Build verification URL from the incoming request origin
    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const verifyUrl = `${origin}/api/verify?token=${verification_token}`;

    // Send verification email
    await transporter.sendMail({
      from: `Fleet <${process.env.ZOHO_EMAIL}>`,
      to: normalizedEmail,
      subject: "Verify your email — Fleet waitlist",
      html: verificationEmail(normalizedEmail, verifyUrl),
    });

    return NextResponse.json({ pending: true });
  } catch (err) {
    console.error("[join] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
