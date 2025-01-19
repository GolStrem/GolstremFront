import React, { useRef, useEffect, useState } from "react";
import Card from "./Card";

const Board = ({ board, handleDrop, setDraggingCardInfo, openModal, handleDeleteCard }) => {
  const cardsContainerRef = useRef(null); // Référence pour le conteneur des cartes
  const [calculatedHeight, setCalculatedHeight] = useState(80); // Hauteur initiale minimale du tableau

  // Fonction pour calculer la hauteur totale des cartes
  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.children;
      let totalHeight = 0;

      for (let card of cards) {
        totalHeight += card.offsetHeight + 10; // Ajoute la hauteur de la carte + l'espace entre cartes
      }

      // Ajoute 10px supplémentaires après la dernière carte
      totalHeight += 10;

      const screenHeight = window.innerHeight;
      const maxBoardHeight = screenHeight * 0.7;

      // Met à jour la hauteur du tableau en respectant la limite
      setCalculatedHeight(Math.min(Math.max(80, totalHeight), maxBoardHeight));
    }
  }, [board.cards]); // Recalcul à chaque mise à jour des cartes

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
    <div className="tm-board-container">
      <div className="tm-board-header">
        <h2>{board.title}</h2>
        <button
          className="tm-add-card-btn"
          onClick={() => openModal(board.id)}
        >
          + Add Card
        </button>
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
              handleDeleteCard={handleDeleteCard} // Passe la fonction de suppression
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
