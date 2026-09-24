import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/work/[slug]": {
      pt: "/projetos/[slug]",
      en: "/work/[slug]",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
