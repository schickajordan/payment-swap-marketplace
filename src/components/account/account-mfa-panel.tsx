"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export function AccountMfaPanel() {
  const supabase = useMemo(() => createClientSupabaseClient(), []);

  type FactorBrief = {
    id: string;
    friendly_name?: string | null;
    factor_type?: string;
    status?: string;
  };

  const [factors, setFactors] = useState<FactorBrief[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [enrollQr, setEnrollQr] = useState<{
    id: string;
    secret?: string | null;
    uri?: string | null;
    qr?: string | null;
  } | null>(null);
  const [enrollCode, setEnrollCode] = useState("");

  const refresh = useCallback(async () => {
    const { data, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) {
      setError(listErr.message);
      return;
    }
    const allFactors = data?.all ?? [];
    setFactors(allFactors as FactorBrief[]);
    setError(null);
  }, [supabase]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(t);
  }, [refresh]);

  async function startTotpEnrollment() {
    setBusy(true);
    setEnrollQr(null);
    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator (${new Date().toISOString().slice(0, 10)})`,
    });

    setBusy(false);

    if (enrollErr || !data) {
      setError(enrollErr?.message ?? "MFA enrolment failed.");
      return;
    }

    setEnrollQr({
      id: data.id,
      secret: data.totp?.secret,
      uri: data.totp?.uri,
      qr: data.totp?.qr_code,
    });
    setEnrollCode("");
    setError(null);
  }

  async function finalizeTotp() {
    if (!enrollQr) return;

    const code = enrollCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setBusy(true);
    const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollQr.id,
      code,
    });
    setBusy(false);

    if (verifyErr) {
      setError(verifyErr.message);
      return;
    }

    setEnrollQr(null);
    await refresh();
  }

  async function removeFactor(id: string) {
    setBusy(true);
    const { error: unErr } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);

    if (unErr) {
      setError(unErr.message);
      return;
    }

    await refresh();
  }

  return (
    <section className="rounded-xl border border-white/10 bg-card p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Two-factor authentication</h2>
      <p className="mt-1 text-xs text-slate-400">
        Add TOTP apps (Google Authenticator, Authy, 1Password). Your organization can require MFA for every sign-in
        through the auth settings on the hosting side.
      </p>

      {error ?
        <p className="mt-3 rounded-md border border-red-300/35 bg-red-500/10 p-2 text-sm text-red-200">{error}</p>
      : null}

      <ul className="mt-3 space-y-2 text-sm">
        {factors.length === 0 ?
          <li className="text-slate-400">No extra factors enrolled yet.</li>
        : factors.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/5 bg-[#091c3d]/40 px-2 py-1.5"
            >
              <span className="text-slate-200">
                {f.friendly_name ?? f.factor_type} ·{" "}
                <span className="text-[11px] uppercase text-slate-500">{f.status}</span>
              </span>
              {f.factor_type === "totp" ?
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeFactor(f.id)}
                  className="text-[11px] font-bold uppercase tracking-wide text-amber-200 hover:text-amber-100 disabled:opacity-40"
                >
                  Remove
                </button>
              : null}
            </li>
          ))
        }
      </ul>

      <div className="mt-4 border-t border-white/10 pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void startTotpEnrollment()}
          className="rounded-md bg-gold/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/30 disabled:opacity-40"
        >
          Pair authenticator app
        </button>
      </div>

      {enrollQr ?
        <div className="mt-4 space-y-2 rounded-lg border border-gold/30 bg-black/25 p-3 text-sm">
          <p className="font-semibold text-white">Finish pairing</p>
          {enrollQr.qr ?
            // eslint-disable-next-line @next/next/no-img-element -- Supabase returns a data URL for TOTP setup
            <img
              src={enrollQr.qr}
              width={148}
              height={148}
              alt="Authenticator QR code"
              className="rounded border border-white/10 bg-white p-1"
            />
          : null}
          {enrollQr.secret ?
            <p className="break-all font-mono text-xs text-slate-300">{enrollQr.secret}</p>
          : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
              6-digit code
              <input
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1 text-white outline-none focus:border-gold"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void finalizeTotp()}
              className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#071733] hover:bg-[#ffd14d] disabled:opacity-40"
            >
              Verify factor
            </button>
          </div>
        </div>
      : null}
    </section>
  );
}
