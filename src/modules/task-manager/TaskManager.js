import React, { useState, useEffect, useCallback } from "react";
import Board from "../../components/taskManager/Board";
import Modal from "../../components/taskManager/Modal";
import BoardModal from "../../components/taskManager/BoardModal";
import Sidebar from "../../components/taskManager/Sidebar";
import "./TaskManager.css";
import { useSelector } from "react-redux";
import Masonry from "react-masonry-css";

const loadBoardsFromStorage = (workspaceId) => {
  const data = localStorage.getItem(`boards_${workspaceId}`);
  return data ? JSON.parse(data) : [];
};

const saveBoardsToStorage = (workspaceId, boards) => {
  localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(boards));
};

const TaskManager = ({ workspaceId = "Default" }) => {
  const mode = useSelector((state) => state.theme.mode);
  const [boards, setBoards] = useState([]);
  const [, setDraggingCardInfo] = useState(null); // ✅ valeur inutilisée retirée
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    text: "",
    color: "#ffffff",
  });
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Masonry dynamic columns
  const [columns, setColumns] = useState(3);
  const COLUMN_WIDTH = 340;
  const GUTTER = 16;

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth - (sidebarVisible ? 300 : 0);
    const possibleColumns = Math.floor(width / (COLUMN_WIDTH + GUTTER));
    setColumns(Math.max(possibleColumns, 1));
  }, [sidebarVisible]); // ✅ useCallback avec dépendance

  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]); // ✅ clean dependency

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
      text: card?.text || "",
      color: card?.color || "#ffffff",
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreateOrUpdateCard = (boardId, cardId, text, color) => {
    if (!text.trim()) return alert("Le texte est requis.");
    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== boardId) return board;
        if (cardId) {
          return {
            ...board,
            cards: board.cards.map((card) =>
              card.id === cardId ? { ...card, text, color } : card
            ),
          };
        } else {
          const newCard = { id: Date.now(), text, color };
          return { ...board, cards: [...board.cards, newCard] };
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
              updatedCards.splice(targetIndex ?? updatedCards.length, 0, draggedCard);
            }
            return { ...board, cards: updatedCards };
          }
          return board;
        })
      );
    }

    setDraggingCardInfo(null);
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

  return (
    <div className={`tm-layout ${mode === "dark" ? "dark" : "light"}`}>
      <button
        className={`hamburger-btn ${mode === "dark" ? "dark" : "light"}`}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{ left: sidebarVisible ? "300px" : "0" }}
      >
        ☰
      </button>

      {sidebarVisible && <Sidebar />}

      <div className="tm-main-content" style={{ marginLeft: sidebarVisible ? "300px" : "0" }}>
        <h1 className={`workSpaceName ${mode === "dark" ? "dark" : "light"}`}>{workspaceId}</h1>
        <button onClick={() => setShowBoardModal(true)} className="tm-Tabl">
          + Créer un tableau
        </button>

        <div className="tm-boards-wrapper">
          <Masonry
            breakpointCols={columns}
            className="tm-boards-masonry"
            columnClassName="tm-boards-masonry-column"
          >
            {boards.map((board, index) => (
              <Board
                key={board.id}
                board={board}
                index={index}
                handleDrop={handleDrop}
                setDraggingCardInfo={setDraggingCardInfo}
                openModal={openModal}
                handleUpdateBoard={handleUpdateBoard}
                handleDeleteBoard={handleDeleteBoard}
                onBoardDragStart={onBoardDragStart}
                onBoardDrop={onBoardDrop}
              />
            ))}
          </Masonry>
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
