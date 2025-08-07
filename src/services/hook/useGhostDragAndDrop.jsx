import { useEffect } from "react";

export default function useGhostDragAndDrop({ dragSelector, onMouseUpCallback }) {
  useEffect(() => {
    let draggedElement = null;
    let ghostElement = null;

    const moveGhost = (x, y) => {
      const offsetX = 20;
      const offsetY = 20;
      if (ghostElement) {
        ghostElement.style.left = `${x + offsetX}px`;
        ghostElement.style.top = `${y + offsetY}px`;
      }
    };

    const onMouseMove = (e) => {
      moveGhost(e.pageX, e.pageY);
    };

    const onMouseUp = (e) => {
      if (typeof onMouseUpCallback === "function") {
        onMouseUpCallback({ draggedElement, event: e });
      }

      if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
      }

      draggedElement = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      draggedElement = e.currentTarget;

      ghostElement = draggedElement.cloneNode(true);
      ghostElement.style.position = "absolute";
      ghostElement.style.pointerEvents = "none";
      ghostElement.style.opacity = "0.4";
      ghostElement.style.zIndex = "9999";
      ghostElement.style.width = `${draggedElement.offsetWidth}px`;
      ghostElement.style.height = `${draggedElement.offsetHeight}px`;

      document.body.appendChild(ghostElement);
      moveGhost(e.pageX, e.pageY);

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const elements = document.querySelectorAll(dragSelector);
    elements.forEach((el) => el.addEventListener("mousedown", onMouseDown));

    return () => {
      elements.forEach((el) => el.removeEventListener("mousedown", onMouseDown));
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (ghostElement) ghostElement.remove();
    };
  }, [dragSelector, onMouseUpCallback]);
}
