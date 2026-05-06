"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#071733] px-4 text-center">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="max-w-md text-sm text-slate-400">
        That page hit a snag on our side. Try again—or head home and browse from there.
      </p>
      {process.env.NODE_ENV === "development" && error.message ? (
        <p className="max-w-2xl rounded-md border border-red-400/40 bg-red-950/60 px-3 py-2 text-left font-mono text-xs text-red-100">
          {error.message}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733]"
        >
          Try again
        </button>
        <Link href="/" className="rounded-md border border-white/20 px-4 py-2 text-sm text-white">
          Home
        </Link>
      </div>
    </div>
  );
}
