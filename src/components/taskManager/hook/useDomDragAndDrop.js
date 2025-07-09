import { useEffect } from "react";

export default function useGhostDragAndDrop(callback) {
  useEffect(() => {
    let firstElement = null;
    let ghostElement = null;

    const getChildIndex = (xElement) => {
      return Array.from(xElement.parentElement.children).indexOf(xElement);
    };

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
      const secondElement = e.target.closest(".tm-cards > div");
      const data = {
          idCard: firstElement.getAttribute("data-id"),
          oldPos: getChildIndex(firstElement),
          oldTableau: firstElement.parentElement.getAttribute("data-id")
      }

      if (secondElement === null && e.target.closest(".tm-board-container") !== null) {
        data.newPos = 0
        data.newTableau = e.target.closest(".tm-board-container").querySelector(".tm-cards").getAttribute("data-id")
      }

      if (firstElement && secondElement && firstElement !== secondElement) {
        data.newPos =  getChildIndex(secondElement)
        data.newTableau = secondElement.parentElement.getAttribute("data-id")
      }

        if (data.newTableau !== undefined && typeof callback === "function") {
          callback(data);
        }

      if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
      }

      firstElement = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e) => {
      firstElement = e.currentTarget;
      ghostElement = firstElement.cloneNode(true);
      ghostElement.style.position = "absolute";
      ghostElement.style.pointerEvents = "none";
      ghostElement.style.opacity = "0.7";
      ghostElement.style.zIndex = "9999";
      ghostElement.style.width = `${firstElement.offsetWidth / 2}px`;
      ghostElement.style.border = "2px dashed #ccc";

      document.body.appendChild(ghostElement);
      moveGhost(e.pageX, e.pageY);

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const elements = document.querySelectorAll(".tm-cards > div");
    elements.forEach((div) => {
      div.addEventListener("mousedown", onMouseDown);
    });

    return () => {
      elements.forEach((div) => {
        div.removeEventListener("mousedown", onMouseDown);
      });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (ghostElement) ghostElement.remove();


    };
  }, [callback]);
}
