import { PasswordRecoveryForm } from "@/components/account/password-recovery-form";
import { HostingConfigBanner } from "@/components/layout/hosting-config-banner";

export const metadata = {
  title: "Update password",
  description: "Set a new password from your emailed recovery link.",
};

export default function UpdatePasswordRoutePage() {
  return (
    <>
      <HostingConfigBanner />
      <PasswordRecoveryForm />
    </>
  );
}
