"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { authRoutes } from "@/lib/navigation";
import { INITIAL_FORGOT_EMAIL_FORM_STATE } from "@/lib/auth/auth-form-state";

function fieldClass(hasError: boolean): string {
  const base = "input-field rounded-md px-3 py-2.5";
  if (!hasError) return base;
  return `${base} border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]`;
}

export function ForgotPasswordEmailForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    INITIAL_FORGOT_EMAIL_FORM_STATE,
  );

  const emailErr = state.fieldErrors?.email;
  const apiErr = state.formError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {(apiErr?.length ?? 0) > 0 ?
        <p className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
          {apiErr}
        </p>
      : null}
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          aria-invalid={emailErr ? true : undefined}
          aria-describedby={emailErr ? "forgot-email-error" : undefined}
          className={fieldClass(!!emailErr)}
        />
        {emailErr ?
          <span id="forgot-email-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {emailErr}
          </span>
        : null}
      </label>
      <button
        type="submit"
        className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-opacity hover:opacity-95 active:translate-y-px"
      >
        Email reset link
      </button>
      <p className="text-xs leading-relaxed text-muted">
        Remembered your password?{" "}
        <Link href={authRoutes.signIn} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
