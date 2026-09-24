"use client";

/**
 * Pre-paint inline script (Next docs: "Preventing flash before hydration").
 * Executable when server-rendered; inert `text/plain` when React renders it on the client
 * (e.g. the root layout re-rendering on a locale change), which avoids React's
 * "script tag while rendering" error. suppressHydrationWarning covers the type mismatch.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
