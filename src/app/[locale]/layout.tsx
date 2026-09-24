import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { themeScript } from "@/lib/theme/theme-script";
import { introScript } from "@/lib/intro";
import { alternatesFor, OG_LOCALE } from "@/lib/seo/metadata";
import { site } from "@/data/site";
import { ScrollProvider } from "@/lib/scroll/ScrollProvider";
import { WebGLStage } from "@/components/three/WebGLStage";
import { Navigation } from "@/components/layout/Navigation";
import { SkipLink } from "@/components/layout/SkipLink";
import { Cursor } from "@/components/ui/Cursor";
import { Opening } from "@/components/sections/Opening";
import { PageTransition } from "@/components/layout/PageTransition";
import { InlineScript } from "@/components/layout/InlineScript";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { MotionProvider } from "@/components/layout/MotionProvider";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark light",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s — ${site.name}` },
    description: t("description"),
    applicationName: site.name,
    authors: site.founders.map((name) => ({ name })),
    alternates: alternatesFor("/", locale),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t("title"),
      description: t("description"),
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
        <InlineScript html={introScript} />
      </head>
      <body>
        <NextIntlClientProvider>
          <ThemeSync />
          <MotionProvider>
            <ScrollProvider>
              <SkipLink />
              <WebGLStage />
              <Navigation />
              {children}
              <Opening />
              <PageTransition />
              <Cursor />
            </ScrollProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
