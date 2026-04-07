import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleets — Real-world yield without leaving DeFi",
  description:
    "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Fleets — Real-world yield without leaving DeFi",
    description:
      "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fleets — Real-world yield without leaving DeFi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleets — Real-world yield without leaving DeFi",
    description:
      "Real assets, real repayments, real-time transparency. Deploy capital where it compounds daily.",
    images: ["/og-image.png"],
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
