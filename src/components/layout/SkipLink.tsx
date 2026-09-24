import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("a11y");
  return (
    <a
      href="#content"
      className="fixed top-4 left-4 z-[100] -translate-y-24 bg-fg px-4 py-3 hud text-bg transition-transform focus-visible:translate-y-0"
    >
      {t("skip")}
    </a>
  );
}
