import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSelector } from "react-redux";
import DnDCard from "./DnDCard";
import DeleteBoardModal from "./DeleteBoardModal";
import EditBoardTitleModal from "./EditBoardTitleModal"; // 🔧 nouveau import

const DnDBoard = ({
  board,
  index,
  handleDrop,
  openModal,
  openViewerModal,
  handleUpdateBoard,
  handleDeleteBoard,
  onBoardDragStart,
  onBoardDrop,
}) => {
  const cardsContainerRef = useRef(null);
  const [calculatedHeight, setCalculatedHeight] = useState(80);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // 🔧 nouvel état
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const mode = useSelector((state) => state.theme.mode);
  const { setNodeRef } = useDroppable({ id: board.id });

  useEffect(() => {
    if (!cardsContainerRef.current) return;

    const cards = cardsContainerRef.current.children;
    let totalHeight = 0;

    for (let card of cards) {
      totalHeight += card.offsetHeight + 10;
    }

    totalHeight += 10;
    const screenHeight = window.innerHeight;
    const maxHeight = screenHeight * 0.7;

    setCalculatedHeight(Math.min(Math.max(80, totalHeight), maxHeight));
  }, [board.cards]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const editBoardTitle = () => {
    setShowEditModal(true); // 🔧 ouvre la modale
    setMenuOpen(false);
  };

  const confirmEdit = (newTitle) => {
    handleUpdateBoard(board.id, newTitle); // 🔧 met à jour
    setShowEditModal(false);
  };

  const deleteBoard = () => {
    setShowDeleteModal(true);
    setMenuOpen(false);
  };

  const confirmDelete = () => {
    handleDeleteBoard(board.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        className={`tm-board-container ${mode}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onBoardDrop(e, index)}
      >
        <div
          className={`tm-board-header ${mode}`}
          draggable
          onDragStart={(e) => onBoardDragStart(e, index)}
        >
          <h2>{board.title}</h2>

          <div className="tm-board-header-buttons">
            <button className="tm-add-card-btn" onClick={() => openModal(board.id)}>
              + Carte
            </button>

            <div className="tm-board-menu-wrapper" ref={menuRef}>
              <button
                className={`tm-board-menu-btn ${mode}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ⋯
              </button>

              {menuOpen && (
                <div className={`tm-board-menu ${mode}`}>
                  <button onClick={editBoardTitle}>✏️ Modifier</button>
                  <button onClick={deleteBoard}>🗑️ Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="tm-board"
          ref={setNodeRef}
          style={{
            height: `${calculatedHeight}px`,
            transition: "height 0.3s ease",
            overflowY: "auto",
          }}
        >
          <div className="tm-cards" ref={cardsContainerRef}>
            {board.cards.length === 0 && (
              <div className={`tm-empty-board-placeholder ${mode}`}>
                Déposez une carte ici
              </div>
            )}
            {board.cards.map((card) => (
              <DnDCard
                key={card.id}
                card={card}
                boardId={board.id}
                openViewerModal={openViewerModal}
                mode={mode}
              />
            ))}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteBoardModal
          title={board.title}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showEditModal && (
        <EditBoardTitleModal
          currentTitle={board.title}
          onConfirm={confirmEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default DnDBoard;
