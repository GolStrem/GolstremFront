import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import DnDCard from "./DnDCard";

const DnDBoard = ({
  board,
  index,
  handleDrop,
  openModal,
  openViewerModal,
  handleUpdateBoard,
  handleDeleteBoard,
  onBoardDragStart,
  onBoardDrop,
}) => {
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

    totalHeight += 10;

    const screenHeight = window.innerHeight;
    const maxHeight = screenHeight * 0.7;

    setCalculatedHeight(Math.min(Math.max(80, totalHeight), maxHeight));
  }, [board.cards]);

  const editBoardTitle = () => {
    const newTitle = prompt("Nouveau nom du tableau :", board.title);
    if (newTitle !== null) {
      handleUpdateBoard(board.id, newTitle);
    }
  };

  const deleteBoard = () => {
    const confirmDelete = window.confirm(`Supprimer le tableau "${board.title}" ?`);
    if (confirmDelete) {
      handleDeleteBoard(board.id);
    }
  };

  return (
    <div
      className="tm-board-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onBoardDrop(e, index)}
    >
      <div
        className="tm-board-header"
        draggable
        onDragStart={(e) => onBoardDragStart(e, index)}
      >
        <h2>{board.title}</h2>
        <div className="tm-board-header-buttons">
          <button className="tm-add-card-btn" onClick={() => openModal(board.id)}>
            + Add Card
          </button>
          <button onClick={editBoardTitle} className="tm-edit">✏️</button>
          <button onClick={deleteBoard} className="tm-delete">🗑️</button>
        </div>
      </div>

      <div
        className="tm-board"
        ref={setNodeRef}
        style={{
          height: `${calculatedHeight}px`,
          transition: "height 0.3s ease",
          overflowY: "auto",
        }}
      >
        <div className="tm-cards" ref={cardsContainerRef}>
          {board.cards.length === 0 && (
            <div className="tm-empty-board-placeholder">Déposez une carte ici</div>
          )}
          {board.cards.map((card) => (
            <DnDCard
              key={card.id}
              card={card}
              boardId={board.id}
              openViewerModal={openViewerModal} // ✅ permet d'ouvrir TaskViewerModal
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DnDBoard;
