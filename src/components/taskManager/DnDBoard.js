import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import DnDCard from "./DnDCard"; // adapte le chemin si nécessaire


const DnDBoard = ({ board, openCreateCard, openViewerModal }) => {
  const cardsContainerRef = useRef(null);
  const [calculatedHeight, setCalculatedHeight] = useState(80);

  const { setNodeRef } = useDroppable({
    id: board.id,
  });

  useEffect(() => {
    if (!cardsContainerRef.current) return;

    const cards = cardsContainerRef.current.children;
    let totalHeight = 0;

    for (let card of cards) {
      totalHeight += card.offsetHeight + 10;
    }

    totalHeight += 10; // padding bas

    const screenHeight = window.innerHeight;
    const maxHeight = screenHeight * 0.7;

    setCalculatedHeight(Math.min(Math.max(80, totalHeight), maxHeight));
  }, [board.cards]);

  return (
    <div
      className="tm-board"
      ref={setNodeRef}
      style={{
        height: `${calculatedHeight}px`,
        transition: "height 0.3s ease",
        overflowY: "auto",
        backgroundColor: "#fefefe",
        borderRadius: "8px",
        padding: "10px",
        boxSizing: "border-box",
        boxShadow: "0 0 5px rgba(0,0,0,0.1)",
      }}
    >
      <div className="tm-cards" ref={cardsContainerRef}>
        {board.cards.length === 0 && (
          <div className="tm-empty">Déposez une carte ici</div>
        )}
        {board.cards.map((card) => (
          <DnDCard
            key={card.id}
            card={card}
            boardId={board.id}
            openViewerModal={openViewerModal}
          />
        ))}
      </div>
    </div>
  );
};

export default DnDBoard;
