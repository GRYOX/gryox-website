"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "./useInView";

// Experiments are code-split and only mount when their card approaches the viewport.
const FlowField = dynamic(() => import("./FlowField"), { ssr: false });
const GenerativeInterface = dynamic(() => import("./GenerativeInterface"), { ssr: false });
const SignalNetwork = dynamic(() => import("./SignalNetwork"), { ssr: false });
const Pipeline = dynamic(() => import("./Pipeline"), { ssr: false });

export type Experiment =
  | { id: "flow" }
  | { id: "interface"; action: string }
  | { id: "signal"; label: string; initial: string }
  | { id: "pipeline"; action: string; steps: string[] };

interface Props {
  index: string;
  title: string;
  desc: string;
  experiment: Experiment;
  className?: string;
}

export function LabCard({ index, title, desc, experiment, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "300px" });

  return (
    <article className={`group flex flex-col ${className}`} aria-labelledby={`lab-${experiment.id}`}>
      <div ref={ref} className="chamfer-frame relative aspect-[4/3] overflow-hidden p-px [--c:16px]">
        {near && <ExperimentView experiment={experiment} />}
        <span className="pointer-events-none absolute top-3 left-3 hud text-[0.6rem] text-faint">LAB-{index}</span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 id={`lab-${experiment.id}`} className="display-tight text-2xl text-fg sm:text-3xl">
          {title}
        </h3>
      </div>
      <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-muted">{desc}</p>
    </article>
  );
}

function ExperimentView({ experiment }: { experiment: Experiment }) {
  switch (experiment.id) {
    case "flow":
      return <FlowField />;
    case "interface":
      return <GenerativeInterface action={experiment.action} />;
    case "signal":
      return <SignalNetwork label={experiment.label} initial={experiment.initial} />;
    case "pipeline":
      return <Pipeline action={experiment.action} steps={experiment.steps} />;
  }
}
