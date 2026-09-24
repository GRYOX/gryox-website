/** Opening sequence state, shared by the opening and the sections that enter after it. */
export const INTRO_SESSION_KEY = "gryox-intro-seen";
export const INTRO_CLASS = "is-opening";
const EVENT = "gryox:intro-complete";

/**
 * Pre-paint: hide page content only when the opening will actually play
 * (first visit this session, motion allowed). A CSS failsafe reveals content anyway.
 */
export const introScript = `(function(){try{if(!sessionStorage.getItem("${INTRO_SESSION_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("${INTRO_CLASS}")}}catch(e){}})()`;

let done = false;

export const isIntroDone = () =>
  done || (typeof document !== "undefined" && !document.documentElement.classList.contains(INTRO_CLASS));

export function completeIntro() {
  done = true;
  document.documentElement.classList.remove(INTRO_CLASS);
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Run `cb` once the intro has finished (immediately if it already has, or never played). */
export function onIntroComplete(cb: () => void) {
  if (isIntroDone()) {
    cb();
    return () => {};
  }
  window.addEventListener(EVENT, cb, { once: true });
  return () => window.removeEventListener(EVENT, cb);
}
