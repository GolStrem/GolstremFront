import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import TaskManager from "../modules/task-manager/TaskManager";
import { useSelector } from "react-redux";
import { Banner, Sidebar } from "@components";

const Workspace = () => {
  const { id: workspaceId } = useParams();
  const mode = useSelector((state) => state.theme.mode);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  // 👇 Clic en dehors : fermer le sidebar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarVisible]);

  return (
    <div className={`workspace-page ${mode === "dark" ? "dark" : "light"}`} style={{ display: "flex" }}>
      {/* BOUTON HAMBURGER */}
      <button
        ref={hamburgerRef}
        className={`hamburger-btn ${mode === "dark" ? "dark" : "light"}`}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{
          position: "fixed",
          top: "16px",
          left: sidebarVisible ? "300px" : "0",
          zIndex: 1000,
        }}
      >
        ☰
      </button>

      {/* SIDEBAR AVEC REF */}
      {sidebarVisible && <div ref={sidebarRef}><Sidebar /></div>}

      {/* CONTENU PRINCIPAL */}
      <div style={{ flexGrow: 1, marginLeft: sidebarVisible ? "300px" : "0", transition: "margin-left 0.3s" }}>
        <Banner workspaceId={workspaceId} />
        <TaskManager workspaceId={workspaceId} />
      </div>
    </div>
  );
};

export default Workspace;
