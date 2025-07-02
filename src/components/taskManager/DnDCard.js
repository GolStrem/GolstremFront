import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";
import { FaAlignLeft } from "react-icons/fa";
import "./DnDCards.css";

const DnDCard = ({ card, boardId, openViewerModal }) => {
  const mode = useSelector((state) => state.theme.mode);
  const clickStart = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    transition: { duration: 150 },
    activationConstraint: { delay: 2000, tolerance: 5 },
  });

  const handleMouseDown = () => {
    clickStart.current = Date.now();
  };

  const handleMouseUp = () => {
    const clickDuration = Date.now() - clickStart.current;
    if (clickDuration < 200) {
      openViewerModal(boardId, card);
    }
  };

  const hasCustomColor = !!card.color && card.color.toLowerCase() !== "#ffffff";
  const cardClass = `dnd-task-card ${mode} ${hasCustomColor ? "custom-color" : ""}`;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(hasCustomColor ? { backgroundColor: card.color } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={style}
      className={cardClass}
    >
      {card.image && (
        <div className="dnd-task-card-image">
          <img src={card.image} alt="aperçu" />
        </div>
      )}

      <h4 className="dnd-task-title">{card.text || card.name || "Sans titre"}</h4>

      {card.description && (
        <p className="dnd-task-description">{card.description}</p>
      )}

      <div className="dnd-task-footer">
      <div className="dnd-task-dates">
        {card.createdAt && <div> {new Date(card.createdAt).toLocaleDateString()}</div>}
        {card.endAt && <div> - {new Date(card.endAt).toLocaleDateString()}</div>}
      </div>


        {card.hasAttachment && (
          <FaAlignLeft className="dnd-attachment-icon" title="Pièce jointe" />
        )}
      </div>
    </div>
  );
};

export default DnDCard;
