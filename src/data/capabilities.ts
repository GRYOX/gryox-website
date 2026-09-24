import type { Capability } from "@/types/content";

/** The capability chapters, in narrative order. Copy lives in messages → capabilities.items. */
export const capabilities: Capability[] = [
  { id: "software", index: "01", target: "interface" },
  { id: "web", index: "02", target: "environment" },
  { id: "apps", index: "03", target: "device" },
  { id: "ai", index: "04", target: "network" },
  { id: "automation", index: "05", target: "systems" },
];
