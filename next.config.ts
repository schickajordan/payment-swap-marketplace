import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Anchor Turbopack when another lockfile exists higher in the directory tree */
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: PROJECT_ROOT,
  },
  /** Baseline headers for deployed sites; CSP omitted to avoid blocking Stripe/Supabase embeddings. */
  async headers() {
    /** Makes it obvious in `curl -I` whether traffic hits the Git-linked deployment (wrong Vercel project = header missing/mismatched old HTML). */
    const vercelCommit =
      typeof process.env.VERCEL_GIT_COMMIT_SHA === "string"
        ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
        : "";
    const deployStamp: Array<{ key: string; value: string }> =
      vercelCommit ? [{ key: "X-PSM-Deploy-Commit", value: vercelCommit }] : [];

    const enableHsts =
      process.env.VERCEL_ENV === "production" || process.env.ENABLE_HSTS === "1";

    const extras =
      enableHsts ?
        [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ]
      : [];

    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          ...deployStamp,
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...deployStamp,
          ...extras,
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440],
    imageSizes: [32, 64, 128, 192, 256, 384, 520],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
