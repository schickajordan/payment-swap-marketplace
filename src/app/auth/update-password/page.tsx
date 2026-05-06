import { PasswordRecoveryForm } from "@/components/account/password-recovery-form";

export const metadata = {
  title: "Update password",
  description: "Set a new password from your emailed recovery link.",
};

export default function UpdatePasswordRoutePage() {
  return <PasswordRecoveryForm />;
}
