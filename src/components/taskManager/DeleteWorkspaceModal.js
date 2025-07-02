import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import TaskManager from "../../modules/task-manager/TaskManager.js";
import { useSelector } from "react-redux";
import { Banner, Sidebar } from "@components";

const Workspace = () => {
  const { id: workspaceId } = useParams();
  const mode = useSelector((state) => state.theme.mode);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const modalRef = useRef(null); // ✅ ref pour la modale

  // ✅ Clic en dehors : ferme la sidebar SAUF si la modale est ouverte
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedSidebar = sidebarRef.current?.contains(e.target);
      const clickedHamburger = hamburgerRef.current?.contains(e.target);
      const clickedModal = modalRef.current?.contains(e.target);

      if (sidebarVisible && !clickedSidebar && !clickedHamburger && !clickedModal) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarVisible]);

  return (
    <div className={`workspace-page ${mode === "dark" ? "dark" : "light"}`} style={{ display: "flex" }}>
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

      {sidebarVisible && <div ref={sidebarRef}><Sidebar modalRef={modalRef} /></div>}

      <div style={{ flexGrow: 1, marginLeft: sidebarVisible ? "300px" : "0", transition: "margin-left 0.3s" }}>
        <Banner workspaceId={workspaceId} />
        <TaskManager
          workspaceId={workspaceId}
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
      </div>
    </div>
  );
};

export default Workspace;
