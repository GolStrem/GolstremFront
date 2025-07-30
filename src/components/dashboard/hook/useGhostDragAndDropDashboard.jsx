import { useCallback } from "react";

export default function useGhostDragAndDropDashboard(callback) {
  let dragged = null;
  let ghost = null;

  const moveGhost = (x, y) => {
    if (ghost) {
      ghost.style.left = `${x + 15}px`;
      ghost.style.top = `${y + 15}px`;
    }
  };

  const cleanup = () => {
    if (ghost) ghost.remove();
    ghost = null;
    dragged = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("contextmenu", onContextMenuFix);
  };

  const onMouseMove = (e) => moveGhost(e.pageX, e.pageY);

  const onMouseUp = (e) => {
    const dropTarget = e.target.closest(".dashboard-block");
    if (dragged && dropTarget && dragged !== dropTarget) {
      callback({
        draggedId: dragged.dataset.id,
        targetId: dropTarget.dataset.id,
      });
    }
    cleanup();
  };

  const onContextMenuFix = () => cleanup();

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // only left click
    dragged = e.currentTarget;

    ghost = dragged.cloneNode(true);
    ghost.classList.add("ghost-clone");
    ghost.style.position = "absolute";
    ghost.style.opacity = "0.7";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "1000";
    ghost.style.width = `${dragged.offsetWidth}px`;
    ghost.style.height = `${dragged.offsetHeight}px`;

    document.body.appendChild(ghost);
    moveGhost(e.pageX, e.pageY);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("contextmenu", onContextMenuFix);
  }, [callback]);

  return { onMouseDown };
}
