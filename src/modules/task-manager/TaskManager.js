import React, { useState } from "react";
import Board from "../../components/taskManager/Board";
import Modal from "../../components/taskManager/Modal";
import "./TaskManager.css";

const TaskManager = () => {
  
  const [draggingCardInfo, setDraggingCardInfo] = useState(null);
  const closeModal = () => setShowModal(false);
  const [showModal, setShowModal] = useState(false);

  const [boards, setBoards] = useState([
    {
      id: 1,
      title: "To Do",
      cards: [
        { id: 1, text: "Learn React", color: "#f8d7da" },
        { id: 2, text: "Build Task Manager", color: "#d4edda" },
      ],
    },
    { id: 2, title: "In Progress", cards: [] },
    { id: 3, title: "Done", cards: [] },
    { id: 4, title: "Fuck", cards: [] },
    //const [boards, setBoards] = useState(getCardData(mettre l'api))
  ]);

  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    text: "",
    color: "#ffffff",
  });

  const openModal = (boardId, card = null) => {
    setModalData({
      boardId,
      cardId: card?.id || null,
      text: card?.text || "",
      color: card?.color || "#ffffff",
    });
    setShowModal(true);
  };

  const handleCreateOrUpdateCard = (boardId, cardId, text, color) => {
    if (!text.trim()) {
      alert("Text cannot be empty.");
      return;
    }

    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id === boardId) {
          if (cardId) {
            // Mise à jour de la carte existante
            return {
              ...board,
              cards: board.cards.map((card) =>
                card.id === cardId ? { ...card, text, color } : card
              ),
            };
          } else {
            // Création d'une nouvelle carte
            const newCard = { id: Date.now(), text, color };
            return { ...board, cards: [...board.cards, newCard] };
          }
        }
        return board;
      })
    );

    closeModal();
  };

  const handleDeleteCard = (boardId, cardId) => {
    // Suppression d'une carte spécifique
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? { ...board, cards: board.cards.filter((card) => card.id !== cardId) }
          : board
      )
    );
  };

  const handleDrop = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;

    if (sourceBoardId === targetBoardId) {
      // Réordonner les cartes dans le même tableau
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board.id === sourceBoardId) {
            const updatedCards = [...board.cards];
            const cardIndex = updatedCards.findIndex((card) => card.id === cardId);

            if (cardIndex === -1 || cardIndex === targetIndex) return board;

            const [movedCard] = updatedCards.splice(cardIndex, 1);
            updatedCards.splice(targetIndex, 0, movedCard);

            return { ...board, cards: updatedCards };
          }
          return board;
        })
      );
    } else {
      // Déplacer la carte vers un autre tableau
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board.id === sourceBoardId) {
            return {
              ...board,
              cards: board.cards.filter((card) => card.id !== cardId),
            };
          }
          if (board.id === targetBoardId) {
            const draggedCard = boards
              .find((b) => b.id === sourceBoardId)
              ?.cards.find((card) => card.id === cardId);

            const updatedCards = [...board.cards];
            if (draggedCard) {
              if (targetIndex === null || targetIndex === undefined) {
                updatedCards.push(draggedCard);
              } else {
                updatedCards.splice(targetIndex, 0, draggedCard);
              }
            }

            return { ...board, cards: updatedCards };
          }
          return board;
        })
      );
    }

    setDraggingCardInfo(null);
  };

  return (
    <div className="tm-task-manager">
      <h1>Task Manager ⭐</h1>
      <div className="tm-boards">
        {boards.map((board) => (
          <Board
            key={board.id}
            board={board}
            handleDrop={handleDrop}
            setDraggingCardInfo={setDraggingCardInfo}
            openModal={openModal}
          />
        ))}
      </div>
      {showModal && (
        <Modal
          modalData={modalData}
          closeModal={closeModal}
          handleCreateOrUpdateCard={handleCreateOrUpdateCard}
          handleDeleteCard={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default TaskManager;
