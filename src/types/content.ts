import type { Locale } from "@/i18n/routing";

/** A string provided in every supported locale. */
export type Localized<T = string> = Record<Locale, T>;

/** Shapes the Digital Matter system can form. Order matches the target texture layout. */
export const MATTER_TARGETS = ["chaos", "mark", "interface", "environment", "device", "network", "systems"] as const;
export type MatterTarget = (typeof MATTER_TARGETS)[number];

export type CapabilityId = "software" | "web" | "apps" | "ai" | "automation";

export interface Capability {
  id: CapabilityId;
  index: string;
  target: MatterTarget;
}

export interface Project {
  slug: string;
  /** True until real, verified case-study content replaces the entry. */
  placeholder: boolean;
  title: string;
  year: string;
  category: Localized;
  summary: Localized;
  stack: string[];
  /** Paragraphs for the case-study page. */
  body: Localized<string[]>;
  /** Visual preview: an image in /public, or a generated matter frame. */
  preview: { kind: "image"; src: string; alt: Localized } | { kind: "matter"; target: MatterTarget };
}

export interface Founder {
  id: "rafael" | "gabriel";
  name: string;
  initial: string;
  /** Replace with a real photo path in /public when available. */
  photo?: string;
  /** Replace with real bios written by the founders. */
  bio?: Localized;
  links?: { label: string; href: string }[];
}

export type ContactType = "website" | "software" | "app" | "ai" | "automation" | "unsure";
