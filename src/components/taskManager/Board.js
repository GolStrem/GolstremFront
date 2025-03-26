import React, { useRef, useEffect, useState } from "react";
import Card from "./Card";

const Board = ({
  board,
  handleDrop,
  setDraggingCardInfo,
  openModal,
  handleUpdateBoard,
  handleDeleteBoard,
}) => {
  const cardsContainerRef = useRef(null);
  const [calculatedHeight, setCalculatedHeight] = useState(80);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.children;
      let totalHeight = 0;

      for (let card of cards) {
        totalHeight += card.offsetHeight + 10;
      }
      totalHeight += 10;

      const screenHeight = window.innerHeight;
      const maxBoardHeight = screenHeight * 0.7;
      setCalculatedHeight(Math.min(Math.max(80, totalHeight), maxBoardHeight));
    }
  }, [board.cards]);

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

    handleDrop(draggingCard.sourceBoardId, board.id, draggingCard.id, null);
  };

  const editBoardTitle = () => {
    const newTitle = prompt("Nouveau nom du tableau :", board.title);
    if (newTitle !== null) {
      handleUpdateBoard(board.id, newTitle);
    }
  };

  const deleteBoard = () => {
    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer le tableau "${board.title}" ?`
    );
    if (confirmDelete) {
      handleDeleteBoard(board.id);
    }
  };

  return (
    <div className="tm-board-container">
      <div className="tm-board-header">
        <h2>{board.title}</h2>
        <div className="tm-board-header-buttons">
          <button className="tm-add-card-btn" onClick={() => openModal(board.id)}>
            + Add Card
          </button>
          <button onClick={editBoardTitle} className="tm-edit">
            ✏️
          </button>
          <button onClick={deleteBoard} className="tm-delete">
            🗑️
          </button>
        </div>
      </div>

      <div
        className="tm-board"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleBoardDrop}
        style={{
          height: `${calculatedHeight}px`,
          transition: "height 0.3s ease",
          overflowY: "auto",
        }}
      >
        <div className="tm-cards" ref={cardsContainerRef}>
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
