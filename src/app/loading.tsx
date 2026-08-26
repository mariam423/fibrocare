import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { translations } from "@/lib/translations";

export default async function Loading() {
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const loadingText = translations[locale]["common.loading"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-3">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
}
