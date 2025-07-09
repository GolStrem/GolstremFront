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
import { useBoardManager, useCardManager, BoardCardAccess, useDomDragAndDrop } from "@components";
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

  const { createOrUpdateCard, deleteCard } = useCardManager(
    workspaceId,
    boards,
    setBoards
  );

  useDomDragAndDrop(({ idCard, oldPos, newPos, oldTab, newTab }) => {
    setBoards((prev) => {
      const updated = [...prev];

      const sourceBoard = updated.find((b) => b.id === oldTab);
      const targetBoard = updated.find((b) => b.id === newTab);

      if (!sourceBoard || !targetBoard) return updated;

      const [movedCard] = sourceBoard.cards.splice(oldPos, 1);
      targetBoard.cards.splice(newPos, 0, movedCard);

      return updated;
    });
  });

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

  const refreshBoards = async () => {
    try {
      const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
      const updatedBoards = (data.tableau || []).map(b => ({
        id: b.id,
        name: b.name,
        color: b.color,
        image: b.image,
        createdAt: b.createdAt,
        droit,
        cards: b.card || []
      }));
      setBoards(updatedBoards);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement :", err);
    }
  };

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
