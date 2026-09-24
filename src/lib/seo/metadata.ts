import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/data/site";

type Href = Parameters<typeof getPathname>[0]["href"];

export const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US" };

/** Canonical + hreflang alternates for a route, in every locale. */
export function alternatesFor(href: Href, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = getPathname({ href, locale: l });
  languages["x-default"] = getPathname({ href, locale: routing.defaultLocale });
  return {
    canonical: getPathname({ href, locale }),
    languages,
  };
}

export const absoluteUrl = (path: string) => `${site.url}${path}`;
