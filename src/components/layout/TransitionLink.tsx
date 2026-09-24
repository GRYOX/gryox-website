"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { cover } from "@/lib/transition";

type Props = ComponentProps<typeof Link>;

/** Locale-aware link that plays the diagonal wipe before client navigation. */
export function TransitionLink({ onClick, href, ...rest }: Props) {
  const router = useRouter();

  const handle = async (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    await cover();
    router.push(href as Parameters<typeof router.push>[0]);
  };

  return <Link href={href} onClick={handle} {...rest} />;
}
