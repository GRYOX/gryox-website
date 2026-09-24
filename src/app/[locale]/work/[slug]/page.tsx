import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProject, projects } from "@/data/projects";
import type { Locale } from "@/i18n/routing";
import { alternatesFor, OG_LOCALE } from "@/lib/seo/metadata";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { Footer } from "@/components/layout/Footer";
import { MatterPreview } from "@/components/ui/MatterPreview";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { RevealText } from "@/components/ui/RevealText";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const l = locale as Locale;
  return {
    title: project.title,
    description: project.summary[l],
    alternates: alternatesFor({ pathname: "/work/[slug]", params: { slug } }, l),
    openGraph: {
      title: project.title,
      description: project.summary[l],
      locale: OG_LOCALE[l],
      type: "article",
      // A route-level openGraph object replaces the parent one, so reference the locale card.
      images: [{ url: `/${l}/opengraph-image`, width: 1200, height: 630 }],
    },
    robots: project.placeholder ? { index: false, follow: true } : undefined,
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  const l = locale as Locale;
  setRequestLocale(l);
  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations({ locale: l, namespace: "work" });
  const ta = await getTranslations({ locale: l, namespace: "a11y" });
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <main id="content" className="relative z-10">
        <article className="relative gutter pt-32 pb-[14vh] sm:pt-40" aria-labelledby="case-title">
          <SceneTrigger preset="case" start="top top" end="bottom top" />

          <TransitionLink
            href={{ pathname: "/", hash: "work" }}
            className="group inline-flex items-center gap-3 hud text-muted hover-fine:hover:text-fg"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
            >
              ←
            </span>
            {t("back")}
          </TransitionLink>

          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-12">
              <span className="hud text-green-ink">{String(index + 1).padStart(2, "0")}</span>
              <span className="hud text-muted">{project.category[l]}</span>
              <span className="hud text-faint">{project.year}</span>
              {project.placeholder && <PlaceholderBadge label={t("placeholderNote")} />}
            </div>
            <RevealText
              as="h1"
              id="case-title"
              className="display-wide text-[clamp(2.8rem,8.5vw,9rem)] text-fg lg:col-span-10"
            >
              {project.title}
            </RevealText>
            <p className="max-w-[46ch] text-xl leading-relaxed text-fg/85 lg:col-span-6">{project.summary[l]}</p>
          </div>

          <div className="chamfer-frame mt-[10vh] aspect-[16/9] overflow-hidden p-px [--c:18px]">
            {project.preview.kind === "matter" ? (
              <MatterPreview target={project.preview.target} className="h-full w-full" />
            ) : (
              <span className="relative block h-full w-full">
                <Image
                  src={project.preview.src}
                  alt={project.preview.alt[l]}
                  fill
                  priority
                  sizes="(min-width: 1440px) 1330px, 100vw"
                  className="object-cover"
                />
              </span>
            )}
          </div>

          <div className="mt-[10vh] grid gap-12 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <dl className="grid gap-6 border-t border-line pt-6">
                <div>
                  <dt className="hud text-faint">{t("category")}</dt>
                  <dd className="mt-2 text-fg">{project.category[l]}</dd>
                </div>
                <div>
                  <dt className="hud text-faint">{t("year")}</dt>
                  <dd className="mt-2 text-fg">{project.year}</dd>
                </div>
                {project.stack.length > 0 && (
                  <div>
                    <dt className="hud text-faint">{t("stack")}</dt>
                    <dd className="mt-3 flex flex-wrap gap-2">
                      {project.stack.map((s) => (
                        <span
                          key={s}
                          className="chamfer-frame px-2.5 py-1 text-xs text-muted [--c:6px] [--fill:var(--bg)]"
                        >
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
            <div className="lg:col-span-7 lg:col-start-6">
              <h2 className="hud text-faint">{t("overview")}</h2>
              <div className="mt-6 space-y-6 text-lg leading-relaxed text-fg/85">
                {project.body[l].map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              {project.placeholder && (
                <p className="mt-8">
                  <PlaceholderBadge label={ta("placeholder")} />
                </p>
              )}
            </div>
          </div>
        </article>

        <section className="relative border-t border-line gutter py-[12vh]" aria-label={t("next")}>
          <TransitionLink
            href={{ pathname: "/work/[slug]", params: { slug: next.slug } }}
            data-cursor="open"
            className="group block"
          >
            <span className="hud text-muted">{t("next")}</span>
            <span className="mt-4 flex items-baseline justify-between gap-6">
              <span className="display-wide text-[clamp(2.2rem,7vw,7rem)] text-fg transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
                {next.title}
              </span>
              <span aria-hidden="true" className="text-3xl text-faint transition-colors group-hover:text-fg">
                →
              </span>
            </span>
          </TransitionLink>
        </section>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
