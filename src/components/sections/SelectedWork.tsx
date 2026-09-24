import { useLocale, useTranslations } from "next-intl";
import { projects } from "@/data/projects";
import type { Locale } from "@/i18n/routing";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { WorkList, type WorkItem } from "./WorkList";

/** Selected work — an editorial index. Only real projects; placeholders are labelled. */
export function SelectedWork() {
  const t = useTranslations("work");
  const locale = useLocale() as Locale;

  const items: WorkItem[] = projects.map((p, i) => ({
    slug: p.slug,
    index: String(i + 1).padStart(2, "0"),
    title: p.title,
    category: p.category[locale],
    year: p.year,
    placeholder: p.placeholder,
    preview: p.preview,
    live: p.slug === "gryox-digital-matter",
  }));

  return (
    <section id="work" className="relative gutter py-[18vh]" aria-labelledby="work-title">
      <SceneTrigger preset="work" />
      <div className="relative grid gap-10 lg:grid-cols-12">
        <SectionLabel index="04" className="lg:col-span-12">
          {t("label")}
        </SectionLabel>
        <RevealText
          as="h2"
          id="work-title"
          by="chars"
          className="display-wide text-[clamp(3.4rem,12vw,12.5rem)] text-fg lg:col-span-8"
        >
          {t("title")}
        </RevealText>
        <p className="max-w-[34ch] self-end text-lg leading-relaxed text-muted lg:col-span-4">{t("intro")}</p>
      </div>

      <WorkList items={items} labels={{ view: t("view"), placeholder: t("placeholderNote"), live: t("live") }} />
    </section>
  );
}
