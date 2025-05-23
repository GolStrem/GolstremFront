import React, { useState } from "react";
import Board from "../../components/taskManager/Board";
import Modal from "../../components/taskManager/Modal";
import BoardModal from "../../components/taskManager/BoardModal";
import "./TaskManager.css";
import { useSelector } from "react-redux"; // Utilisation de Redux


const TaskManager = () => {
  const [draggingCardInfo, setDraggingCardInfo] = useState(null);
  const mode = useSelector((state) => state.theme.mode); // Récupère le mode depuis Redux

  // Modal de cartes
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    text: "",
    color: "#ffffff",
  });

  // Modal de création de tableau
  const [showBoardModal, setShowBoardModal] = useState(false);

  // State des tableaux et cartes
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
    { id: 4, title: "Test", cards: [] },
  ]);

  // Ouvre le modal pour créer / éditer une carte
  const openModal = (boardId, card = null) => {
    setModalData({
      boardId,
      cardId: card?.id || null,
      text: card?.text || "",
      color: card?.color || "#ffffff",
    });
    setShowModal(true);
  };

  // Crée ou met à jour une carte
  const handleCreateOrUpdateCard = (boardId, cardId, text, color) => {
    if (!text.trim()) {
      alert("Text cannot be empty.");
      return;
    }

    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== boardId) return board;

        if (cardId) {
          // Mise à jour
          return {
            ...board,
            cards: board.cards.map((card) =>
              card.id === cardId ? { ...card, text, color } : card
            ),
          };
        } else {
          // Création
          const newCard = { id: Date.now(), text, color };
          return { ...board, cards: [...board.cards, newCard] };
        }
      })
    );

    closeModal();
  };

  // Supprime une carte
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

  // Renomme un tableau
  const handleUpdateBoard = (boardId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      alert("Le nom du tableau ne peut pas être vide !");
      return;
    }

    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId ? { ...board, title: trimmed } : board
      )
    );
  };

  // Supprime un tableau
  const handleDeleteBoard = (boardId) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  // Crée un nouveau tableau
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

  // Gestion du drag & drop
  const handleDrop = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;

    if (sourceBoardId === targetBoardId) {
      // Réordonne dans le même tableau
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board.id !== sourceBoardId) return board;

          const updatedCards = [...board.cards];
          const cardIndex = updatedCards.findIndex((card) => card.id === cardId);

          if (cardIndex === -1 || cardIndex === targetIndex) return board;

          const [movedCard] = updatedCards.splice(cardIndex, 1);
          updatedCards.splice(targetIndex, 0, movedCard);

          return { ...board, cards: updatedCards };
        })
      );
    } else {
      // Déplace vers un autre tableau
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
  <div className={`tm-layout ${mode === "dark" ? "dark" : "light"}`}>
    <aside className="tm-sidebar">
      <h2>Menu</h2>
      <button className="tm-nav-btn">🏠 Accueil</button>
      <button className="tm-nav-btn">📝 Tâches</button>
      <button className="tm-nav-btn">➕ Ajouter une page</button>
    </aside>

    <div className="tm-main-content">
      <h1>Gestion des tâches</h1>
      <button onClick={() => setShowBoardModal(true)} className="tm-Tabl">+ Créer un tableau</button>

      <div className="tm-boards-wrapper">
        <div className="tm-boards">
          {boards.map((board) => (
            <Board
              key={board.id}
              board={board}
              handleDrop={handleDrop}
              setDraggingCardInfo={setDraggingCardInfo}
              openModal={openModal}
              handleUpdateBoard={handleUpdateBoard}
              handleDeleteBoard={handleDeleteBoard}
            />
          ))}
        </div>
      </div>
    </div>

    {showModal && (
      <Modal
        modalData={modalData}
        closeModal={closeModal}
        handleCreateOrUpdateCard={handleCreateOrUpdateCard}
        handleDeleteCard={handleDeleteCard}
      />
    )}

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
