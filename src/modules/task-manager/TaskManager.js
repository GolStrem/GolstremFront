import React, { useState } from "react";
import Board from "../../components/taskManager/Board";
import Modal from "../../components/taskManager/Modal";
import BoardModal from "../../components/taskManager/BoardModal";  // <-- Import du nouveau composant
import "./TaskManager.css";

const TaskManager = () => {
  // État pour le Drag & Drop (si nécessaire)
  const [draggingCardInfo, setDraggingCardInfo] = useState(null);

  // État et data du Modal de cartes
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    text: "",
    color: "#ffffff",
  });

  // État et data du Modal pour création de tableau
  const [showBoardModal, setShowBoardModal] = useState(false);

  // Votre state de tableaux et cartes
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
  ]);

  /**
   * Ouvre le modal dédié aux cartes (création/édition) 
   */
  const openModal = (boardId, card = null) => {
    setModalData({
      boardId,
      cardId: card?.id || null,
      text: card?.text || "",
      color: card?.color || "#ffffff",
    });
    setShowModal(true);
  };

  /**
   * Crée ou met à jour une carte dans un tableau
   */
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

  /**
   * Supprime une carte
   */
  const handleDeleteCard = (boardId, cardId) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              cards: board.cards.filter((card) => card.id !== cardId),
            }
          : board
      )
    );
  };

  /**
   * Crée un nouveau tableau
   */
  const handleCreateBoard = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Le nom du tableau ne peut pas être vide !");
      return;
    }
    const newBoard = {
      id: Date.now(),
      title: trimmedTitle,
      cards: [],
    };
    setBoards((prev) => [...prev, newBoard]);
  };

  /**
   * Gère le drag & drop des cartes
   */
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

      {/**
       * Bouton pour ouvrir le modal de création de tableau
       */}
      <button onClick={() => setShowBoardModal(true)}>+ Créer un tableau</button>

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

      {/**
       * Modal pour créer/modifier les CARTES (existant déjà)
       */}
      {showModal && (
        <Modal
          modalData={modalData}
          closeModal={closeModal}
          handleCreateOrUpdateCard={handleCreateOrUpdateCard}
          handleDeleteCard={handleDeleteCard}
        />
      )}

      {/**
       * Modal pour créer un NOUVEAU TABLEAU
       */}
      {showBoardModal && (
        <BoardModal
          closeModal={() => setShowBoardModal(false)}
          handleCreateBoard={handleCreateBoard}
        />
      )}
    </div>
  );
};

export default TaskManager;
