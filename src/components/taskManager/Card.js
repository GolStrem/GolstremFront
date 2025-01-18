import React from "react";

const Card = ({ card, index, boardId, handleDrop, setDraggingCardInfo, openModal }) => {
  const handleCardDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDrop(e, index);
  };

  return (
    <div
      className="card"
      draggable
      style={{ backgroundColor: card.color || "#ffffff" }}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "draggingCard",
          JSON.stringify({ ...card, sourceBoardId: boardId })
        );
        setDraggingCardInfo({
          card,
          sourceBoardId: boardId,
          sourceIndex: index,
        });
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCardDrop}
    >
      <p>{card.text}</p>
      <div className="card-actions">
        <button className="edit-btn" onClick={() => openModal(boardId, card)}>
          ✏️
        </button>
      </div>
    </div>
  );
};

export default Card;
