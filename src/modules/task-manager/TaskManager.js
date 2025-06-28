import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, closestCorners } from "@dnd-kit/core";

import "./TaskManager.css";
import {
  DnDBoard,
  TaskEditorModal,
  TaskViewerModal,
  BoardModal,
} from "@components";

const TaskManager = () => {
  const { id: workspaceId } = useParams();
  const [boards, setBoards] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    const stored = localStorage.getItem(`boards_${workspaceId}`);
    if (stored) {
      setBoards(JSON.parse(stored));
    } else {
      const defaultBoards = [
        {
          id: `board-${Date.now()}`,
          title: "Nouveau tableau",
          cards: [],
        },
      ];
      setBoards(defaultBoards);
      localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(defaultBoards));
    }

    setIsInitialized(true);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId && isInitialized) {
      localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(boards));
    }
  }, [boards, workspaceId, isInitialized]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceBoard = boards.find((b) => b.cards.some((c) => c.id === active.id));
    const targetBoard =
      boards.find((b) => b.cards.some((c) => c.id === over.id)) ||
      boards.find((b) => b.id === over.id);
    if (!sourceBoard || !targetBoard) return;

    const draggedCard = sourceBoard.cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    if (sourceBoard.id === targetBoard.id) {
      const reorderedCards = [...sourceBoard.cards.filter((c) => c.id !== active.id)];
      const overIndex = targetBoard.cards.findIndex((c) => c.id === over.id);
      reorderedCards.splice(overIndex, 0, draggedCard);

      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === sourceBoard.id ? { ...board, cards: reorderedCards } : board
        )
      );
    } else {
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board.id === sourceBoard.id) {
            return { ...board, cards: board.cards.filter((c) => c.id !== active.id) };
          }
          if (board.id === targetBoard.id) {
            const index = targetBoard.cards.findIndex((c) => c.id === over.id);
            const updatedCards = [...targetBoard.cards];
            updatedCards.splice(index >= 0 ? index : 0, 0, draggedCard);
            return { ...board, cards: updatedCards };
          }
          return board;
        })
      );
    }
  };

  const openCreateCard = (boardId) => {
    setModalData({ boardId, cardId: null, card: null });
  };

  const openEditCard = (boardId, card) => {
    setModalData({ boardId, cardId: card.id, card });
  };

  const openViewer = (boardId, card) => {
    setViewingCard({ boardId, card });
  };

  const closeModal = () => {
    setModalData(null);
    setViewingCard(null);
    setShowBoardModal(false);
  };

  const handleCreateOrUpdateCard = (boardId, cardId, newCardData) => {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;

        const existingCardIndex = board.cards.findIndex((c) => c.id === cardId);
        if (existingCardIndex !== -1) {
          const updatedCards = [...board.cards];
          updatedCards[existingCardIndex] = {
            ...updatedCards[existingCardIndex],
            ...newCardData,
          };
          return { ...board, cards: updatedCards };
        } else {
          return {
            ...board,
            cards: [
              ...board.cards,
              {
                ...newCardData,
                id: `card-${Date.now()}`,
                createdAt: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }
      })
    );
  };

  const handleDeleteCard = (boardId, cardId) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, cards: board.cards.filter((c) => c.id !== cardId) }
          : board
      )
    );
  };

  const handleDeleteBoard = (boardId) => {
    if (window.confirm("Supprimer ce tableau ?")) {
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    }
  };

  const handleCreateBoard = (title) => {
    const newBoard = {
      id: `board-${Date.now()}`,
      title,
      cards: [],
    };
    setBoards((prev) => [...prev, newBoard]);
  };

  return (
    <div className="tm-task-manager">
      <div className="tm-boards-wrapper">
        <button className="tm-Tabl" onClick={() => setShowBoardModal(true)}>
          + Créer un tableau
        </button>

        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="tm-grid-board-layout">
            {boards.map((board) => (
              <div key={board.id} className="tm-board-container">
                <div className="tm-board-header">
                  <h2>{board.title}</h2>
                  <div className="tm-board-buttons">
                    <button className="tm-edit" onClick={() => openCreateCard(board.id)}>
                      + Add Card
                    </button>
                    <button
                      className="tm-delete"
                      onClick={() => handleDeleteBoard(board.id)}
                      title="Supprimer le tableau"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <DnDBoard
                  board={board}
                  openCreateCard={openCreateCard}
                  openViewerModal={openViewer}
                />
              </div>
            ))}
          </div>
        </DndContext>
      </div>

      {modalData && (
        <TaskEditorModal
          modalData={modalData}
          closeModal={closeModal}
          handleCreateOrUpdateCard={handleCreateOrUpdateCard}
          handleDeleteCard={handleDeleteCard}
        />
      )}

      {viewingCard && (
        <TaskViewerModal
          card={viewingCard.card}
          boardId={viewingCard.boardId}
          closeModal={closeModal}
          openEdit={openEditCard}
        />
      )}

      {showBoardModal && (
        <BoardModal closeModal={closeModal} handleCreateBoard={handleCreateBoard} />
      )}
    </div>
  );
};

export default TaskManager;
