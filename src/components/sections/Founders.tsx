import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { founders } from "@/data/founders";
import type { Locale } from "@/i18n/routing";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { Parallax } from "@/components/ui/Parallax";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";

/**
 * Founders — real names only. Photos and bios stay clearly marked placeholders
 * until Rafael and Gabriel provide them (src/data/founders.ts).
 */
export function Founders() {
  const t = useTranslations("founders");
  const ta = useTranslations("a11y");
  const locale = useLocale() as Locale;

  return (
    <section id="about" className="relative gutter py-[18vh]" aria-labelledby="founders-title">
      <SceneTrigger preset="founders" />

      <div className="relative grid gap-10 lg:grid-cols-12">
        <SectionLabel index="06" className="lg:col-span-12">
          {t("label")}
        </SectionLabel>
        <RevealText
          as="h2"
          id="founders-title"
          className="display-wide text-[clamp(2.8rem,8vw,8.5rem)] text-fg lg:col-span-8"
        >
          {t("title")}
        </RevealText>
        <p className="max-w-[44ch] self-end text-lg leading-relaxed text-muted lg:col-span-4">{t("intro")}</p>
      </div>

      <div className="relative mt-[12vh] grid gap-16 md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-x-8">
        {founders.map((f, i) => {
          const card = (
            <article className="group" aria-labelledby={`founder-${f.id}`}>
              <div className="chamfer-frame relative aspect-[4/5] overflow-hidden [--c:18px]">
                {f.photo ? (
                  <Image
                    src={f.photo}
                    alt={f.name}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 grid place-items-center display-wide text-[clamp(10rem,32vw,26rem)] leading-none text-transparent transition-[color] duration-700 [-webkit-text-stroke:1px_var(--line-strong)] ${
                        i === 0 ? "group-hover:text-purple/25" : "group-hover:text-green/25"
                      }`}
                    >
                      {f.initial}
                    </span>
                    <span className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                      <span className="hud text-[0.6rem] text-faint">{t("photoPlaceholder")}</span>
                      <PlaceholderBadge label={ta("placeholder")} />
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="absolute top-4 left-4 hud text-[0.6rem] text-faint">
                  0{i + 1}
                </span>
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-6 border-b border-line pb-5">
                <h3 id={`founder-${f.id}`} className="display-wide text-[clamp(2.2rem,5vw,4rem)] text-fg">
                  {f.name}
                </h3>
                <p className="hud text-muted">{t("role")}</p>
              </div>
              {f.bio ? (
                <p className="mt-5 max-w-[46ch] leading-relaxed text-muted">{f.bio[locale]}</p>
              ) : (
                <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-faint">
                  {t("bioPlaceholder")}
                  <PlaceholderBadge label={ta("placeholder")} />
                </p>
              )}
              {f.links && (
                <ul className="mt-4 flex gap-4">
                  {f.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hud text-muted hover:text-fg"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
          return i === 1 ? (
            <Parallax key={f.id} speed={8} className="md:mt-32 lg:col-span-4 lg:col-start-8">
              {card}
            </Parallax>
          ) : (
            <div key={f.id} className="lg:col-span-4 lg:col-start-2">
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
