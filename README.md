# GRYOX — Digital Matter

The official GRYOX website. *Transformamos ideias em tecnologia — We turn ideas into technology.*

One persistent WebGL scene ("Digital Matter") runs behind real, server-rendered HTML. Particles form the GRYOX symbol, dissolve, and reform into an interface, an environment, a device, a network and connected systems as the story scrolls.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Three.js + React Three Fiber + Drei · GSAP (ScrollTrigger, SplitText) · Lenis · Motion · next-intl · zod

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` · `npm run format` | ESLint · TypeScript · Prettier |
| `npm run brand` | Regenerates brand assets from `public/brand/logo-*.jpeg` (see below) |

## Environment

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_SITE_URL` — production domain (canonical URLs, sitemap, Open Graph).
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — contact form delivery via Resend. Without them the form validates, then tells the visitor that delivery isn't configured. It never pretends to send.

## Architecture

```
src/
  app/[locale]/          layout (html, providers, persistent layers), home, case study, OG image, 404
  app/                   sitemap, robots, manifest, icons
  proxy.ts               next-intl locale negotiation (Next 16 "proxy", formerly middleware)
  i18n/ · messages/      routing (pt default, localized pathnames) · all copy, centralized
  data/                  projects, founders, capabilities, site config
  components/three/      WebGLStage (lazy), Scene, DigitalMatter, InteractiveLogo, ParticleField,
                         ConnectionLines, CameraRig, SceneLighting, SceneTrigger
  components/sections/   Opening, Hero, Manifesto, Capabilities (horizontal story), SelectedWork, Lab,
                         Founders, Contact
  components/layout/     Navigation, MobileMenu, LocaleSwitch, ThemeSwitch, PageTransition, Footer…
  components/lab/        Live experiments (code-split, mounted on approach)
  lib/scroll/            ScrollProvider (the single loop), frame store, Lenis helpers
  lib/three/             morph targets, traced mark geometry, shaders, scene presets
  lib/animation/         GSAP registration + motion tokens
  lib/theme/ · lib/seo/ · lib/contact/ · lib/device/
```

Rules that keep it smooth:

- **One animation loop.** `gsap.ticker` drives Lenis, which drives ScrollTrigger, and the same ticker drives R3F (`frameloop="never"` + `advance`). Nothing else calls `requestAnimationFrame` for scroll or 3D.
- **The frame store** (`lib/scroll/frame.ts`) is a plain mutable object. GSAP writes to it and `useFrame` reads from it, with no React re-renders at 60fps.
- **Channel ownership.** Scene presets (`lib/three/presets.ts`) tween the matter's state. A pinned section may own a channel while active (the Manifesto owns `dissolve`, the horizontal story owns the morph). Preset tweens are created outside GSAP contexts so section unmounts never revert them.
- **Animation ownership.** GSAP handles scroll, timelines and pins. Motion handles only UI micro-interactions (menu, cursor label, chips, previews). CSS handles hover colours.
- **Device tiers** (`lib/device/tier.ts`) set particle count, DPR, logo mesh and lines. `PerformanceMonitor` lowers DPR under load. Reduced motion means no Lenis, no pins or scrub, no opening, no cursor, and minimal matter.

## Brand assets (important)

The official logos exist only as raster JPEGs in `public/brand/`. `scripts/prepare-brand.mjs` derives from them, without redrawing anything:

- transparent PNGs of the mark, wordmark and lockups (`public/brand/generated/`) and the app icons;
- `mark-shape.json`, an automatic contour trace of the symbol used only for the 3D extrusion and particle sampling. It's an approximation of the raster, **not an official vector**.

When an official SVG exists, point `data/site.ts` at it for the 2D logos, and return the SVG's shapes from `src/lib/three/mark-shape.ts` (three's `SVGLoader`). Nothing else changes.

## Content to replace before launch

Only real GRYOX information belongs on the site. These are clearly marked placeholders:

- `src/data/projects.ts`: projects 02–04 (`placeholder: true`, shown with a badge and `noindex`). The first project is this site itself; its screenshot is `public/work/gryox-digital-matter.webp`.
- `src/data/founders.ts`: photos, bios and links for Rafael and Gabriel.
- `.env.local`: production domain and Resend credentials.
