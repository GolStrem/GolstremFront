import { useEffect, useRef } from "react";

export default function useHorizontalScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Vérifie la largeur de l'écran
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const onWheel = (e) => {
      if (e.ctrlKey) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        container.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
