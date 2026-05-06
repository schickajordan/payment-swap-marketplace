"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/(auth)/actions";
import { INITIAL_AUTH_CREDENTIAL_FORM_STATE } from "@/lib/auth/auth-form-state";

type SignUpEmailFormProps = {
  defaultRole: "buyer" | "seller";
  allowPublicAdminSignUp: boolean;
};

function fieldClass(hasError: boolean): string {
  const base = "input-field rounded-md px-3 py-2.5";
  if (!hasError) return base;
  return `${base} border-[var(--danger-border)] ring-1 ring-[var(--danger-border)]`;
}

export function SignUpEmailForm({
  defaultRole,
  allowPublicAdminSignUp,
}: SignUpEmailFormProps) {
  const [state, formAction] = useActionState(signUpAction, INITIAL_AUTH_CREDENTIAL_FORM_STATE);

  const fullNameErr = state.fieldErrors?.fullName;
  const emailErr = state.fieldErrors?.email;
  const passwordErr = state.fieldErrors?.password;
  const roleErr = state.fieldErrors?.role;
  const apiErr = state.formError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {(apiErr?.length ?? 0) > 0 ?
        <p className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
          {apiErr}
        </p>
      : null}
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Display name (optional)
        <input
          type="text"
          name="fullName"
          maxLength={200}
          placeholder="How we greet you in threads"
          aria-invalid={fullNameErr ? true : undefined}
          aria-describedby={fullNameErr ? "signup-name-error" : undefined}
          className={fieldClass(!!fullNameErr)}
        />
        {fullNameErr ?
          <span id="signup-name-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {fullNameErr}
          </span>
        : null}
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          aria-invalid={emailErr ? true : undefined}
          aria-describedby={emailErr ? "signup-email-error" : undefined}
          className={fieldClass(!!emailErr)}
        />
        {emailErr ?
          <span id="signup-email-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {emailErr}
          </span>
        : null}
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Password
        <input
          type="password"
          name="password"
          minLength={8}
          required
          autoComplete="new-password"
          aria-invalid={passwordErr ? true : undefined}
          aria-describedby={passwordErr ? "signup-password-error" : undefined}
          className={fieldClass(!!passwordErr)}
        />
        {passwordErr ?
          <span id="signup-password-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {passwordErr}
          </span>
        : null}
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
        Account role
        <select
          name="role"
          defaultValue={defaultRole}
          aria-invalid={roleErr ? true : undefined}
          aria-describedby={roleErr ? "signup-role-error" : undefined}
          className={fieldClass(!!roleErr)}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          {allowPublicAdminSignUp ?
            <option value="admin">Admin (staging only)</option>
          : null}
        </select>
        {roleErr ?
          <span id="signup-role-error" className="text-xs font-semibold text-[var(--danger-text)]">
            {roleErr}
          </span>
        : null}
      </label>
      <button
        type="submit"
        className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-colors hover:opacity-[0.93] active:translate-y-px"
      >
        Create account
      </button>
    </form>
  );
}
