import React, { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import DnDCard from "./DnDCard";
import { EditBoardTitleModal, DeleteBoardModal, BoardCardAccess } from "@components";
import BoardMenuPortal from "./BoardMenuPortal";
import { useIcon } from "../../utils/iconImports";
import { useTranslation } from "react-i18next";

const DnDBoard = ({
  board,
  index,
  handleDrop,
  openModal,
  openViewerModal,
  handleUpdateBoard,
  handleDeleteBoard,
  onBoardDragStart,
  onBoardDrop
}) => {
  const { t } = useTranslation("workspace");

  const collapseRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const buttonRef = useRef(null); // Bouton ⋯
  const menuRef = useRef(null);   // Menu contextuel

  // Utilisation optimisée des icônes
  const { Icon: ChevronDownIcon } = useIcon('ChevronDown');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const { setNodeRef, isOver } = useDroppable({ id: board.id });

  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = 80;

      let left = rect.left;
      let top = rect.bottom + window.scrollY;

      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
      }
      if (top + menuHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - menuHeight;
      }
      setMenuPosition({ top, left });
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const el = collapseRef.current;
    const cardsEl = cardsContainerRef.current;
    if (!el || !cardsEl || isCollapsed) return;

    const adjustHeight = () => {
      el.style.maxHeight = cardsEl.scrollHeight + "px";
    };
    adjustHeight();

    const images = cardsEl.querySelectorAll("img");
    let pending = 0;

    images.forEach((img) => {
      if (!img.complete) {
        pending++;
        img.addEventListener("load", () => {
          pending--;
          if (pending === 0) adjustHeight();
        });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", adjustHeight);
      });
    };
  }, [board.cards, isCollapsed]);

  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return;
    if (isCollapsed) {
      el.style.maxHeight = el.scrollHeight + "px";
      requestAnimationFrame(() => {
        el.style.maxHeight = "0px";
      });
    } else {
      el.style.maxHeight = el.scrollHeight + "px";
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isOver && isCollapsed) setIsCollapsed(false);
  }, [isOver, isCollapsed]);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const editBoardTitle = () => {
    setShowEditModal(true);
    setMenuOpen(false);
  };

  const confirmEdit = (newTitle) => {
    handleUpdateBoard(board.id, newTitle);
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
        className="tm-board-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onBoardDrop(e, index)}
      >
        <div
          className="tm-board-header"
          draggable
          onDragStart={(e) => onBoardDragStart(e, index)}
          onClick={toggleCollapse}
          style={{ cursor: "pointer" }}
        >
          <h2 className="tm-board-title">
            {ChevronDownIcon && <ChevronDownIcon className={`tm-chevron ${isCollapsed ? "collapsed" : ""}`} />}
            {board.name}
            {board.cards.length > 0 && (
              <span className="tm-card-count">({board.cards.length})</span>
            )}
          </h2>

          {BoardCardAccess.hasWriteAccess(board.droit) && (
            <div
              className="tm-board-header-buttons"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="tm-add-card-btn" onClick={() => openModal(board.id)}>
                {t("workspace.addCard")}
              </button>

              <div className="tm-board-menu-wrapper">
                <button
                  className="tm-board-menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  ref={buttonRef}
                  aria-label={t("workspace.openBoardMenu")}
                  title={t("workspace.openBoardMenu")}
                >
                  ...
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`tm-board-collapse ${isCollapsed ? "collapsed" : ""}`}
          ref={(el) => {
            collapseRef.current = el;
            setNodeRef(el);
          }}
          style={{
            overflowY: isCollapsed ? "hidden" : "auto",
            transition: "max-height 0.3s ease, overflow 0.3s ease"
          }}
        >
          <div className="tm-cards" ref={cardsContainerRef} data-id={board.id}>
            {board.cards.length === 0 && (
              <div className="tm-empty-board-placeholder">
                {t("workspace.dropCardHere")}
              </div>
            )}

            {board.cards.map((card) => (
              <DnDCard
                key={card.id}
                card={card}
                boardId={board.id}
                openViewerModal={openViewerModal}
              />
            ))}
          </div>
        </div>
      </div>

      {menuOpen && (
        <BoardMenuPortal>
          <div
            ref={menuRef}
            className="tm-board-menu fixed"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 9999
            }}
          >
            <button onClick={editBoardTitle}>✏️ {t("workspace.menuEdit")}</button>
            {BoardCardAccess.isOwner(board.droit) && (
              <button onClick={deleteBoard}>🗑️ {t("delete")}</button>
            )}
          </div>
        </BoardMenuPortal>
      )}

      {showDeleteModal && (
        <DeleteBoardModal
          title={board.name}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showEditModal && (
        <EditBoardTitleModal
          currentTitle={board.name}
          onConfirm={confirmEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default DnDBoard;
