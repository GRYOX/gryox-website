import { useTranslations } from "next-intl";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { TransitionLink } from "@/components/layout/TransitionLink";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main id="content" className="relative z-10 flex min-h-svh flex-col justify-center gutter">
      <SceneTrigger preset="notFound" start="top bottom" end="bottom top" />
      <p className="hud text-green-ink">{t("code")}</p>
      <h1 className="mt-6 max-w-[16ch] display-wide text-[clamp(2.4rem,7vw,6.5rem)] text-fg">{t("title")}</h1>
      <TransitionLink
        href="/"
        className="mt-12 w-fit border-b border-line-strong pb-2 text-fg hover-fine:hover:border-green"
      >
        {t("back")} →
      </TransitionLink>
    </main>
  );
}
