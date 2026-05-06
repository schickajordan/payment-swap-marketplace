import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/config/marketplace";
import { OrganizationJsonLd, WebSiteSearchJsonLd } from "@/lib/seo/json-ld";
import { getCanonicalSiteUrl as getOgSiteUrl } from "@/lib/seo/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreDisplay = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
  process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f14" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: APP_NAME,
  title: {
    default: "Payment Swap Marketplace | Heavy equipment for contractors",
    template: "%s · Payment Swap Marketplace",
  },
  description:
    "Browse skid steers, dump trucks, excavators, and trailers. Rentals, lease-to-own, and payment-plan deals between businesses—with clear terms and secure checkout.",
  keywords: [
    "dump truck rental near me",
    "skid steer rental marketplace",
    "mini excavator lease to own",
    "heavy equipment financing alternative",
    "contractor equipment rental marketplace",
    "payment swap marketplace",
    "construction equipment escrow",
    "heavy equipment sellers",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: APP_NAME,
    description:
      "Regional heavy-equipment marketplace for crews and dealers. Rentals, leases, installments, and escrow help when enabled.",
    siteName: APP_NAME,
    locale: "en_US",
    url: getOgSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "Shop heavy equipment online with contractor-friendly terms, tracked conversations, and secure payments.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Payment Swap",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${libreDisplay.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const k = 'psm-theme-mode';
              const saved = localStorage.getItem(k);
              const next = saved === 'light' || saved === 'dark' ? saved : 'light';
              document.documentElement.setAttribute('data-theme', next);
            } catch {}
          })();`}
        </Script>
        <OrganizationJsonLd />
        <WebSiteSearchJsonLd />
        {children}
      </body>
    </html>
  );
}
