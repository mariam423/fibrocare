import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { cookies } from "next/headers";
import { parseLocale, LOCALE_COOKIE } from "@/lib/locale";
import { translations } from "@/lib/translations";

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
      : "/dashboard";

  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = translations[locale];

  return (
    <AuthShell
      title={t["auth.login.title"]}
      description={t["auth.login.description"]}
    >
      <LoginForm callbackUrl={safeCallbackUrl} />
    </AuthShell>
  );
}
