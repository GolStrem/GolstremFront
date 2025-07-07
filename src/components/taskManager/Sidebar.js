import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { TaskApi, UserInfo } from "@service";
import { DeleteWorkspaceModal } from "@components";
import "./Sidebar.css";

const Sidebar = ({ modalRef }) => {
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode);
  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const { workspaceId } = useParams();


  useEffect(() => {
  const fetchWorkspaces = async () => {
    try {
      const { data } = await TaskApi.getWorkspaces();

      const workspacesArray = Object.entries(data).map(([id, ws]) => ({
        id,
        ...ws,
      }));

      setWorkspaces(workspacesArray);
    } catch (err) {
      console.error("Erreur lors du chargement des workspaces :", err);
    }
  };

  fetchWorkspaces();
}, []); // 👈 pas besoin de [navigate]


useEffect(() => {
  if (workspaceId) {
    UserInfo.set("lastWorkspace", workspaceId)
  }
}, [workspaceId]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      const inMenu = e.target.closest(".tm-ws-menu-wrapper");
      const inModal = modalRef?.current?.contains(e.target);

      if (!inMenu && !inModal) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef]);

  const handleAddWorkspace = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      alert("Le nom du workspace est requis.");
      return;
    }
    try {
      const payload = { name: trimmed };
      const { data } = await TaskApi.createWorkspace(payload);

      const [id, ws] = Object.entries(data)[0];

      setWorkspaces((prev) => [...prev, { id, ...ws }]);
      setNewName("");
      navigate(`/workspace/${id}`);
    } catch (err) {
      console.error("Erreur lors de la création du workspace :", err);
    }
  };

  const handleRename = async (workspaceId, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      alert("Le nom ne peut pas être vide.");
      return;
    }
    try {
      await TaskApi.updateWorkspace(workspaceId, { name: trimmed });
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspaceId ? { ...w, name: trimmed } : w))
      );
      setEditing(null);
    } catch (err) {
      console.error("Erreur lors du renommage du workspace :", err);
    }
  };

  const handleDelete = (workspace) => {
    setWorkspaceToDelete(workspace);
    setShowDeleteModal(true);
    setMenuOpen(null);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;
    try {
      await TaskApi.deleteWorkspace(workspaceToDelete.id);

      const updated = workspaces.filter((w) => w.id !== workspaceToDelete.id);
      setWorkspaces(updated);
      setShowDeleteModal(false);

      if (window.location.pathname.includes(workspaceToDelete.id)) {
        const fallbackId = updated[0]?.id;
        navigate(`/workspace/${fallbackId || ""}`);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  return (
    <aside className={`tm-sidebar ${mode}`}>
      <h2 className="sidebarMenu">Menu</h2>

      <div className="tm-sidebar-scrollable">
        {workspaces.map((ws) => (
          <div key={ws.id} style={{ width: "100%" }}>
            {editing === ws.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRename(ws.id, editValue);
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
                  to={`/workspace/${ws.id}`}
                  className={`tm-nav-btn ${mode}`}
                  style={{ flexGrow: 1 }}
                  title={ws.name}
                >
                  {ws.name}
                </NavLink>

                <div className="tm-ws-menu-wrapper">
                  <button
                    className={`tm-ws-menu-btn ${mode}`}
                    onClick={() => setMenuOpen(menuOpen === ws.id ? null : ws.id)}
                  >
                    ⋯
                  </button>

                  {menuOpen === ws.id && (
                    <div className={`tm-ws-menu ${mode}`}>
                      <button
                        onClick={() => {
                          setEditing(ws.id);
                          setEditValue(ws.name);
                          setMenuOpen(null);
                        }}
                      >
                        ✏️ Modifier
                      </button>
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
        <button onClick={handleAddWorkspace} className="tm-add-btn">
          + Ajouter
        </button>
      </div>

      {showDeleteModal && (
        <DeleteWorkspaceModal
          name={workspaceToDelete?.name}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          modalRef={modalRef}
        />
      )}
    </aside>
  );
};
export default Sidebar;