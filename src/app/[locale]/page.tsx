import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { organizationJsonLd, jsonLdScript } from "@/lib/seo/jsonld";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Capabilities } from "@/components/sections/Capabilities";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Lab } from "@/components/sections/Lab";
import { Founders } from "@/components/sections/Founders";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale });
  const services = (["software", "web", "apps", "ai", "automation"] as const).map((id) =>
    t(`capabilities.items.${id}.title`),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(t("meta.description"), services)) }}
      />
      <main id="content" className="relative z-10">
        <Hero />
        <Manifesto />
        <Capabilities />
        <SelectedWork />
        <Lab />
        <Founders />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
