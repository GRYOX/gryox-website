import { Archivo, Geist, Geist_Mono } from "next/font/google";

/** Display: Archivo at expanded widths — echoes the wide, geometric GRYOX wordmark. */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fontVariables = `${archivo.variable} ${geist.variable} ${geistMono.variable}`;
