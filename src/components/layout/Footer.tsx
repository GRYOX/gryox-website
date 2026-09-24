import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SmartAnchor } from "./SmartAnchor";
import { NAV_ITEMS } from "./nav-items";

/** The loop closes: the matter becomes the symbol again above the official lockup. */
export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative flex min-h-svh flex-col justify-end gutter pt-[40vh] pb-8">
      <SceneTrigger preset="footer" start="top 45%" end="bottom top" />

      <div className="relative grid gap-12 border-t border-line pt-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image
            src={site.logo.lockup.dark}
            alt="GRYOX"
            width={960}
            height={748}
            className="h-auto w-40 sm:w-48 light:hidden"
          />
          <Image
            src={site.logo.lockup.light}
            alt="GRYOX"
            width={960}
            height={748}
            className="hidden h-auto w-40 sm:w-48 light:block"
          />
          <p className="mt-6 max-w-[30ch] text-muted">{t("footer.tagline")}</p>
        </div>

        <nav aria-label={t("a11y.mainNav")} className="lg:col-span-4">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <SmartAnchor
                  hash={item.hash}
                  className="inline-block py-2 text-fg/85 transition-colors hover-fine:hover:text-green-ink"
                >
                  {t(`nav.${item.key}`)}
                </SmartAnchor>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:items-end">
          <SmartAnchor
            hash="top"
            className="group flex items-center gap-2 py-2 hud text-muted hover-fine:hover:text-fg"
          >
            {t("footer.top")}
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5"
            >
              ↑
            </span>
          </SmartAnchor>
        </div>
      </div>

      <div className="relative mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} GRYOX. {t("footer.rights")}
        </p>
        <p>{t("footer.built")}</p>
      </div>
    </footer>
  );
}
