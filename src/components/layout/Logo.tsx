import Image from "next/image";
import { site } from "@/data/site";

/**
 * Official GRYOX logo (raster source, converted to transparent PNG by scripts/prepare-brand.mjs).
 * Swap the paths in data/site.ts for SVGs when official vectors exist.
 * Both theme variants render; CSS shows the right one, so there is no hydration flash.
 */
export function Logo({
  className = "",
  priority = false,
  withMark = true,
}: {
  className?: string;
  priority?: boolean;
  withMark?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {withMark && (
        <Image
          src={site.logo.mark}
          alt=""
          width={640}
          height={367}
          priority={priority}
          className="h-[18px] w-auto sm:h-5"
        />
      )}
      <Image
        src={site.logo.wordmark.dark}
        alt=""
        width={640}
        height={99}
        priority={priority}
        className="h-[11px] w-auto sm:h-3 light:hidden"
      />
      <Image
        src={site.logo.wordmark.light}
        alt=""
        width={640}
        height={99}
        priority={priority}
        className="hidden h-[11px] w-auto sm:h-3 light:block"
      />
    </span>
  );
}
