// src/components/taskManager/DnDBoard.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DnDCard from "./DnDCard";

const DnDBoard = ({ board, openViewerModal }) => {
  const { setNodeRef } = useDroppable({ id: board.id });

  return (
    <div
      ref={setNodeRef}
      className="tm-board"
      style={{
        background: "#f5f5f5",
        padding: 12,
        borderRadius: 8,
        minHeight: 100,
      }}
    >
      <SortableContext items={board.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {board.cards.length > 0 ? (
          board.cards.map((card) => (
            <DnDCard
              key={card.id}
              card={card}
              boardId={board.id}
              openViewerModal={openViewerModal}
            />
          ))
        ) : (
          <div className="tm-empty-board-placeholder">
            Déposez une carte ici
          </div>
        )}
      </SortableContext>
    </div>
  );
};

export default DnDBoard;
