import React from "react";
import Card from "./Card";

const Board = ({ board, handleDrop, setDraggingCardInfo, openModal }) => {
  const handleDropCard = (e, targetIndex) => {
    e.preventDefault();
    const draggingCard = JSON.parse(e.dataTransfer.getData("draggingCard") || "{}");
    if (!draggingCard || !draggingCard.id) return;

    handleDrop(draggingCard.sourceBoardId, board.id, draggingCard.id, targetIndex);
  };

  const handleBoardDrop = (e) => {
    e.preventDefault();
    const draggingCard = JSON.parse(e.dataTransfer.getData("draggingCard") || "{}");
    if (!draggingCard || !draggingCard.id) return;

    handleDrop(draggingCard.sourceBoardId, board.id, draggingCard.id, null); // Drop à la fin
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h2>{board.title}</h2>
        <button
          className="add-card-btn"
          onClick={() => openModal(board.id)} // Ouvre la modal pour créer une nouvelle carte
        >
          + Add Card
        </button>
      </div>
      <div
        className="board"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleBoardDrop} // Gère les drop dans le tableau
      >
        <div className="cards">
          {board.cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              boardId={board.id}
              handleDrop={handleDropCard}
              setDraggingCardInfo={setDraggingCardInfo}
              openModal={openModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
