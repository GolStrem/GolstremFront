import React, { useEffect, useState } from "react";
import "./DashboardMock.css";
import { ApiService, useGhostDragAndDrop } from "@service";

const initialBlocks = [
  { id: "div1", content: "Bannière" },
  { id: "div2", content: "Workspace" },
  { id: "div3", content: "Cartes" },
  { id: "div4", content: "Bloc droit haut" },
  { id: "div5", content: "Bloc droit bas" },
  { id: "div6", content: "Notifications" },
  { id: "div7", content: "Section basse" },
  { id: "div8", content: "Section baba" },
  { id: "div9", content: "Section bedou" },
];

const DashboardMock = () => {
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    const fetchModules = async () => {
      const id = localStorage.getItem("id");
      if (id) {
        try {
          const result = await ApiService.getModule(0, id);
          if (Array.isArray(result?.data)) {
            setBlocks(result.data);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des modules :", err);
        }
      }
    };

    fetchModules();
  }, []);

  useGhostDragAndDrop({
    dragSelector: ".dashboard-block",
    onMouseUpCallback: ({ draggedElement, event }) => {
      const dropTarget = event.target.closest(".dashboard-block");
      if (!dropTarget || dropTarget === draggedElement) return;

      const draggedId = draggedElement.dataset.id;
      const targetId = dropTarget.dataset.id;

      const draggedIndex = blocks.findIndex((b) => b.id === draggedId);
      const targetIndex = blocks.findIndex((b) => b.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const updated = [...blocks];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      setBlocks(updated);
    },
  });

  return (
    <div className="parent dashboard-grid">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className={`dashboard-block ${block.id}`}
          data-id={block.id}
          style={{ order: index }}
        >
          {block.content}
        </div>
      ))}
    </div>
  );
};

export default DashboardMock;
