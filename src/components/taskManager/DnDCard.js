import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";
import { cadre, trombone } from "@assets";
import "./TaskCard.css";

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
  const cardClass = `task-card ${mode} ${hasCustomColor ? "custom-color" : ""}`;

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
      <h4 className="task-title">{card.text || card.name || "Sans titre"}</h4>

      {card.description && (
        <p className="task-preview">
          {card.description.slice(0, 80)}
          {card.description.length > 80 ? "…" : ""}
        </p>
      )}

      <div className="task-attachment-icon">
        {card.image ? (
          <img src={cadre} alt="Image" title="Image liée" className={`icon image-icon ${mode}`} />
        ) : card.hasAttachment ? (
          <img src={trombone} alt="Pièce jointe" title="Pièce jointe" className={`icon attachment-icon ${mode}`} />
        ) : null}
      </div>


      {card.endAt && (
        <div className="task-endat">
          📅 {new Date(card.endAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default DnDCard;
