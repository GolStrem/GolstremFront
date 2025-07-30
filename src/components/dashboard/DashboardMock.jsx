import React, { useEffect, useState } from "react";
import "./DashboardMock.css";
import useGhostDragAndDropDashboard from "./hook/useGhostDragAndDropDashboard";

const initialBlocks = [
  { id: "div1", content: "Bannière" },
  { id: "div2", content: "Workspace" },
  { id: "div3", content: "Cartes" },
  { id: "div4", content: "Bloc droit haut" },
  { id: "div5", content: "Bloc droit bas" },
  { id: "div6", content: "Notifications" },
  { id: "div7", content: "Section basse" },
];

const DashboardMock = () => {
  const [blocks, setBlocks] = useState(initialBlocks);

  const handleDrag = ({ draggedId, targetId }) => {
    const draggedIndex = blocks.findIndex((b) => b.id === draggedId);
    const targetIndex = blocks.findIndex((b) => b.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
  };

  const { onMouseDown } = useGhostDragAndDropDashboard(handleDrag);

  return (
    <div className="parent dashboard-grid">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={`dashboard-block ${block.id}`}
          data-id={block.id}
          onMouseDown={onMouseDown}
        >
          {block.content}
        </div>
      ))}
    </div>
  );
};

export default DashboardMock;
