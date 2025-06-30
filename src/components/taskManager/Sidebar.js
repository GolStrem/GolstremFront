import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useSelector } from "react-redux";
import { DeleteWorkspaceModal } from "@components";

const Sidebar = () => {
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode);

  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("workspaces"));
    setWorkspaces(Array.isArray(saved) && saved.length > 0 ? saved : ["Default"]);
  }, []);

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tm-ws-menu-wrapper")) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidName = (name) => {
    const trimmed = name.trim();
    return trimmed.length > 0 && !trimmed.includes("\\");
  };

  const handleAddWorkspace = () => {
    const trimmed = newName.trim();
    if (!isValidName(trimmed)) {
      alert("Nom invalide. Il doit être non vide et ne pas contenir de \\.");
      return;
    }
    if (workspaces.includes(trimmed)) return;
    const updated = [...workspaces, trimmed];
    setWorkspaces(updated);
    setNewName("");
    navigate(`/workspace/${encodeURIComponent(trimmed)}`);
  };

  const handleRename = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!isValidName(trimmed)) {
      alert("Nom invalide. Il doit être non vide et ne pas contenir de \\.");
      return;
    }
    const updated = workspaces.map((w) => (w === oldName ? trimmed : w));
    setWorkspaces(updated);
    setEditing(null);
    const oldBoards = localStorage.getItem(`boards_${oldName}`);
    localStorage.setItem(
      `boards_${trimmed}`,
      oldBoards && oldBoards !== "null"
        ? oldBoards
        : JSON.stringify([{ id: Date.now(), title: "Nouveau tableau", cards: [] }])
    );
    localStorage.removeItem(`boards_${oldName}`);
    navigate(`/workspace/${encodeURIComponent(trimmed)}`);
  };

  const handleDelete = (name) => {
    setWorkspaceToDelete(name);
    setShowDeleteModal(true);
    setMenuOpen(null);
  };

  const confirmDelete = () => {
    const name = workspaceToDelete;
    const updated = workspaces.filter((w) => w !== name);

    if (updated.length === 0) {
      updated.push("Default");
      localStorage.setItem("boards_Default", JSON.stringify([{ id: Date.now(), title: "Nouveau tableau", cards: [] }]));
      localStorage.setItem("lastWorkspace", "Default");
      navigate(`/workspace/Default`);
    } else if (window.location.pathname.includes(name)) {
      navigate(`/workspace/${encodeURIComponent(updated[0])}`);
      localStorage.setItem("lastWorkspace", updated[0]);
    }

    setWorkspaces(updated);
    localStorage.removeItem(`boards_${name}`);
    setShowDeleteModal(false);
  };

  return (
    <aside className={`tm-sidebar ${mode}`}>
      <h2 className="sidebarMenu">Menu</h2>

      <div className="tm-sidebar-scrollable">
        {workspaces.map((ws) => (
          <div key={ws} style={{ width: "100%" }}>
            {editing === ws ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRename(ws, editValue);
                }}
              >
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ width: "100%", marginBottom: "5px" }}
                />
              </form>
            ) : (
              <div className={`tm-nav-div ${mode}`}>
                <NavLink
                  to={`/workspace/${encodeURIComponent(ws)}`}
                  className={`tm-nav-btn ${mode}`}
                  style={{ flexGrow: 1 }}
                  title={ws}
                >
                  {ws}
                </NavLink>

                <div className="tm-ws-menu-wrapper">
                  <button
                    className={`tm-ws-menu-btn ${mode}`}
                    onClick={() => setMenuOpen(menuOpen === ws ? null : ws)}
                  >
                    ⋯
                  </button>

                  {menuOpen === ws && (
                    <div className={`tm-ws-menu ${mode}`}>
                      <button onClick={() => {
                        setEditing(ws);
                        setEditValue(ws);
                        setMenuOpen(null);
                      }}>✏️ Modifier</button>

                      <button onClick={() => handleDelete(ws)}>🗑️ Supprimer</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebarAddTabl">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouveau workspace"
          className="tm-sidebar-input"
        />
        <button onClick={handleAddWorkspace} className="tm-add-btn">+ Ajouter</button>
      </div>

      {showDeleteModal && (
        <DeleteWorkspaceModal
          name={workspaceToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </aside>
  );
};

export default Sidebar;
