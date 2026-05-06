import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config/marketplace";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "Payment Swap",
    description:
      "Premium contractor asset marketplace — rentals, lease-to-own, payment swaps, escrow-style payouts.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#050a14",
    theme_color: "#071733",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/marketing/pwa-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/marketing/pwa-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
