import type { ReactNode } from "react";

type LegalDocumentFrameProps = {
  children: ReactNode;
};

/** Shared chrome for Terms / Privacy so policy pages match the rest of the brand system. */
export function LegalDocumentFrame({ children }: LegalDocumentFrameProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      <div className="hero-accent-rail mb-8 rounded-full opacity-90" aria-hidden />
      <div className="panel-elevated rounded-2xl px-5 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
