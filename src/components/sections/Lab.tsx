import { useTranslations } from "next-intl";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";
import { Parallax } from "@/components/ui/Parallax";
import { LabCard } from "@/components/lab/LabCard";

/** GRYOX LAB — live experiments, running in the visitor's browser. */
export function Lab() {
  const t = useTranslations("lab");
  const areas = t.raw("areas") as string[];

  return (
    <section id="lab" className="relative gutter py-[18vh]" aria-labelledby="lab-title">
      <SceneTrigger preset="lab" />

      <div className="relative grid gap-10 lg:grid-cols-12">
        <SectionLabel index="05" className="lg:col-span-12">
          {t("label")}
        </SectionLabel>
        <RevealText
          as="h2"
          id="lab-title"
          className="display-wide text-[clamp(2.8rem,8vw,8.5rem)] text-fg lg:col-span-7"
        >
          {t("title")}
        </RevealText>
        <div className="flex flex-col justify-end gap-8 lg:col-span-5">
          <p className="max-w-[40ch] text-lg leading-relaxed text-muted">{t("intro")}</p>
          <div>
            <p className="mb-3 hud text-faint">{t("areasLabel")}</p>
            <ul className="flex flex-wrap gap-x-1 gap-y-2 text-sm text-fg/80">
              {areas.map((area, i) => (
                <li key={area} className="flex items-center">
                  {i > 0 && <span aria-hidden="true" className="mr-1 h-3 w-px rotate-[20deg] bg-line-strong" />}
                  <span className="px-1.5">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mt-[10vh] grid gap-x-8 gap-y-16 md:grid-cols-2">
        <LabCard
          index="01"
          title={t("experiments.flow.title")}
          desc={t("experiments.flow.desc")}
          experiment={{ id: "flow" }}
        />
        <Parallax speed={10} className="md:mt-24">
          <LabCard
            index="02"
            title={t("experiments.interface.title")}
            desc={t("experiments.interface.desc")}
            experiment={{ id: "interface", action: t("experiments.interface.action") }}
          />
        </Parallax>
        <LabCard
          index="03"
          title={t("experiments.signal.title")}
          desc={t("experiments.signal.desc")}
          experiment={{ id: "signal", label: t("experiments.signal.input"), initial: "GRYOX" }}
        />
        <Parallax speed={10} className="md:mt-24">
          <LabCard
            index="04"
            title={t("experiments.pipeline.title")}
            desc={t("experiments.pipeline.desc")}
            experiment={{
              id: "pipeline",
              action: t("experiments.pipeline.action"),
              steps: t.raw("experiments.pipeline.steps") as string[],
            }}
          />
        </Parallax>
      </div>
    </section>
  );
}
