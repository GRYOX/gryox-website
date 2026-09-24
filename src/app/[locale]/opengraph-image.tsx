import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GRYOX";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Per-locale social card: official lockup on black, tagline, brand diagonal. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  const lockup = await readFile(join(process.cwd(), "public/brand/generated/lockup-on-dark.png"), "base64");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#050506",
        color: "#f3f3f0",
        padding: 72,
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          left: 1010,
          width: 2,
          height: 900,
          background: "linear-gradient(#00cc69, #7922ed)",
          transform: "rotate(38deg)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img src={`data:image/png;base64,${lockup}`} width={300} height={234} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02, maxWidth: 900 }}>
            {t("title").split(" — ")[1] ?? t("title")}
          </div>
          <div style={{ fontSize: 22, color: "rgba(243,243,240,0.6)", maxWidth: 820 }}>{t("description")}</div>
        </div>
      </div>
    </div>,
    size,
  );
}
