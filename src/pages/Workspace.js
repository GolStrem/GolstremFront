import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskManager from "../modules/task-manager/TaskManager";
import { useSelector } from "react-redux";

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem("workspaces"));

    if (!saved || !Array.isArray(saved)) {
      saved = [];
    }

    if (!id) {
      // Aucun ID dans l'URL → redirige vers le premier workspace ou crée un nouveau
      if (saved.length > 0) {
        navigate(`/workspace/${saved[0]}`);
      } else {
        const defaultId = "Default";
        saved.push(defaultId);
        localStorage.setItem("workspaces", JSON.stringify(saved));
        localStorage.setItem("boards_Default", JSON.stringify([]));
        navigate(`/workspace/${defaultId}`);
      }
      return;
    }

    if (!saved.includes(id)) {
      // L'ID n'existe pas dans la liste → redirige vers le premier existant ou crée un nouveau
      if (saved.length > 0) {
        navigate(`/workspace/${saved[0]}`);
      } else {
        const defaultId = "Default";
        saved.push(defaultId);
        localStorage.setItem("workspaces", JSON.stringify(saved));
        localStorage.setItem("boards_Default", JSON.stringify([]));
        navigate(`/workspace/${defaultId}`);
      }
      return;
    }

    // L'ID est valide
    setIsValid(true);
  }, [id, navigate]);

  if (!isValid) return null;

  return (
    <div className={`workspace-page ${mode === "dark" ? "dark" : "light"}`}>
      <TaskManager workspaceId={id} />
    </div>
  );
};

export default Workspace;
