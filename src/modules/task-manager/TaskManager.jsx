import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { useBoardManager, useCardManager, BoardCardAccess, useSocketWorkspace } from "@components";
import { UserInfo, normalize, TaskApi, Socket, useGhostDragAndDrop } from "@service";

import "./TaskManager.css";
import "../../components/taskManager/BoardManager.css";



const TaskManager = ({ workspaceId = "Default", search = "" }) => {


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

useGhostDragAndDrop({
  dragSelector: ".tm-cards > div",
  onMouseUpCallback: async ({ draggedElement, event }) => {
    const getIndex = (el) => Array.from(el.parentElement.children).indexOf(el);

    const secondElement = event.target.closest(".tm-cards > div");
    const data = {
      idCard: draggedElement.getAttribute("data-id"),
      oldPos: getIndex(draggedElement),
      oldTableau: draggedElement.parentElement.getAttribute("data-id"),
    };

    if (secondElement === null && event.target.closest(".tm-board-container") !== null) {
      data.newPos = 0;
      data.newTableau = event.target
        .closest(".tm-board-container")
        .querySelector(".tm-cards")
        .getAttribute("data-id");
    }

    if (draggedElement && secondElement && draggedElement !== secondElement) {
      data.newPos = getIndex(secondElement);
      data.newTableau = secondElement.parentElement.getAttribute("data-id");
    }

    if (data.newTableau !== undefined) {
      await TaskApi.moveCard(workspaceId, data);
    }
  },
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
  const fctSocket = useSocketWorkspace(); // ✅ appel du hook
  const socketRef = useRef(null);

  useEffect(() => {
    if (workspaceId) {
      UserInfo.set("lastWorkspace", workspaceId);
    }
  }, [workspaceId]);

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth;
    const colUnit = COLUMN_WIDTH + GUTTER;
    const possibleColumns = Math.round(width / colUnit);

    setColumns(Math.max(possibleColumns, 1));
  }, []);


  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]);


  // ✅ Reconnexion automatique, avec dépendance minimale
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!workspaceId || workspaceId === "Default" || droit === null) return;

    const handlersMap = {
      updateCard: (data) => setBoards(prev => fctSocket.handleUpdateCard(prev, data)),
      newCard: (data) => setBoards(prev => fctSocket.handleCreateCard(prev, data, droit)),
      deleteCard: (data) => setBoards(prev => fctSocket.handleDeleteCard(prev, data)),
      moveCard: (data) => setBoards(prev => fctSocket.handleMoveCard(prev, data)),
      newTableau: (data) => setBoards(prev => fctSocket.handleCreateBoard(prev, data, droit)),
      updateTableau: (data) => setBoards(prev => fctSocket.handleUpdateBoard(prev, data)),
      deleteTableau: (data) => setBoards(prev => fctSocket.handleDeleteBoard(prev, data)),
    };

    Object.entries(handlersMap).forEach(([type, handler]) => {
      Socket.onMessage(type, handler);
    });

    return () => {
      Object.entries(handlersMap).forEach(([type, handler]) => {
        Socket.offMessage(type, handler);
      });
    };
  }, [workspaceId, droit]); // ✅ ne pas ajouter droit, fctSocket, setBoards ici




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
    <div className={`tm-layout `}>
      <div className="tm-main-content">
        {BoardCardAccess.hasWriteAccess(droit) && (
          <button
            className={`tm-floating-add`}
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
