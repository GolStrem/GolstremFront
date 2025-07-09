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
import { BoardModal, Modal, TaskViewerModal, DnDBoard } from "@components";
import { useBoardManager, useCardManager, BoardCardAccess } from "@components";
import { UserInfo, normalize, TaskApi } from "@service";

import "./TaskManager.css";
import "../../components/taskManager/BoardManager.css";

const TaskManager = ({ workspaceId = "Default", search = "" }) => {
  const mode = useSelector((state) => state.theme.mode);

  const {
    boards,
    setBoards,
    createBoard,
    deleteBoard,
    updateBoard,
    dragStartBoard,
    dropBoard,
    droit,
  } = useBoardManager(workspaceId);

  const { createOrUpdateCard, deleteCard } = useCardManager(workspaceId, boards, setBoards);

  const filteredBoards = boards
    .map((board) => {
      const q = normalize(search.trim());
      if (!q) return board;

      const boardMatch = normalize(board.name).includes(q);
      if (boardMatch) return board;

      const cardsMatch = (board.cards || []).filter(
        (card) =>
          normalize(card.name).includes(q) ||
          normalize(card.description).includes(q)
      );

      if (cardsMatch.length > 0) {
        return { ...board, cards: cardsMatch };
      }

      return null;
    })
    .filter(Boolean);

  const [columns, setColumns] = useState(3);
  const COLUMN_WIDTH = 340;
  const GUTTER = 16;

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    card: null,
  });
  const [viewingCard, setViewingCard] = useState(null);
  const [showBoardModal, setShowBoardModal] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      UserInfo.set("lastWorkspace", workspaceId);
    }
  }, [workspaceId]);

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth;
    const possibleColumns = Math.floor(width / (COLUMN_WIDTH + GUTTER));
    setColumns(Math.max(possibleColumns, 1));
  }, []);

  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]);

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


  const moveCardToOtherBoard = ({ active, over }) => {
  if (!active?.id || !over?.id) return;

  const cardId = active.id;
  const overId = over.id;

  let sourceBoardIndex = null;
  let targetBoardIndex = null;

  let cardToMove = null;

  boards.forEach((board, boardIdx) => {
    const card = board.cards.find(c => c.id === cardId);
    if (card) {
      sourceBoardIndex = boardIdx;
      cardToMove = card;
    }

    if (board.id === overId || board.cards.some(c => c.id === overId)) {
      targetBoardIndex = boardIdx;
    }
  });

  if (!cardToMove || sourceBoardIndex === null || targetBoardIndex === null) return;
  if (sourceBoardIndex === targetBoardIndex) return; // ne fait rien si c'est le même board

  setBoards(prev => {
    const updated = [...prev];

    updated[sourceBoardIndex].cards = updated[sourceBoardIndex].cards.filter(c => c.id !== cardId);
    updated[targetBoardIndex].cards = [
      ...updated[targetBoardIndex].cards,
      cardToMove
    ];

    return updated;
  });

  TaskApi.moveCard(workspaceId, {
    cardId,
    fromBoardId: boards[sourceBoardIndex].id,
    toBoardId: boards[targetBoardIndex].id,
  });
  };

  const reorderCardsInBoard = ({ active, over }) => {
  if (!active?.id || !over?.id || active.id === over.id) return;

  const cardId = active.id;
  const overCardId = over.id;

  let boardIndex = null;
  let sourceIndex = null;
  let targetIndex = null;

  boards.forEach((board, bIdx) => {
    board.cards.forEach((card, cIdx) => {
      if (card.id === cardId) {
        boardIndex = bIdx;
        sourceIndex = cIdx;
      }
      if (card.id === overCardId) {
        boardIndex = bIdx;
        targetIndex = cIdx;
      }
    });
  });

  if (boardIndex === null || sourceIndex === null || targetIndex === null) return;

  setBoards(prev => {
    const updated = [...prev];
    const cards = [...updated[boardIndex].cards];
    const [moved] = cards.splice(sourceIndex, 1);
    cards.splice(targetIndex, 0, moved);
    updated[boardIndex].cards = cards;
    return updated;
  });

  TaskApi.moveCard(workspaceId, {
    cardId,
    fromBoardId: boards[boardIndex].id,
    toBoardId: boards[boardIndex].id,
    oldPos: sourceIndex,
    newPos: targetIndex,
  });
  };


  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className={`tm-layout ${mode === "dark" ? "dark" : "light"}`}>
      <div className="tm-main-content">
      
         {BoardCardAccess.hasWriteAccess(droit) && (
        <button
          className={`tm-floating-add ${mode === "dark" ? "dark" : "light"}`}   
          onClick={() => setShowBoardModal(true)}
        >
          <span className="tm-add-icon">+</span>
          <span className="tm-add-text"> Nouveau tableau </span>
        </button>
         )}


        <div className="tm-boards-wrapper">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            moveCardToOtherBoard(event);
            reorderCardsInBoard(event);
          }}
        >

            <Masonry
              breakpointCols={columns}
              className="tm-boards-masonry"
              columnClassName="tm-boards-masonry-column"
            >
              {filteredBoards.map((board, index) => (
                <SortableContext
                  key={board.id}
                  items={board.cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DnDBoard
                    board={board}
                    index={index}
                    openModal={openModal}
                    openViewerModal={openViewer}
                    handleUpdateBoard={updateBoard}
                    handleDeleteBoard={deleteBoard}
                    onBoardDragStart={() => dragStartBoard(index)}
                    onBoardDrop={() => dropBoard(index)}
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
          handleCreateOrUpdateCard={createOrUpdateCard}
          handleDeleteCard={deleteCard}
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
          handleCreateBoard={createBoard}
        />
      )}
    </div>
  );
};

export default TaskManager;
