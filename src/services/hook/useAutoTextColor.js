import { useEffect, useState, useRef } from "react";

/** Utilitaires couleur */
function toHex(v) { return v.toString(16).padStart(2, "0"); }

function parseColorToRGB(str, el) {
  if (!str) return null;

  // Résoudre var(--x) si présent
  if (str.startsWith("var(") && el) {
    const varName = str.match(/var\((--[^),\s]+)\)/)?.[1];
    if (varName) {
      const value = getComputedStyle(el).getPropertyValue(varName).trim();
      return parseColorToRGB(value, el);
    }
  }

  // hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (str.startsWith("#")) {
    const h = str.replace("#", "");
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }

  // rgb/rgba
  const rgb = str.match(/rgba?\(([^)]+)\)/i)?.[1]?.split(",").map(s => s.trim());
  if (rgb && (rgb.length === 3 || rgb.length === 4)) {
    const [r, g, b, a = "1"] = rgb;
    return {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      a: Number(a)
    };
  }

  // mots-clés
  if (str === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (str === "black") return { r: 0, g: 0, b: 0, a: 1 };
  if (str === "white") return { r: 255, g: 255, b: 255, a: 1 };

  return null;
}

/** Remonte le DOM pour trouver un fond effectif non entièrement transparent */
function getEffectiveBackground(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const cs = getComputedStyle(node);
    const bg = cs.backgroundColor?.trim();
    const parsed = parseColorToRGB(bg, node);
    if (parsed && parsed.a > 0) return parsed;
    node = node.parentElement;
  }
  // fallback : fond de la page
  const rootBg = getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
  return parseColorToRGB(rootBg, document.body) || { r: 255, g: 255, b: 255, a: 1 };
}

/** Decide black or white via YIQ (rapide & fiable) */
function bestTextColor({ r, g, b }) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

/**
 * Hook : applique automatiquement la couleur de texte (noir/blanc)
 * selon le fond réel de l'élément.
 */
export function useAutoTextColor(depKeys = []) {
  const ref = useRef(null);
  const [color, setColor] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const update = () => {
      const bg = getEffectiveBackground(ref.current);
      setColor(bestTextColor(bg));
    };

    update();

    // Reagir aux changements de taille/style/contenu
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);

    const mo = new MutationObserver(update);
    mo.observe(ref.current, { attributes: true, childList: true, subtree: true, attributeFilter: ["style", "class"] });

    // Recompute on window/theme changes
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depKeys); // tu peux passer ici [theme] ou autre

  return { ref, color };
}
