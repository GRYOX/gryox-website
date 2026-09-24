"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { scrollToTarget } from "@/lib/scroll/lenis";
import { TransitionLink } from "./TransitionLink";

interface Props {
  hash: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  cursor?: string;
}

/** Section link: smooth-scrolls on the home page, transitions to home#section elsewhere. */
export function SmartAnchor({ hash, children, className, onNavigate, cursor }: Props) {
  const pathname = usePathname();

  if (pathname === "/") {
    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onNavigate?.();
      scrollToTarget(`#${hash}`);
    };
    return (
      <a href={`#${hash}`} onClick={onClick} className={className} data-cursor={cursor}>
        {children}
      </a>
    );
  }

  return (
    <TransitionLink
      href={{ pathname: "/", hash }}
      className={className}
      onClick={() => onNavigate?.()}
      data-cursor={cursor}
    >
      {children}
    </TransitionLink>
  );
}
