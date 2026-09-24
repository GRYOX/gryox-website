import type { Project } from "@/types/content";

/**
 * Selected work.
 *
 * Only real, verified GRYOX information belongs here. Entries marked `placeholder: true`
 * are clearly labelled on the site and must be replaced (or removed) before launch.
 * Never add invented clients, metrics, results or testimonials.
 */
export const projects: Project[] = [
  {
    slug: "gryox-digital-matter",
    placeholder: false,
    title: "GRYOX — Digital Matter",
    year: "2026",
    category: { pt: "Website · WebGL", en: "Website · WebGL" },
    summary: {
      pt: "O site que você está navegando: uma experiência em tempo real onde partículas formam o símbolo da GRYOX e se transformam em interface, ambiente, dispositivo, rede e sistemas.",
      en: "The site you are browsing: a real-time experience where particles form the GRYOX symbol and transform into interface, environment, device, network and systems.",
    },
    stack: ["Next.js", "React", "TypeScript", "Three.js", "React Three Fiber", "GSAP", "Lenis", "next-intl"],
    body: {
      pt: [
        "Um único canvas WebGL persiste por toda a navegação. Cada seção pede à matéria digital um novo estado em vez de carregar uma cena nova.",
        "As partículas morfam entre alvos armazenados em uma textura na GPU, com ruído, repulsão do cursor e reação à velocidade do scroll calculados no shader.",
        "Todo o conteúdo é HTML real, renderizado no servidor em português e inglês. A camada 3D é decorativa e se adapta ao dispositivo, com versões reduzidas para aparelhos mais modestos e para quem prefere menos movimento.",
      ],
      en: [
        "A single WebGL canvas persists across the whole visit. Each section asks the digital matter for a new state instead of loading a new scene.",
        "Particles morph between targets stored in a GPU texture, with noise, cursor repulsion and scroll-velocity response computed in the shader.",
        "All content is real, server-rendered HTML in Portuguese and English. The 3D layer is decorative and adapts to the device, with reduced versions for modest hardware and for people who prefer less motion.",
      ],
    },
    preview: {
      kind: "image",
      src: "/work/gryox-digital-matter.webp",
      alt: {
        pt: "Captura da abertura do site da GRYOX: o símbolo GR em 3D ao lado do título Transformamos ideias em tecnologia.",
        en: "Screenshot of the GRYOX site hero: the 3D GR symbol beside the headline We turn ideas into technology.",
      },
    },
  },
  {
    slug: "projeto-02",
    placeholder: true,
    title: "Projeto 02",
    year: "—",
    category: { pt: "Software", en: "Software" },
    summary: {
      pt: "Espaço reservado para um estudo de caso real. Edite src/data/projects.ts.",
      en: "Reserved for a real case study. Edit src/data/projects.ts.",
    },
    stack: [],
    body: {
      pt: ["Espaço reservado para um estudo de caso real da GRYOX."],
      en: ["Reserved for a real GRYOX case study."],
    },
    preview: { kind: "matter", target: "interface" },
  },
  {
    slug: "projeto-03",
    placeholder: true,
    title: "Projeto 03",
    year: "—",
    category: { pt: "App", en: "App" },
    summary: {
      pt: "Espaço reservado para um estudo de caso real. Edite src/data/projects.ts.",
      en: "Reserved for a real case study. Edit src/data/projects.ts.",
    },
    stack: [],
    body: {
      pt: ["Espaço reservado para um estudo de caso real da GRYOX."],
      en: ["Reserved for a real GRYOX case study."],
    },
    preview: { kind: "matter", target: "device" },
  },
  {
    slug: "projeto-04",
    placeholder: true,
    title: "Projeto 04",
    year: "—",
    category: { pt: "IA · Automação", en: "AI · Automation" },
    summary: {
      pt: "Espaço reservado para um estudo de caso real. Edite src/data/projects.ts.",
      en: "Reserved for a real case study. Edit src/data/projects.ts.",
    },
    stack: [],
    body: {
      pt: ["Espaço reservado para um estudo de caso real da GRYOX."],
      en: ["Reserved for a real GRYOX case study."],
    },
    preview: { kind: "matter", target: "network" },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
