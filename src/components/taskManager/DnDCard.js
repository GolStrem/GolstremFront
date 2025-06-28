import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";
import "./TaskCard.css";

const DnDCard = ({ card, boardId, openViewerModal }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const clickStart = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    transition: {
      duration: 150,
    },
    activationConstraint: {
      delay: 2000,
      tolerance: 5,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: card.color || "#ffffff",
    padding: "8px",
    margin: "8px 0",
    borderRadius: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    cursor: "pointer",
  };

  const handleMouseDown = () => {
    clickStart.current = Date.now();
  };

  const handleMouseUp = () => {
    const clickDuration = Date.now() - clickStart.current;
    if (clickDuration < 200) {
      openViewerModal(boardId, card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={style}
      className={`task-card ${themeMode}`}
    >
      <h4 className="task-title">{card.text || card.name || "Sans titre"}</h4>

      {card.description && (
        <p className="task-preview">
          {card.description.slice(0, 80)}
          {card.description.length > 80 ? "…" : ""}
        </p>
      )}

      {card.image && (
        <div className="task-attachment-icon" title="Pièce jointe">
          📎
        </div>
      )}

      {card.endAt && (
        <div className="task-endat">
          📅 {new Date(card.endAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default DnDCard;
