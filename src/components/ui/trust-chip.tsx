import type { ReactNode } from "react";

type Tone = "gold" | "steel" | "muted";

const toneClasses: Record<Tone, string> = {
  gold:
    "border-gold/50 bg-[#261b05]/95 text-[#ffe7a8] shadow-[0_0_24px_-8px_rgba(242,183,5,0.45)]",
  steel: "border-white/28 bg-[#0b142e]/94 text-[#dae4f8]",
  muted: "border-white/14 bg-[#081022]/92 text-muted",
};

type TrustChipProps = {
  children: ReactNode;
  tone?: Tone;
  title?: string;
};

export function TrustChip({ children, tone = "steel", title }: TrustChipProps) {
  return (
    <li>
      <span
        role="presentation"
        title={title}
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClasses[tone]}`}
      >
        {children}
      </span>
    </li>
  );
}
