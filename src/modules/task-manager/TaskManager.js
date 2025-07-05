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
import { useBoardManager } from "@components"; 
import "./TaskManager.css";
import "../../components/taskManager/BoardManager.css"
import { UserInfo } from "@service";


const TaskManager = ({ workspaceId = "Default", sidebarVisible }) => {
  const mode = useSelector((state) => state.theme.mode);
  const {
    boards,
    createBoard,
    deleteBoard,
    updateBoard,
    createOrUpdateCard,
    deleteCard,
    dragStartBoard,
    dropBoard,
  } = useBoardManager(workspaceId);

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
    UserInfo.set("lastWorkspace", workspaceId)
  }
  }, [workspaceId]);



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

      return;
    }

    for (const board of boards) {
      const index = board.cards.findIndex((c) => c.id === over.id);
      if (index !== -1) {

        return;
      }
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className={`tm-layout ${mode === "dark" ? "dark" : "light"}`}>
      <div className="tm-main-content">
        <button
        
          className={`tm-floating-add ${mode === "dark" ? "dark" : "light"}`}
          onClick={() => setShowBoardModal(true)}
        >
          <span className="tm-add-icon">+</span>
          <span className="tm-add-text"> Nouveau tableau</span>
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
                    openModal={openModal}
                    openViewerModal={openViewer}
                    handleUpdateBoard={updateBoard}
                    handleDeleteBoard={deleteBoard}
                    onBoardDragStart={(e) => dragStartBoard(index)}
                    onBoardDrop={(e) => dropBoard(index)}
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
