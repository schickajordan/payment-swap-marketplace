import Image from "next/image";
import type { ReactNode } from "react";

type CinematicHeroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  aside?: ReactNode;
  ctas?: ReactNode;
};

/**
 * Bloomberg-meets-job-site chrome: cinematic still + layered glass panel.
 * Uses `priority` image for LCP on home; prefers reduced motion via CSS.
 */
export function CinematicHero({ eyebrow, title, subtitle, aside, ctas }: CinematicHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/15 shadow-[0_32px_120px_-24px_rgba(0,0,0,0.75)] lg:rounded-[2rem]">
      <div className="absolute inset-0">
        <Image
          src="/marketing/hero-industrial-nightshift.png"
          alt="Heavy dump truck and excavator on a cinematic construction site at dusk"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          quality={82}
          className="animate-hero-zoom object-cover object-center opacity-[0.58]"
        />
        <div className="hero-grid-overlay absolute inset-0" aria-hidden />
        <div className="hero-vignette absolute inset-0" aria-hidden />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:min-h-[420px] lg:flex-row lg:items-stretch lg:justify-between lg:gap-12">
        <div className="flex flex-1 flex-col justify-end p-6 pb-10 md:p-10 lg:pb-12 lg:pl-12 lg:pr-8 lg:pt-16">
          <div className="animate-fade-up max-w-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold md:text-xs">{eyebrow}</div>
            <h1 className="mt-4 text-balance text-3xl font-black uppercase leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
          </div>
          <div className="animate-fade-up motion-delay-sm mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-slate-200/95 md:text-base">
            {subtitle}
          </div>
          <div className="animate-fade-up motion-delay-md mt-6 flex flex-wrap gap-3">{ctas}</div>
        </div>

        <div className="relative border-t border-white/10 bg-[#070f22]/82 p-6 backdrop-blur-xl md:border-t-0 md:border-l lg:max-w-sm lg:flex-none xl:max-w-md">
          <div className="animate-fade-up">{aside}</div>
        </div>
      </div>
    </section>
  );
}
