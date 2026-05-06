"use client";

import Link from "next/link";
import { savedSearchLabelForDealParam } from "@/lib/marketplace/deal-lanes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "psm-marketplace-saved-searches";

type SavedEntry = {
  href: string;
  label: string;
  created: number;
};

function loadSaved(): SavedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedEntry =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as SavedEntry).href === "string" &&
        typeof (row as SavedEntry).label === "string" &&
        typeof (row as SavedEntry).created === "number"
    );
  } catch {
    return [];
  }
}

/** Persist marketplace filter URLs locally—faster return visits than generic car-share apps. */
export function SavedMarketplaceSearchesToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = useMemo(() => searchParams.toString(), [searchParams]);
  const [saved, setSaved] = useState<SavedEntry[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSaved(loadSaved());
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const persist = useCallback((next: SavedEntry[]) => {
    const trimmed = next.slice(0, 8);
    setSaved(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }, []);

  const saveCurrent = () => {
    if (!qs) return;
    const href = `${pathname}?${qs}`;
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const deal = searchParams.get("deal")?.trim().toLowerCase();
    const state = searchParams.get("state")?.trim();
    const sort = searchParams.get("sort")?.trim();
    const dealLabel = savedSearchLabelForDealParam(deal);
    const label =
      q && q.length > 0 ? `“${q.slice(0, 36)}${q.length > 36 ? "…" : ""}”`
      : category ? category.slice(0, 40)
      : dealLabel ? dealLabel
      : state ? `State ${state.toUpperCase()}`
      : sort ? `Sort: ${sort}`
      : "Saved filters";

    const next: SavedEntry[] = [
      { href, label, created: Date.now() },
      ...saved.filter((s) => s.href !== href),
    ];
    persist(next);
  };

  const removeSaved = (href: string) => {
    persist(saved.filter((s) => s.href !== href));
  };

  if (pathname !== "/marketplace") {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#091c3d]/50 px-3 py-3 text-xs text-slate-200 md:text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-white">Saved searches</span>
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!qs}
          className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40 md:text-xs"
        >
          Save current filters
        </button>
        {!qs ?
          <span className="text-slate-500">Add a search term, category, state, or sort—then tap save.</span>
        : null}
      </div>
      {saved.length > 0 ?
        <ul className="mt-3 flex flex-wrap gap-2">
          {saved.map((entry) => (
            <li
              key={entry.href}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-black/25 pl-3 text-[11px] md:text-xs"
            >
              <button
                type="button"
                onClick={() => router.push(entry.href)}
                className="py-1.5 font-medium text-white hover:text-gold"
              >
                {entry.label}
              </button>
              <button
                type="button"
                aria-label={`Remove saved search ${entry.label}`}
                onClick={() => removeSaved(entry.href)}
                className="px-2 py-1.5 text-slate-500 hover:text-red-300"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      : null}
      <p className="mt-2 text-[11px] text-slate-500">
        Saved on this device only—perfect for repeat lanes (state + category combos).{" "}
        <Link href="/about#platform-edge" className="text-gold hover:text-[#ffd14d]">
          Why we built this →
        </Link>
      </p>
    </div>
  );
}
