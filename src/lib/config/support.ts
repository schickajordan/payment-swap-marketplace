/**
 * Public support / demo surfaces — all optional until set in hosting env.
 * Nothing here is secret; values are exposed to the client where used in JSX.
 */

import { APP_NAME } from "@/lib/config/marketplace";

function trimOrNull(raw: string | undefined): string | null {
  const t = raw?.trim();
  return t && t.length > 0 ? t : null;
}

/** e.g. ops@paymentswapmp.com */
export function getSupportEmail(): string | null {
  const v = trimOrNull(process.env.NEXT_PUBLIC_SUPPORT_EMAIL);
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  return v;
}

/** Calendly, HubSpot meeting, or mailto: — https:// or mailto: only */
export function getDemoBookingUrl(): string | null {
  const v = trimOrNull(process.env.NEXT_PUBLIC_DEMO_BOOKING_URL);
  if (!v) return null;
  if (v.startsWith("https://") || v.startsWith("http://") || v.toLowerCase().startsWith("mailto:")) {
    return v;
  }
  return null;
}

/** Zendesk / Notion / GitBook help center — https only */
export function getHelpCenterUrl(): string | null {
  const v = trimOrNull(process.env.NEXT_PUBLIC_HELP_CENTER_URL);
  if (!v) return null;
  return v.startsWith("https://") ? v : null;
}

export function supportMailtoHref(email: string): string {
  const subject = encodeURIComponent(`${APP_NAME} — support`);
  return `mailto:${email}?subject=${subject}`;
}
