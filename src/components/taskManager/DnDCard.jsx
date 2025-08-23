import React, { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useIcon } from "../../utils/iconImports";
import "./DnDCards.css";
import { useTranslation } from "react-i18next";

const DnDCard = ({ card, boardId, openViewerModal }) => {
  const { t } = useTranslation("workspace");

  const clickStart = useRef(null);
  const cardRef = useRef(null);

  // Utilisation optimisée des icônes
  const { Icon: AlignLeftIcon } = useIcon('AlignLeft');

  const { attributes, listeners, setNodeRef } = useSortable({
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
      window.dispatchEvent(new Event("resize"));
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const hasCustomColor =
    !!card.color && String(card.color).toLowerCase() !== "#ffffff";

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
      className="dnd-task-card"
    >
      {card.image && (
        <div className="dnd-task-card-image">
          <img src={card.image} alt={t("workspace.previewAlt")} />
        </div>
      )}

      <h4 className="dnd-task-title">
        {card.text || card.name || t("workspace.untitled")}
      </h4>

      {card.description && (
        <p className="dnd-task-description">{card.description}</p>
      )}

      <div className="dnd-task-footer">
        <div className="dnd-task-dates">
          {card.createdAt && (
            <div>{new Date(card.createdAt).toLocaleDateString()}</div>
          )}
          {card.endAt && (
            <div> - {new Date(card.endAt).toLocaleDateString()}</div>
          )}
        </div>

        {card.hasAttachment && (
          AlignLeftIcon && <AlignLeftIcon
            className="dnd-attachment-icon"
            title={t("workspace.attachmentAlt")}
          />
        )}

        {hasCustomColor && (
          <div
            className="dnd-color-dot"
            style={{ backgroundColor: card.color }}
            title={t("workspace.cardColorAlt")}
          />
        )}
      </div>
    </div>
  );
};

export default DnDCard;
