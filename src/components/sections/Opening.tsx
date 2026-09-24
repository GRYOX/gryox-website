"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText } from "@/lib/animation/gsap";
import { frame } from "@/lib/scroll/frame";
import { getLenis } from "@/lib/scroll/lenis";
import { lockPresets } from "@/lib/three/presets";
import { supportsWebGL2 } from "@/lib/device/tier";
import { completeIntro, INTRO_CLASS } from "@/lib/intro";
import { site } from "@/data/site";

function subscribe(cb: () => void) {
  window.addEventListener("gryox:intro-complete", cb);
  return () => window.removeEventListener("gryox:intro-complete", cb);
}
const isOpening = () => document.documentElement.classList.contains(INTRO_CLASS);

/**
 * Cinematic opening (first visit per session, motion allowed):
 * darkness → dust → blueprint lines connect → matter converges into the GRYOX symbol →
 * the symbol materialises with depth and light → official wordmark → tagline.
 * ~3.4s, skippable with any input. Doubles as the preloader — never a spinner.
 */
export function Opening() {
  const playing = useSyncExternalStore(subscribe, isOpening, () => false);
  if (!playing) return null;
  return <OpeningSequence />;
}

function OpeningSequence() {
  const t = useTranslations();
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  // Deliberately NOT useGSAP: the matter/preset tweens must outlive this overlay.
  // A gsap.context would revert them (and anything created in its callbacks) on unmount.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const m = frame.matter;
    const portrait = window.innerWidth < window.innerHeight;
    Object.assign(m, {
      from: 1,
      to: 1,
      mix: 1,
      dissolve: 1,
      opacity: 0,
      logo: 0,
      lines: 0,
      energy: 0,
      dim: 0,
      x: 0,
      y: portrait ? 0.16 : 0.1,
      scale: portrait ? 0.95 : 0.78,
    });
    getLenis()?.stop();

    const split = SplitText.create(q(".js-opening-tagline"), {
      type: "words",
      mask: "words",
      aria: "auto",
    });
    const progress = { value: 0 };

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.inOut" },
    });
    tl.to(
      progress,
      {
        value: 100,
        duration: 3.1,
        ease: "power1.inOut",
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
        },
      },
      0,
    )
      .to(m, { opacity: 0.85, duration: 1, ease: "power2.out" }, 0)
      .to(m, { lines: 1, duration: 1 }, 0.25)
      .to(m, { dissolve: 0, duration: 1.7, ease: "power3.inOut" }, 0.3)
      .to(m, { logo: 1, duration: 1.1 }, 1.45)
      .to(m, { lines: 0, duration: 0.7 }, 1.9)
      .fromTo(
        q(".js-opening-wordmark"),
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "expo.out" },
        1.75,
      )
      .from(split.words, { yPercent: 110, duration: 0.8, stagger: 0.035, ease: "expo.out" }, 2.1)
      .to(q(".js-opening-hud"), { opacity: 0, duration: 0.4 }, 2.9)
      .to(q(".js-opening-brand"), { yPercent: -18, opacity: 0, duration: 0.6, ease: "power3.in" }, 3.0)
      .add(() => {
        lockPresets(false);
        getLenis()?.start();
        completeIntro();
      }, 3.35);

    // Wait for the first WebGL frame (or give up quickly) before playing.
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      tl.play();
    };
    const fallback = window.setTimeout(start, supportsWebGL2() ? 1400 : 0);
    window.addEventListener("gryox:matter-ready", start, { once: true });

    const skip = () => {
      start();
      tl.timeScale(5);
    };
    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener("wheel", skip, { passive: true, signal });
    window.addEventListener("touchstart", skip, { passive: true, signal });
    window.addEventListener("keydown", skip, { signal });

    return () => {
      controller.abort();
      window.clearTimeout(fallback);
      window.removeEventListener("gryox:matter-ready", start);
      tl.kill();
      split.revert();
      getLenis()?.start();
    };
  }, []);

  return (
    <div ref={root} className="fixed inset-0 z-[70] flex flex-col" role="presentation">
      <div className="js-opening-hud flex items-center justify-between gutter pt-6 text-faint">
        <span className="hud">GRYOX — Digital Matter</span>
        <span className="hud tabular-nums">
          <span ref={counter}>000</span>
        </span>
      </div>

      <div className="js-opening-brand mt-auto flex flex-col items-center gap-5 pb-[16svh] sm:pb-[14svh]">
        <h2 className="sr-only">GRYOX</h2>
        <div className="js-opening-wordmark" style={{ clipPath: "inset(0 100% 0 0)" }}>
          <Image
            src={site.logo.wordmark.dark}
            alt=""
            width={640}
            height={99}
            priority
            className="h-auto w-[min(62vw,340px)] light:hidden"
          />
          <Image
            src={site.logo.wordmark.light}
            alt=""
            width={640}
            height={99}
            priority
            className="hidden h-auto w-[min(62vw,340px)] light:block"
          />
        </div>
        <p className="js-opening-tagline px-6 text-center text-sm tracking-wide text-muted sm:text-base">
          {t("opening.tagline")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new KeyboardEvent("keydown"))}
        className="js-opening-hud absolute right-4 bottom-5 px-3 py-3 hud text-faint transition-colors hover:text-fg sm:right-8"
        aria-label={t("a11y.skipIntro")}
      >
        {t("opening.skip")} →
      </button>
    </div>
  );
}
