import React, { useRef, useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { TaskApi, UserInfo, Socket } from "@service";
import {
  DeleteWorkspaceModal,
  ModifWorkspaceModal,
  CreateWorkspaceModal,
  UserRightsModal
} from "@components";
import "./WorkspaceMenu.css";
import "./modal/taskModal.css";
import { useTranslation } from "react-i18next";

const WorkspaceMenu = ({ setCurrentWorkspace }) => {
  const { t } = useTranslation("workspace");

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
        console.error(t("workspace.errorFetchUserId"), err);
      }
    };
    fetchUserId();
  }, [t]);

  const toggleMenu = () => setOpen((prev) => !prev);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const { data } = await TaskApi.getWorkspaces();
      const wsArray = Object.entries(data).map(([id, ws]) => ({ id, ...ws }));
      setWorkspaces(wsArray);

      const pathParts = location.pathname.split("/");
      const currentId = pathParts[pathParts.indexOf("workspace") + 1];
      const currentWs = wsArray.find((ws) => ws.id === currentId);

      if (currentWs) {
        localStorage.setItem("lastWorkspace", currentId);
        setCurrentWorkspace?.(currentWs);
      } else if (wsArray.length > 0) {
        localStorage.setItem("lastWorkspace", wsArray[0].id);
        navigate(`/workspace/${wsArray[0].id}`);
        setCurrentWorkspace?.(wsArray[0]);
      }
    } catch (err) {
      console.error(t("workspace.errorFetchWorkspaces"), err);
    }
  }, [location.pathname, navigate, setCurrentWorkspace, t]);

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
    Socket.subscribe(`user-${localStorage.getItem("id")}`);
    if (!workspaces.length) return;

    workspaces.forEach((ws) => {
      Socket.subscribe(`workSpaceOnly-${ws.id}`);
    });

    return () => {
      workspaces.forEach((ws) => {
        Socket.unsubscribe(`workSpaceOnly-${ws.id}`);
      });
    };
  }, [workspaces]);

  useEffect(() => {
    const handleUpdateWorkspace = (data) => {
      if (!data?.id) return;

      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === data.id
            ? {
                ...ws,
                name: data.name ?? ws.name,
                image: data.image ?? ws.image
              }
            : ws
        )
      );
    };

    const handleNewWorkspace = (data) => {
      if (!data?.id) return;

      setWorkspaces((prev) => {
        if (prev.some((ws) => ws.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    const handleDeleteWorkspace = (id) => {
      if (!id) return;
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
    };

    Socket.onMessage("updateWorkspace", handleUpdateWorkspace);
    Socket.onMessage("newWorkspace", handleNewWorkspace);
    Socket.onMessage("deleteWorkspace", handleDeleteWorkspace);

    return () => {
      Socket.offMessage?.("updateWorkspace", handleUpdateWorkspace);
      Socket.offMessage("newWorkspace", handleNewWorkspace);
      Socket.offMessage("deleteWorkspace", handleDeleteWorkspace);
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
      const updated = workspaces.filter((w) => w.id !== workspaceToDelete.id);
      setWorkspaces(updated);
      setShowDeleteModal(false);

      if (window.location.pathname.includes(workspaceToDelete.id)) {
        const fallbackId = updated[0]?.id;
        navigate(`/workspace/${fallbackId || ""}`);
      }
    } catch (err) {
      console.error(t("workspace.errorDeleteWorkspace"), err);
    }
  };

  const confirmEdit = async (form) => {
    try {
      const payload = { ...form };
      if (!payload.image?.trim()) {
        delete payload.image;
      }

      await TaskApi.updateWorkspace(workspaceToEdit.id, payload);

      window.dispatchEvent(
        new CustomEvent("workspaceUpdated", {
          detail: {
            id: workspaceToEdit.id,
            updatedFields: { ...payload, image: payload.image || null }
          }
        })
      );

      await fetchWorkspaces();
      setShowEditModal(false);
    } catch (err) {
      console.error(t("workspace.errorUpdateWorkspace"), err);
    }
  };

  const confirmCreate = async (form) => {
    try {
      await TaskApi.createWorkspace(form);
      await fetchWorkspaces();
      setShowCreateModal(false);
    } catch (err) {
      console.error(t("workspace.errorCreateWorkspace"), err);
    }
  };

  return (
    <div ref={containerRef} className={`tmw-menu-container  ${open ? "open" : ""}`}>
      <button
        className={`tmw-toggle  ${open ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label={t("workspace.toggleMenu")}
        title={t("workspace.toggleMenu")}
      >
        <span className="tmw-icon">≡</span>
        <span className="tmw-label">{t("workspace.menuTitle")}</span>
      </button>

      {open && (
        <div className="tmw-list">
          <div className="tmw-workspaces">
            {workspaces.map((ws) => (
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
                    aria-label={t("workspace.openItemMenu")}
                    title={t("workspace.openItemMenu")}
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
                        const updated = workspaces.filter((w) => w.id !== ws.id);
                        setWorkspaces(updated);

                        if (window.location.pathname.includes(ws.id)) {
                          const fallbackId = updated[0]?.id;
                          navigate(`/workspace/${fallbackId || ""}`);
                        }
                      } catch (err) {
                        console.error(t("workspace.errorLeaveWorkspace"), err);
                      }
                    }}
                    aria-label={t("workspace.leaveWorkspace")}
                    title={t("workspace.leaveWorkspace")}
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
                      ✏️ {t("workspace.menuEdit")}
                    </button>
                    <button onClick={() => handleDelete(ws)}>
                      🗑️ {t("delete")}
                    </button>
                    <button
                      onClick={() => {
                        setWorkspaceToEdit(ws);
                        setShowEditModal(false);
                        setShowUserRightsModal(true);
                      }}
                    >
                      👥 {t("workspace.menuUsers")}
                    </button>
                  </div>
                )}

                {ws.image && (
                  <img src={ws.image} alt="" className="tmw-item-bg" />
                )}
              </div>
            ))}
          </div>

          <button className="tmw-create-btn" onClick={() => setShowCreateModal(true)}>
            {t("workspace.newWorkspaceCta")}
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
