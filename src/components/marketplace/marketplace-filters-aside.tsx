import Link from "next/link";
import { INITIAL_FOCUS_CATEGORIES } from "@/lib/config/marketplace";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { marketplaceQueryString } from "@/lib/marketplace/url";

const POPULAR_STATES = ["TX", "CA", "FL", "GA", "OH", "NC", "PA", "TN", "AZ", "MI"] as const;

type MarketplaceFiltersAsideProps = {
  q?: string;
  category?: string;
  state?: string;
  deal?: string;
  sort?: string;
};

function href(params: MarketplaceFiltersAsideProps & { category?: string; state?: string; deal?: string }) {
  return `/marketplace${marketplaceQueryString({
    q: params.q,
    category: params.category,
    state: params.state,
    deal: params.deal,
    sort: params.sort,
  })}`;
}

export function MarketplaceFiltersAside({ q, category, state, deal, sort }: MarketplaceFiltersAsideProps) {
  return (
    <aside className="w-full shrink-0 space-y-6 rounded-xl border border-white/10 bg-card p-4 text-sm lg:w-56 xl:w-64">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Department</h2>
        <ul className="mt-2 space-y-1">
          <li>
            <Link
              href={href({ q, state, deal, sort })}
              className={`block rounded px-2 py-1 hover:bg-white/10 ${!category ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}
            >
              All equipment
            </Link>
          </li>
          {INITIAL_FOCUS_CATEGORIES.map((cat) => {
            const active = category?.toLowerCase() === cat.toLowerCase();
            return (
              <li key={cat}>
                <Link
                  href={href({ q, category: cat, state, deal, sort })}
                  className={`block rounded px-2 py-1 capitalize hover:bg-white/10 ${active ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}
                >
                  {cat}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Popular states</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {POPULAR_STATES.map((st) => {
            const active = state?.toUpperCase() === st;
            return (
              <Link
                key={st}
                href={href({ q, category, state: st, deal, sort })}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${
                  active ?
                    "border-gold bg-gold/15 text-gold"
                  : "border-white/15 text-slate-300 hover:border-white/40"
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Deal template</h2>
        <ul className="mt-2 space-y-1">
          <li>
            <Link
              href={href({ q, category, state, sort })}
              className={`block rounded px-2 py-1 hover:bg-white/10 ${!deal ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}
            >
              Any template
            </Link>
          </li>
          {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => {
            const active = deal === lane.deal;
            return (
              <li key={lane.deal}>
                <Link
                  href={href({ q, category, state, deal: lane.deal, sort })}
                  className={`block rounded px-2 py-1 text-sm hover:bg-white/10 ${active ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}
                >
                  {lane.sidebarLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-white/10 pt-4">
        <Link href="/marketplace" className="text-xs font-semibold text-gold hover:text-[#ffd14d]">
          Clear all filters →
        </Link>
      </div>
    </aside>
  );
}
