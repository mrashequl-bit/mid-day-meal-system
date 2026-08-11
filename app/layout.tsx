import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/anek-bangla/400.css";
import "@fontsource/anek-bangla/500.css";
import "@fontsource/anek-bangla/600.css";
import "@fontsource/anek-bangla/700.css";
import "@fontsource/anek-bangla/800.css";
import "./globals.css";
import "./desktop-print.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://midday-meal.local";
  const title = "মিড-ডে মিল ব্যবস্থাপনা";
  const description =
    "দুর্গাপুর উপজেলার ১২৬টি সরকারি প্রাথমিক বিদ্যালয়ের খাবার সরবরাহ, স্টক ও রিপোর্ট ব্যবস্থাপনা";

  return {
    title: {
      default: title,
      template: "%s | মিড-ডে মিল",
    },
    description,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/bd-logo.svg", type: "image/svg+xml" },
        { url: "/app-icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/app-icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/bd-logo.svg",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title,
      description,
      images: [`${origin}/og.png`],
      locale: "bn_BD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
