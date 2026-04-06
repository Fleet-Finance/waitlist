import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleets — Real-world yield without leaving DeFi",
  description:
    "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
  openGraph: {
    title: "Fleets — Real-world yield without leaving DeFi",
    description:
      "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleets — Real-world yield without leaving DeFi",
    description:
      "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
