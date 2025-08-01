import React, { useEffect, useState } from "react";
import "./DashboardManager.css";
import { ApiService, useGhostDragAndDrop } from "@service";
import { DashWorkspace, DashEvenement, DashInventaire, DashUnivers, DashNotification,DashFiche } from "@components"



const DashboardManager = ({blocks, setBlocks}) => {

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

        const draggedIndex = blocks.findIndex((b) => Number(b.id) === Number(draggedId));
        const targetIndex = blocks.findIndex((b) => Number(b.id) === Number(targetId));
        ApiService.moveModule(draggedId, targetIndex)
        if (draggedIndex === -1 || targetIndex === -1) return;

        const updated = [...blocks];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setBlocks(updated);
      },
    });

  const componentMap = {
    workspace: DashWorkspace,
    evenement: DashEvenement,
    fiche: DashFiche,
    notification: DashNotification,
    univers: DashUnivers,
    inventaire: DashInventaire,
  };
  

  return (
    <div className="parent dashboard-grid">
      {blocks.map((block, index) => {
        const Component = componentMap[block.name];
        return (
          <div
            key={block.id}
            className={`dashboard-block ${block.id}`}
            data-id={block.id}
            style={{ order: index }}
          >
            {Component ? <Component extra={block.extra} id={block.id} /> : <>{block.content}</>}
          </div>
        );
      })}
    </div>
  );

};

export default DashboardManager;