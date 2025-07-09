import React, { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";

import { useSelector } from "react-redux";
import { FaAlignLeft } from "react-icons/fa";
import "./DnDCards.css";

const DnDCard = ({ card, boardId, openViewerModal }) => {

  const mode = useSelector((state) => state.theme.mode);
  const clickStart = useRef(null);
  const cardRef = useRef(null);

  const { attributes, listeners, setNodeRef,  } = useSortable({
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

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize")); // Masonry ou layout adaptera la taille
    });

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasCustomColor = !!card.color && card.color.toLowerCase() !== "#ffffff";
  const cardClass = `dnd-task-card ${mode}`;

  

  return (
    <div
      data-id={card.id}
      draggable="true"
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      
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
          {card.createdAt && <div>{new Date(card.createdAt).toLocaleDateString()}</div>}
          {card.endAt && <div> - {new Date(card.endAt).toLocaleDateString()}</div>}
        </div>

        {card.hasAttachment && (
          <FaAlignLeft className="dnd-attachment-icon" title="Pièce jointe" />
        )}

        {hasCustomColor && (
          <div
            className="dnd-color-dot"
            style={{ backgroundColor: card.color }}
            title="Couleur de la carte"
          />
        )}
      </div>
    </div>
  );
};

export default DnDCard;
