// ✅ TaskManager.jsx (fusionné avec Masonry + DnDBoard + @dnd-kit + ViewerModal + fix trim error + DndContext intégré)

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Masonry from "react-masonry-css";
import { Sidebar, BoardModal, Modal, TaskViewerModal } from "@components";
import { DnDBoard }from "@components";
import "./TaskManager.css";

const loadBoardsFromStorage = (workspaceId) => {
  const data = localStorage.getItem(`boards_${workspaceId}`);
  return data ? JSON.parse(data) : [];
};

const saveBoardsToStorage = (workspaceId, boards) => {
  localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(boards));
};

const TaskManager = ({ workspaceId = "Default", sidebarVisible, setSidebarVisible }) => {

  const mode = useSelector((state) => state.theme.mode);
  const [boards, setBoards] = useState([]);
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    card: null,
  });
  const [viewingCard, setViewingCard] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);


  const [columns, setColumns] = useState(3);
  const COLUMN_WIDTH = 340;
  const GUTTER = 16;

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth - (sidebarVisible ? 300 : 0);
    const possibleColumns = Math.floor(width / (COLUMN_WIDTH + GUTTER));
    setColumns(Math.max(possibleColumns, 1));
  }, [sidebarVisible]);

  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]);

  useEffect(() => {
    const saved = loadBoardsFromStorage(workspaceId);
    setBoards(
      saved.length > 0
        ? saved
        : [
            {
              id: Date.now(),
              title: "Nouveau tableau",
              cards: [],
            },
          ]
    );
  }, [workspaceId]);

  useEffect(() => {
    saveBoardsToStorage(workspaceId, boards);
    localStorage.setItem("lastWorkspace", workspaceId);
  }, [boards, workspaceId]);

  const openModal = (boardId, card = null) => {
    setModalData({
      boardId,
      cardId: card?.id || null,
      card: card || null,
    });
    setShowModal(true);
  };

  const openViewer = (boardId, card) => {
    setViewingCard({ boardId, card });
  };

  const closeModal = () => {
    setShowModal(false);
    setViewingCard(null);
  };

  const handleCreateOrUpdateCard = (boardId, cardId, cardData) => {
    const { name, description } = cardData;
    if (typeof name !== "string" || !name.trim()) return alert("Le nom est requis.");
    if (typeof description !== "string" || !description.trim()) return alert("La description est requise.");

    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== boardId) return board;

        if (cardId) {
          return {
            ...board,
            cards: board.cards.map((c) => (c.id === cardId ? { ...c, ...cardData } : c)),
          };
        } else {
          return {
            ...board,
            cards: [
              ...board.cards,
              {
                ...cardData,
                id: `card-${Date.now()}`,
                createdAt: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }
      })
    );
    closeModal();
  };

  const handleDeleteCard = (boardId, cardId) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? { ...board, cards: board.cards.filter((card) => card.id !== cardId) }
          : board
      )
    );
  };

  const handleUpdateBoard = (boardId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return alert("Le nom ne peut pas être vide !");
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId ? { ...board, title: trimmed } : board
      )
    );
  };

  const handleDeleteBoard = (boardId) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const handleCreateBoard = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return alert("Le nom du tableau est requis.");
    const newBoard = {
      id: Date.now(),
      title: trimmedTitle,
      cards: [],
    };
    setBoards((prev) => [...prev, newBoard]);
  };

  const handleDrop = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;

    if (sourceBoardId === targetBoardId) {
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
      setBoards((prevBoards) => {
        const draggedCard = prevBoards
          .find((b) => b.id === sourceBoardId)
          ?.cards.find((card) => card.id === cardId);

        return prevBoards.map((board) => {
          if (board.id === sourceBoardId) {
            return {
              ...board,
              cards: board.cards.filter((card) => card.id !== cardId),
            };
          }
          if (board.id === targetBoardId) {
            const updatedCards = [...board.cards];
            if (draggedCard) {
              updatedCards.splice(targetIndex ?? updatedCards.length, 0, draggedCard);
            }
            return { ...board, cards: updatedCards };
          }
          return board;
        });
      });
    }
  };

  const handleCardDragEnd = (event) => {
    const { active, over } = event;
    if (!active?.id || !over?.id || active.id === over.id) return;

    const activeCardId = active.id;
    const overContainerId = over.id;

    let sourceBoardId = null;
    let draggedCard = null;

    for (const board of boards) {
      const card = board.cards.find((c) => c.id === activeCardId);
      if (card) {
        sourceBoardId = board.id;
        draggedCard = card;
        break;
      }
    }

    if (!sourceBoardId || !draggedCard) return;

    const targetBoard = boards.find((b) => b.id === overContainerId);
    if (targetBoard) {
      handleDrop(sourceBoardId, overContainerId, draggedCard.id);
      return;
    }

    for (const board of boards) {
      const index = board.cards.findIndex((c) => c.id === over.id);
      if (index !== -1) {
        handleDrop(sourceBoardId, board.id, draggedCard.id, index);
        return;
      }
    }
  };

  const onBoardDragStart = (e, index) => {
    setDraggingBoardIndex(index);
  };

  const onBoardDrop = (e, targetIndex) => {
    if (draggingBoardIndex === null || draggingBoardIndex === targetIndex) return;
    setBoards((prevBoards) => {
      const newBoards = [...prevBoards];
      const [movedBoard] = newBoards.splice(draggingBoardIndex, 1);
      newBoards.splice(targetIndex, 0, movedBoard);
      return newBoards;
    });
    setDraggingBoardIndex(null);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className={`tm-layout ${mode === "dark" ? "dark" : "light"}`}>
      {sidebarVisible && <Sidebar />}

      <div className="tm-main-content">
        <h1 className={`workSpaceName ${mode === "dark" ? "dark" : "light"}`}>{workspaceId}</h1>
        <button onClick={() => setShowBoardModal(true)} className="tm-Tabl">
          + Créer un tableau
        </button>

        <div className="tm-boards-wrapper">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardDragEnd}>
            <Masonry
              breakpointCols={columns}
              className="tm-boards-masonry"
              columnClassName="tm-boards-masonry-column"
            >
              {boards.map((board, index) => (
                <SortableContext
                  key={board.id}
                  items={board.cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DnDBoard
                    board={board}
                    index={index}
                    handleDrop={handleDrop}
                    openModal={openModal}
                    openViewerModal={openViewer}
                    handleUpdateBoard={handleUpdateBoard}
                    handleDeleteBoard={handleDeleteBoard}
                    onBoardDragStart={onBoardDragStart}
                    onBoardDrop={onBoardDrop}
                  />
                </SortableContext>
              ))}
            </Masonry>
          </DndContext>
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

      {viewingCard && (
        <TaskViewerModal
          card={viewingCard.card}
          boardId={viewingCard.boardId}
          closeModal={closeModal}
          openEdit={openModal}
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