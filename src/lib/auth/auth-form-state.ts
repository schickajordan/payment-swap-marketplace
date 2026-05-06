export type CredentialFieldErrors = Partial<
  Record<"email" | "password" | "fullName" | "role", string>
>;

export type AuthCredentialFormState = Readonly<{
  fieldErrors?: CredentialFieldErrors;
  formError?: string | null;
}>;

/** Stable reference for `useActionState` initial state */
export const INITIAL_AUTH_CREDENTIAL_FORM_STATE: AuthCredentialFormState =
  Object.freeze({});

function trimmed(s: unknown): string {
  return String(s ?? "").trim();
}

export function normalizeEmailForAuth(value: unknown): string {
  return trimmed(value).replace(/\s+/g, "").toLowerCase();
}

/** Accepts pragmatic business emails — not RFC exhaustive */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/iu;

export type SignInValidated = { success: true; email: string; password: string };

export function isSignInValidated(
  result: AuthCredentialFormState | SignInValidated,
): result is SignInValidated {
  return "success" in result && result.success === true;
}

export function validateSignInForm(
  formData: FormData,
): AuthCredentialFormState | SignInValidated {
  const email = normalizeEmailForAuth(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const fieldErrors: CredentialFieldErrors = {};

  if (!email) {
    fieldErrors.email = "Enter your email.";
  } else if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Use a complete address such as ops@carrier.com.";
  }

  if (!password) {
    fieldErrors.password = "Enter your password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return { success: true, email, password };
}

const MIN_SIGNUP_PASSWORD = 8;
const FULL_NAME_MAX = 200;

export type SignUpValidated = {
  success: true;
  email: string;
  password: string;
  fullNameRaw: string;
  roleCandidate: unknown;
};

export function isSignUpValidated(
  result: AuthCredentialFormState | SignUpValidated,
): result is SignUpValidated {
  return "success" in result && result.success === true;
}

export function validateSignUpForm(formData: FormData): AuthCredentialFormState | SignUpValidated {
  const email = normalizeEmailForAuth(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const fullNameRaw = trimmed(formData.get("fullName"));
  const roleCandidate = formData.get("role");

  const fieldErrors: CredentialFieldErrors = {};

  if (fullNameRaw.length > FULL_NAME_MAX) {
    fieldErrors.fullName = `Use ${FULL_NAME_MAX} characters or fewer.`;
  }

  if (!email) {
    fieldErrors.email = "Enter your email.";
  } else if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Use a complete address such as billing@equipment.com.";
  }

  if (!password) {
    fieldErrors.password = "Choose a password.";
  } else if (password.length < MIN_SIGNUP_PASSWORD) {
    fieldErrors.password = `Use at least ${MIN_SIGNUP_PASSWORD} characters.`;
  }

  if (!roleCandidate || typeof roleCandidate !== "string") {
    fieldErrors.role = "Choose buyer or seller.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    success: true,
    email,
    password,
    fullNameRaw,
    roleCandidate,
  };
}

export type ForgotEmailFormState = Readonly<{
  fieldErrors?: Pick<CredentialFieldErrors, "email">;
  formError?: string | null;
}>;

export const INITIAL_FORGOT_EMAIL_FORM_STATE: ForgotEmailFormState = Object.freeze({});

export type ForgotEmailValidated = { success: true; email: string };

export function isForgotEmailValidated(
  result: ForgotEmailFormState | ForgotEmailValidated,
): result is ForgotEmailValidated {
  return "success" in result && result.success === true;
}

export function validateForgotEmailForm(
  formData: FormData,
): ForgotEmailFormState | ForgotEmailValidated {
  const email = normalizeEmailForAuth(formData.get("email"));
  const fieldErrors: Pick<CredentialFieldErrors, "email"> = {};

  if (!email) {
    fieldErrors.email = "Enter your email.";
  } else if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Use a complete address such as ops@carrier.com.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return { success: true, email };
}
