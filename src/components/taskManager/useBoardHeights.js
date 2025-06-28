import { useEffect, useRef, useState } from "react";

const useBoardHeights = (boards) => {
  const boardRefs = useRef({});
  const [boardHeights, setBoardHeights] = useState({});

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const updated = {};
      entries.forEach((entry) => {
        const boardId = entry.target.dataset.boardId;
        if (boardId) {
          updated[boardId] = entry.contentRect.height;
        }
      });
      if (Object.keys(updated).length > 0) {
        setBoardHeights((prev) => ({ ...prev, ...updated }));
      }
    });

    boards.forEach((board) => {
      const el = boardRefs.current[board.id];
      if (el) {
        el.dataset.boardId = board.id;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [boards]);

  return { boardRefs, boardHeights };
};

export default useBoardHeights;
