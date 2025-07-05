import React from "react";
import { useParams } from "react-router-dom";
import TaskManager from "../modules/task-manager/TaskManager";
import { useSelector } from "react-redux";
import { Banner, WorkspaceMenu } from "@components";

const Workspace = () => {
  const { id: workspaceId } = useParams();
  const mode = useSelector((state) => state.theme.mode);

  return (
    <div
      className={`workspace-page ${mode === "dark" ? "dark" : "light"}`}
      style={{ display: "flex" }}
    >
      {/* CONTENU PRINCIPAL */}
      <div
        style={{
          flexGrow: 1,
          transition: "margin-left 0.3s",
          position: "relative",
        }}
      >
        <Banner workspaceId={workspaceId} />
        <TaskManager workspaceId={workspaceId} />

        {/* WORKSPACE MENU EN BAS A DROITE */}
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 1000 }}>
          <WorkspaceMenu />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
