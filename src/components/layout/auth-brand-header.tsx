"use client";

import Image from "next/image";
import Link from "next/link";
import { APP_NAME, NAV_TAGLINE } from "@/lib/config/marketplace";

type AuthBrandHeaderProps = {
  /** Extra top padding when no global banner sits above (e.g. forgot password). */
  className?: string;
};

/**
 * Premium auth alignment: wordmark + SVG mark sized for recognition at small viewports.
 */
export function AuthBrandHeader({ className = "" }: AuthBrandHeaderProps) {
  return (
    <div className={`mb-6 text-center ${className}`.trim()}>
      <Link
        href="/"
        aria-label={`${APP_NAME} — return home`}
        className="inline-flex flex-col items-center gap-3 rounded-lg px-2 py-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-2 border-[var(--gold)]/65 bg-[var(--gold)]/12 shadow-[0_12px_40px_rgba(5,27,53,0.12)]">
          <Image
            src="/branding/psm-mark.svg"
            alt=""
            width={56}
            height={56}
            aria-hidden
          />
        </span>
        <span className="flex flex-col items-center gap-0.5">
          <span className="font-display text-sm font-bold uppercase tracking-[0.22em] text-[var(--gold)] md:text-base">
            {APP_NAME}
          </span>
          <span className="max-w-[20rem] text-balance text-[11px] font-medium leading-snug text-muted md:text-xs">
            {NAV_TAGLINE}
          </span>
        </span>
      </Link>
    </div>
  );
}
