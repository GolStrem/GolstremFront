import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workspaces"));
      setWorkspaces(Array.isArray(saved) && saved.length > 0 ? saved : ["Default"]);
    } catch {
      setWorkspaces(["Default"]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

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
    navigate(`/workspace/${trimmed}`);
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

    // Transfert des boards ou création d’un tableau vide
    const oldBoards = localStorage.getItem(`boards_${oldName}`);
    localStorage.setItem(
      `boards_${trimmed}`,
      oldBoards && oldBoards !== "null"
        ? oldBoards
        : JSON.stringify([
            {
              id: Date.now(),
              title: "Nouveau tableau",
              cards: [],
            },
          ])
    );

    localStorage.removeItem(`boards_${oldName}`);
    navigate(`/workspace/${trimmed}`);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const updated = workspaces.filter((w) => w !== name);

      if (updated.length === 0) {
        updated.push("Default");
        localStorage.setItem(
          "boards_Default",
          JSON.stringify([
            {
              id: Date.now(),
              title: "Nouveau tableau",
              cards: [],
            },
          ])
        );
        localStorage.setItem("lastWorkspace", "Default");
        navigate(`/workspace/Default`);
      } else if (window.location.pathname.includes(name)) {
        navigate(`/workspace/${updated[0]}`);
        localStorage.setItem("lastWorkspace", updated[0]);
      }

      setWorkspaces(updated);
      localStorage.removeItem(`boards_${name}`);
    }
  };

  return (
    <aside className={`tm-sidebar ${mode === "dark" ? "dark" : "light"}`}>
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
              <div
                style={{ display: "flex", alignItems: "center" }}
                className={`tm-nav-div ${mode === "dark" ? "dark" : "light"}`}
              >
                <NavLink
                  to={`/workspace/${ws}`}
                  className={`tm-nav-btn ${mode === "dark" ? "dark" : "light"}`}
                  style={{ flexGrow: 1 }}
                  title={ws}
                >
                  {ws}
                </NavLink>
                <button
                  onClick={() => {
                    setEditing(ws);
                    setEditValue(ws);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(ws)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ffaaaa",
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                >
                  🗑️
                </button>
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
        <button onClick={handleAddWorkspace} className="tm-add-btn">
          + Ajouter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
