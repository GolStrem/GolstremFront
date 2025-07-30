import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { TaskApi, UserInfo, Socket } from "@service";
import { DeleteWorkspaceModal, ModifWorkspaceModal, CreateWorkspaceModal, UserRightsModal } from "@components";
import "./WorkspaceMenu.css";
import "./modal/taskModal.css";



const WorkspaceMenu = ({ setCurrentWorkspace }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [userId, setUserId] = useState(null);

  const [showUserRightsModal, setShowUserRightsModal] = useState(false);


  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await UserInfo.getId();
        setUserId(id);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'id utilisateur :", err);
      }
    };

    fetchUserId();
  }, []);  


  const toggleMenu = () => setOpen((prev) => !prev);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const { data } = await TaskApi.getWorkspaces();
      const wsArray = Object.entries(data).map(([id, ws]) => ({ id, ...ws }));
      setWorkspaces(wsArray);

      const pathParts = location.pathname.split("/");
      const currentId = pathParts[pathParts.indexOf("workspace") + 1];
      const currentWs = wsArray.find(ws => ws.id === currentId);

      if (currentWs) {
        localStorage.setItem("lastWorkspace", currentId);
        setCurrentWorkspace?.(currentWs);
      } else if (wsArray.length > 0) {
        localStorage.setItem("lastWorkspace", wsArray[0].id);
        navigate(`/workspace/${wsArray[0].id}`);
        setCurrentWorkspace?.(wsArray[0]);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des workspaces:", err);
    }
  }, [location.pathname, navigate, setCurrentWorkspace]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!workspaces.length) return;

    // S'abonner à tous les canaux
    workspaces.forEach(ws => {
      Socket.subscribe(`workSpaceOnly-${ws.id}`);
    });

    // Nettoyage : se désabonner de tous les canaux
    return () => {
      workspaces.forEach(ws => {
        Socket.unsubscribe(`workSpaceOnly-${ws.id}`);
      });
    };
  }, [workspaces]);

  useEffect(() => {
    const handleUpdateWorkspace = (data) => {
      if (!data?.id) return;

      setWorkspaces(prev =>
        prev.map(ws =>
          ws.id === data.id
            ? {
                ...ws,
                name: data.name ?? ws.name,
                image: data.image ?? ws.image,
              }
            : ws
        )
      );
    };

    Socket.onMessage("updateWorkspace", handleUpdateWorkspace);

    return () => {
      Socket.offMessage?.("updateWorkspace", handleUpdateWorkspace);
    };
  }, []);

  const handleDelete = (ws) => {
    setWorkspaceToDelete(ws);
    setShowDeleteModal(true);
    setMenuOpenFor(null);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;
    try {
      await TaskApi.deleteWorkspace(workspaceToDelete.id);
      const updated = workspaces.filter(w => w.id !== workspaceToDelete.id);
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

const confirmEdit = async (form) => {
  try {
    const payload = { ...form };

    // Si l'image est vide, ne la passe pas à l'API
    if (!payload.image.trim()) {
      delete payload.image;
    }

    await TaskApi.updateWorkspace(workspaceToEdit.id, payload);

    // informe la bannière
    window.dispatchEvent(
      new CustomEvent("workspaceUpdated", {
        detail: {
          id: workspaceToEdit.id,
          updatedFields: {
            ...payload,
            image: payload.image || null, // pour le front
          },
        },
      })
    );

    await fetchWorkspaces(); // pour mettre à jour la liste
    setShowEditModal(false);
  } catch (err) {
    console.error("Erreur lors de la modification :", err);
  }
};



  const confirmCreate = async (form) => {
  try {
    await TaskApi.createWorkspace(form);
    await fetchWorkspaces();
    setShowCreateModal(false);
  } catch (err) {
    console.error("Erreur lors de la création :", err);
  }
};


  return (
    <div
      ref={containerRef}
      className={`tmw-menu-container  ${open ? "open" : ""}`}
    >
      <button
        className={`tmw-toggle  ${open ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span className="tmw-icon">≡</span>
        <span className="tmw-label">Workspace</span>
      </button>

      {open && (
        <div className= {`tmw-list`}
        >
          <div className="tmw-workspaces">
            {workspaces.map(ws => (
            <div key={ws.id} className="tmw-item-container">
              <NavLink
                to={`/workspace/${ws.id}`}
                className="tmw-item"
                onClick={() => {
                  localStorage.setItem("lastWorkspace", ws.id);
                  setCurrentWorkspace?.(ws);
                  setMenuOpenFor(null);
                }}
              >
                {ws.name}
              </NavLink>
              {String(userId) === String(ws.idOwner) ? (
                <button
                  className="tmw-item-menu-btn"
                  onClick={() =>
                    setMenuOpenFor(menuOpenFor === ws.id ? null : ws.id)
                  }
                >
                  ⋯
                </button>
              ) : (
                <button
                  className="tmw-item-quit-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await TaskApi.removeWorkspaceUser(ws.id, userId);
                      const updated = workspaces.filter(w => w.id !== ws.id);
                      setWorkspaces(updated);

                      // Si on était sur ce workspace
                      if (window.location.pathname.includes(ws.id)) {
                        const fallbackId = updated[0]?.id;
                        navigate(`/workspace/${fallbackId || ""}`);
                      }
                    } catch (err) {
                      console.error("Erreur lors de la sortie du workspace :", err);
                    }
                  }}
                  title="Quitter le workspace"
                >
                  ×
                </button>
              )}

              {menuOpenFor === ws.id && (
                <div className="tmw-item-menu">
                  <button
                    onClick={() => {
                      setWorkspaceToEdit(ws);
                      setShowEditModal(true);
                      setMenuOpenFor(null);
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button 
                    onClick={() => 
                    handleDelete(ws)}>
                      🗑️ Supprimer
                  </button>
                  
                  <button
                    onClick={() => {
                      setWorkspaceToEdit(ws);
                      setShowEditModal(false);
                      setShowUserRightsModal(true);
                    }}
                  >
                    👥 Utilisateurs
                  </button>

                </div>
              )}

              {/* Image de fond */}
              {ws.image && (
                <img
                  src={ws.image}
                  alt=""
                  className="tmw-item-bg"
                />
              )}

            </div>

            ))}
          </div>
          <button
            className="tmw-create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Nouveau Workspace
          </button>
        </div>
      )}

      {showDeleteModal && (
        <DeleteWorkspaceModal
          name={workspaceToDelete?.name}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showEditModal && (
        <ModifWorkspaceModal
          workspace={workspaceToEdit}
          onConfirm={confirmEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateWorkspaceModal
          onConfirm={confirmCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showUserRightsModal && (
        <UserRightsModal
          workspaceId={workspaceToEdit.id}
          onClose={() => setShowUserRightsModal(false)}
          onUpdate={fetchWorkspaces}
        />
      )}

    </div>
  );
};

export default WorkspaceMenu;
