/**
 * Global site configuration.
 * NEXT_PUBLIC_SITE_URL must be set to the production domain (see .env.example).
 */
export const site = {
  name: "GRYOX",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gryox.com").replace(/\/$/, ""),
  founders: ["Rafael", "Gabriel"],
  brand: {
    green: "#00CC69",
    purple: "#7922ED",
    black: "#050506",
    white: "#F3F3F0",
  },
  logo: {
    mark: "/brand/generated/mark.png",
    wordmark: {
      dark: "/brand/generated/wordmark-on-dark.png",
      light: "/brand/generated/wordmark-on-light.png",
    },
    lockup: {
      dark: "/brand/generated/lockup-on-dark.png",
      light: "/brand/generated/lockup-on-light.png",
    },
  },
} as const;
