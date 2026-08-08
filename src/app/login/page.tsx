import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your check-ins, trends, and gentle support."
    >
      <LoginForm callbackUrl={safeCallbackUrl} />
    </AuthShell>
  );
}
