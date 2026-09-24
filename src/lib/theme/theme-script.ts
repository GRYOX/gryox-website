export const THEME_STORAGE_KEY = "gryox-theme";

/**
 * Runs synchronously in <head> before first paint (see Next docs:
 * "Preventing flash before hydration"). Dark is the default GRYOX experience;
 * light only applies when the visitor chose it.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}}catch(e){}})()`;
