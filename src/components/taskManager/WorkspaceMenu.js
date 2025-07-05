import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { TaskApi } from "@service";
import "./WorkspaceMenu.css";

const WorkspaceMenu = ({ onCreate, setCurrentWorkspace }) => {
  const mode = useSelector((state) => state.theme.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const containerRef = useRef(null);

  const toggleMenu = () => setOpen((prev) => !prev);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await TaskApi.getWorkspaces();
        const wsArray = Object.entries(data).map(([id, ws]) => ({ id, ...ws }));
        setWorkspaces(wsArray);

        const pathParts = location.pathname.split("/");
        const currentId = pathParts[pathParts.indexOf("workspace") + 1];
        const exists = wsArray.find(ws => ws.id === currentId);

        if (exists) {
          localStorage.setItem("lastWorkspace", currentId);
          setCurrentWorkspace?.(exists);
        } else if (wsArray.length > 0) {
          localStorage.setItem("lastWorkspace", wsArray[0].id);
          navigate(`/workspace/${wsArray[0].id}`);
          setCurrentWorkspace?.(wsArray[0]);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, [navigate, location, setCurrentWorkspace]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`tmw-menu-container ${mode} ${open ? "open" : ""}`}>
      <button
        className={`tmw-toggle ${open ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span className="tmw-icon">≡</span>
        <span className="tmw-label">Workspace</span>
      </button>

      <div className="tmw-list">
        <div className="tmw-workspaces">
          {workspaces.map((ws) => (
            <NavLink
              key={ws.id}
              to={`/workspace/${ws.id}`}
              className="tmw-item"
              onClick={() => {
                localStorage.setItem("lastWorkspace", ws.id);
                setCurrentWorkspace?.(ws);
              }}
            >
              {ws.name}
            </NavLink>
          ))}
        </div>
        <button className="tmw-create-btn" onClick={onCreate}>
          + Nouveau Workspace
        </button>
      </div>
    </div>
  );
};

export default WorkspaceMenu;
