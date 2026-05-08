import type { ReactNode } from "react";

type CinematicHeroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  aside?: ReactNode;
  ctas?: ReactNode;
};

/**
 * Marketing hero with strong foreground scrims for WCAG readability on photographic backgrounds.
 * SVG is applied via CSS background so it always paints (Next/Image + SVG + fill can render blank in production).
 */
export function CinematicHero({ eyebrow, title, subtitle, aside, ctas }: CinematicHeroProps) {
  return (
    <section className="marketing-hero relative isolate overflow-hidden rounded-3xl border border-[var(--steel-line)] shadow-[0_32px_120px_-24px_rgba(0,0,0,0.75)] lg:rounded-[2rem]">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-hero-zoom absolute inset-0 bg-cover bg-center opacity-[0.58]"
          style={{ backgroundImage: "url('/branding/hero-industrial-premium.svg')" }}
          role="img"
          aria-label="Heavy equipment illustration on a job site"
        />
        <div className="hero-grid-overlay absolute inset-0" aria-hidden />
        <div className="hero-vignette absolute inset-0" aria-hidden />
        <div className="hero-scrim-strong absolute inset-0 z-[1]" aria-hidden />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:min-h-[420px] lg:flex-row lg:items-stretch lg:justify-between lg:gap-12">
        <div className="flex flex-1 flex-col justify-end p-6 pb-10 md:p-10 lg:pb-12 lg:pl-12 lg:pr-8 lg:pt-16">
          <div className="animate-fade-up max-w-xl">
            <div className="text-[12px] font-semibold tracking-wide text-[var(--gold)] drop-shadow-md md:text-[13px]">
              {eyebrow}
            </div>
            <h1 className="font-display mt-4 text-balance text-3xl font-bold leading-[1.12] tracking-tight text-white shadow-black/90 drop-shadow-[0_4px_28px_rgba(0,0,0,0.92)] md:text-[2.5rem] lg:text-[3rem] lg:leading-[1.08]">
              {title}
            </h1>
          </div>
          <div className="animate-fade-up motion-delay-sm mt-5 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-white shadow-black/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] md:text-base">
            {subtitle}
          </div>
          <div className="animate-fade-up motion-delay-md mt-6 flex flex-wrap gap-3">{ctas}</div>
        </div>

        <div className="relative border-t border-[var(--steel-line)] bg-[var(--card-muted)] p-6 backdrop-blur-xl md:border-t-0 md:border-l lg:max-w-sm lg:flex-none xl:max-w-md">
          <div className="animate-fade-up">{aside}</div>
        </div>
      </div>
    </section>
  );
}
