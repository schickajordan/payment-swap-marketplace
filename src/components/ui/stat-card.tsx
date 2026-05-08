type StatCardProps = {
  label: string;
  value: string;
  description: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="stat-card-pulse-ring cursor-default rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-5 shadow-sm shadow-[rgba(5,27,53,0.06)]">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--footer-bg)] text-[var(--gold)] transition-shadow duration-300"
        aria-hidden
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </article>
  );
}
