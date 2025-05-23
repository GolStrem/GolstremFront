import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Charger les workspaces au démarrage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("workspaces")) || ["default"];
    setWorkspaces(saved);
  }, []);

  // Sauvegarder les workspaces à chaque mise à jour
  useEffect(() => {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  // Ajouter un nouveau workspace
  const handleAddWorkspace = () => {
    const trimmed = newName.trim();
    if (!trimmed || workspaces.includes(trimmed)) return;
    const updated = [...workspaces, trimmed];
    setWorkspaces(updated);
    setNewName("");
    navigate(`/workspace/${trimmed}`);
  };

  // Gérer la mise à jour du nom
  const handleRename = (oldName, newName) => {
    const updated = workspaces.map((w) => (w === oldName ? newName : w));
    setWorkspaces(updated);
    setEditing(null);
    localStorage.setItem(`boards_${newName}`, localStorage.getItem(`boards_${oldName}`));
    localStorage.removeItem(`boards_${oldName}`);
    navigate(`/workspace/${newName}`);
  };

  // Supprimer un workspace
 const handleDelete = (name) => {
  if (window.confirm(`Supprimer "${name}" ?`)) {
    const updated = workspaces.filter((w) => w !== name);

    // Si tout est supprimé, recréer un workspace "default"
    if (updated.length === 0) {
      updated.push("default");
      localStorage.setItem("boards_default", JSON.stringify([]));
      localStorage.setItem("lastWorkspace", "default");
      navigate(`/workspace/default`);
    } else if (window.location.pathname.includes(name)) {
      // Redirige si le workspace supprimé est le courant
      navigate(`/workspace/${updated[0]}`);
      localStorage.setItem("lastWorkspace", updated[0]);
    }

    setWorkspaces(updated);
    localStorage.removeItem(`boards_${name}`);
  }
};


  return (
    <aside className="tm-sidebar">
      <h2 className="sidebarMenu">Menu</h2>
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
            <div style={{ display: "flex", alignItems: "center" }}>
              <NavLink
                to={`/workspace/${ws}`}
                className="tm-nav-btn"
                style={{ flexGrow: 1 }}
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

      <div className="sidebarAddTabl">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouveau workspace"
          className="tm-sidebar-input"
        />
        <button onClick={handleAddWorkspace} className="tm-add-btn">
          ➕ Ajouter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
