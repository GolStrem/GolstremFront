import React, { useState, useEffect } from "react";
import { TaskApi } from "@service";
import { BaseModal } from "@components";
import "./UserRightsModal.css";
import { avatar } from "@assets";
import { useTranslation } from "react-i18next";

const UserRightsModal = ({ workspaceId, onClose, onUpdate }) => {
  const { t } = useTranslation("workspace");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userStates, setUserStates] = useState([]);
  const [initialStates, setInitialStates] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
        const user = data.user.filter((u) => u.id !== data.idOwner);
        const mappedUsers = user.map((u) => ({
          ...u,
          state: u.state === "write" ? 1 : 0
        }));
        setUserStates(mappedUsers);
        setInitialStates(mappedUsers);
      } catch (err) {
        console.error(err);
        setError(t("workspace.errorLoadUsers"));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [workspaceId, t]);

  const handleChange = (userId, newState) => {
    setUserStates((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, state: newState } : u))
    );
  };

  const handleDelete = async (userId) => {
    if (saving) return;
    try {
      await TaskApi.removeWorkspaceUser(workspaceId, userId);
      setUserStates((prev) => prev.filter((u) => u.id !== userId));
      setInitialStates((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError(t("workspace.errorDeleteUser"));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updates = userStates.filter(
        (user, idx) => user.state !== initialStates[idx]?.state
      );
      await Promise.all(
        updates.map((user) =>
          TaskApi.editWorkspaceUser(workspaceId, user.id, {
            state: user.state
          })
        )
      );
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(t("workspace.errorUpdateRights"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <h3>{t("workspace.manageUserRightsTitle")}</h3>

      {loading ? (
        <p>{t("workspace.loadingUsers")}</p>
      ) : error ? (
        <p className="tm-warning-text">{error}</p>
      ) : (
        <div className="user-rights-list">
          {userStates.map((user) => (
            <div key={user.id} className="tm-label user-rights-item">
              <div className="tm-label-field">
                <img src={user.image || avatar} alt={user.pseudo} />
                <span>{user.pseudo}</span>
                <select
                  value={user.state}
                  onChange={(e) =>
                    handleChange(user.id, parseInt(e.target.value, 10))
                  }
                >
                  <option value={0}>{t("workspace.roleReader")}</option>
                  <option value={1}>{t("workspace.roleEditor")}</option>
                </select>
                <button
                  className="delete-user-btn"
                  onClick={() => handleDelete(user.id)}
                  title={t("workspace.deleteUserTitle")}
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && <p className="tm-warning-text">{error}</p>}

      <div className="tm-modal-buttons">
        <button onClick={handleSave} disabled={saving || loading}>
          {saving ? t("workspace.saving") : t("save")}
        </button>
        <button className="tm-cancel-btn" onClick={onClose}>
          {t("cancel")}
        </button>
      </div>
    </BaseModal>
  );
};

export default UserRightsModal;
