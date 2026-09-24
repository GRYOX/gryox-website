import { site } from "@/data/site";

/** Organization structured data — only facts stated by GRYOX (name, founders, services). */
export function organizationJsonLd(description: string, services: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}${site.logo.mark}`,
    description,
    founder: site.founders.map((name) => ({ "@type": "Person", name })),
    knowsAbout: services,
  };
}

/** Serialise JSON-LD safely for inline <script> (escapes `<`). */
export const jsonLdScript = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
