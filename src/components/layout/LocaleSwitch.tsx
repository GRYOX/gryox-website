"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cover } from "@/lib/transition";

const NAMES: Record<Locale, string> = { pt: "Português", en: "English" };

/** PT | EN — keeps the current page and scroll position, covered by the diagonal wipe. */
export function LocaleSwitch({ className = "" }: { className?: string }) {
  const t = useTranslations("a11y");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const change = async (next: Locale) => {
    if (next === locale) return;
    await cover();
    // @ts-expect-error — params always match the current pathname template.
    router.replace({ pathname, params }, { locale: next, scroll: false });
  };

  return (
    <div role="group" aria-label={t("language")} className={`flex items-center hud ${className}`}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="mx-1.5 h-3 w-px rotate-[20deg] bg-line-strong" />}
          <button
            type="button"
            lang={l}
            onClick={() => change(l)}
            aria-current={l === locale ? "true" : undefined}
            aria-label={l === locale ? NAMES[l] : t("switchTo", { language: NAMES[l] })}
            className={`relative px-1.5 py-3 transition-colors duration-300 ${l === locale ? "text-fg" : "text-faint hover-fine:hover:text-fg"}`}
          >
            {l.toUpperCase()}
            <span
              aria-hidden="true"
              className={`absolute inset-x-1.5 bottom-2 h-px origin-left bg-green transition-transform duration-500 ease-out-expo ${l === locale ? "scale-x-100" : "scale-x-0"}`}
            />
          </button>
        </span>
      ))}
    </div>
  );
}
