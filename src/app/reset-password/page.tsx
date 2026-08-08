import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Choose a new password"
      description="Your reset link is valid for 60 minutes. Pick a password you'll remember."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
