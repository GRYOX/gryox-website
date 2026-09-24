import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { projects } from "@/data/projects";
import { absoluteUrl } from "@/lib/seo/metadata";

type Href = Parameters<typeof getPathname>[0]["href"];

function entry(href: Href, priority: number): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(getPathname({ href, locale }))]),
  );
  return {
    url: absoluteUrl(getPathname({ href, locale: routing.defaultLocale })),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", 1),
    ...projects
      .filter((p) => !p.placeholder)
      .map((p) => entry({ pathname: "/work/[slug]", params: { slug: p.slug } }, 0.7)),
  ];
}
