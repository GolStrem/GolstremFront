import { useEffect } from "react";

/**
 * Active un ghost-drag UNIQUEMENT après un appui prolongé (long-press)
 * ou un déplacement réel (minDistance).
 *
 * @param {object} opts
 * @param {string} opts.dragSelector - éléments draggables
 * @param {(ctx: { draggedElement: HTMLElement|null, event: MouseEvent }) => void} opts.onMouseUpCallback
 * @param {number} [opts.delayMs=200] - latence avant d'activer le drag
 * @param {number} [opts.minDistance=6] - distance min avant d'activer (si l’utilisateur bouge)
 * @param {string} [opts.cancelSelector='[data-nodrag]'] - sous-éléments à ignorer (ex: bouton "…")
 */
export default function useGhostDragAndDrop({
  dragSelector,
  onMouseUpCallback,
  delayMs = 200,
  minDistance = 6,
  cancelSelector = "[data-nodrag]",
}) {
  useEffect(() => {
    let draggedElement = null;
    let ghostElement = null;
    let pressTimer = null;
    let started = false;

    let startX = 0;
    let startY = 0;

    const clearPressTimer = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    const moveGhost = (x, y) => {
      const offsetX = 20;
      const offsetY = 20;
      if (ghostElement) {
        ghostElement.style.left = `${x + offsetX}px`;
        ghostElement.style.top = `${y + offsetY}px`;
      }
    };

    const startDrag = (e) => {
      if (started || !draggedElement) return;

      // Création du ghost
      ghostElement = draggedElement.cloneNode(true);
      ghostElement.style.position = "absolute";
      ghostElement.style.pointerEvents = "none";
      ghostElement.style.opacity = "0.4";
      ghostElement.style.zIndex = "9999";
      ghostElement.style.width = `${draggedElement.offsetWidth}px`;
      ghostElement.style.height = `${draggedElement.offsetHeight}px`;
      ghostElement.style.left = "-99999px"; // évite un flash avant premier move
      ghostElement.style.top = "-99999px";

      document.body.appendChild(ghostElement);
      moveGhost(e.pageX, e.pageY);

      started = true;
    };

    const onMouseMove = (e) => {
      // Si pas encore démarré: activer si on dépasse minDistance
      if (!started && draggedElement) {
        const dx = Math.abs(e.pageX - startX);
        const dy = Math.abs(e.pageY - startY);
        if (dx > minDistance || dy > minDistance) {
          startDrag(e);
        }
      }

      // Si déjà démarré: déplacer le ghost
      if (started) {
        moveGhost(e.pageX, e.pageY);
        // Empêche la sélection de texte quand on drag
        e.preventDefault();
      }
    };

    const onMouseUp = (e) => {
      clearPressTimer();

      // On ne déclenche le callback QUE si un drag a réellement commencé
      if (started && typeof onMouseUpCallback === "function") {
        onMouseUpCallback({ draggedElement, event: e });
      }

      if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
      }

      draggedElement = null;
      started = false;

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseUp);
    };

    const onMouseDown = (e) => {
      // bouton gauche uniquement
      if (e.button !== 0) return;

      // Ignore si clic dans une zone “non-drag”
      if (cancelSelector && e.target.closest(cancelSelector)) {
        return; // laisse le clic normal (ex: ouvre la modale “…”)
      }

      // On ne bloque pas le clic ici pour laisser les interactions normales
      // (on empêchera seulement quand le drag démarre)

      draggedElement = e.currentTarget;
      startX = e.pageX;
      startY = e.pageY;
      started = false;

      // Démarre un timer pour “long press” avant d'activer le drag
      clearPressTimer();
      pressTimer = setTimeout(() => {
        startDrag(e);
      }, delayMs);

      document.addEventListener("mousemove", onMouseMove, { passive: false });
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mouseleave", onMouseUp);
    };

    const elements = document.querySelectorAll(dragSelector);
    elements.forEach((el) => el.addEventListener("mousedown", onMouseDown));

    return () => {
      elements.forEach((el) => el.removeEventListener("mousedown", onMouseDown));
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseUp);
      clearPressTimer();
      if (ghostElement) ghostElement.remove();
    };
  }, [dragSelector, onMouseUpCallback, delayMs, minDistance, cancelSelector]);
}
