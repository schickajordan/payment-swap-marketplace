"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/app/(auth)/actions";
import { authRoutes } from "@/lib/navigation";
import { INITIAL_AUTH_CREDENTIAL_FORM_STATE } from "@/lib/auth/auth-form-state";

type SignInEmailFormProps = {
  nextQueryValue: string;
};

function fieldClass(hasError: boolean): string {
  const base = "input-field rounded-md px-3 py-2.5";
  if (!hasError) return base;
  return `${base} border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]`;
}

export function SignInEmailForm({ nextQueryValue }: SignInEmailFormProps) {
  const [state, formAction] = useActionState(signInAction, INITIAL_AUTH_CREDENTIAL_FORM_STATE);

  const emailErr = state.fieldErrors?.email;
  const passwordErr = state.fieldErrors?.password;
  const apiErr = state.formError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={nextQueryValue} />
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
          aria-describedby={emailErr ? "signin-email-error" : undefined}
          className={fieldClass(!!emailErr)}
        />
        {emailErr ?
          <span id="signin-email-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {emailErr}
          </span>
        : null}
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          aria-invalid={passwordErr ? true : undefined}
          aria-describedby={passwordErr ? "signin-password-error" : undefined}
          className={fieldClass(!!passwordErr)}
        />
        {passwordErr ?
          <span id="signin-password-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {passwordErr}
          </span>
        : null}
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={authRoutes.forgotPassword}
          className="text-xs font-semibold text-[var(--link)] underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-opacity hover:opacity-95 active:translate-y-px"
      >
        Sign in
      </button>
    </form>
  );
}
