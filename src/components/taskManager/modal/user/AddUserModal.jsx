import React, { useState } from "react";
import { TaskApi, ApiService } from "@service";
import "./addUserModal.css";
import { BaseModal } from "@components";
import { useTranslation } from "react-i18next";

const AddUserModal = ({ workspaceId, onClose }) => {
  const { t } = useTranslation("workspace");
  const [pseudo, setPseudo] = useState("");
  const [state, setState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await ApiService.getUserByPseudo(pseudo);

      if (!data || !Array.isArray(data) || !data[0]?.id) {
        setError(t("workspace.userNotFound"));
        setLoading(false);
        return;
      }

      const idUser = data[0].id;

      const result = await TaskApi.addWorkspaceUser(workspaceId, [{ idUser, state }]);
      if (!result || (result.status && result.status !== 200)) {
        throw new Error(t("workspace.serverError"));
      }

      window.dispatchEvent(
        new CustomEvent("workspaceUpdated", {
          detail: { id: workspaceId, updatedFields: {} }
        })
      );

      setSuccess(t("workspace.userAddSuccess"));
      setPseudo("");
      setState(0);
    } catch (err) {
      console.error(err);
      setError(err.message || t("workspace.userAddFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className="tmedit">
      <button className="tm-close-btn" onClick={onClose} aria-label={t("close")} />
      <h2>{t("workspace.addUserTitle")}</h2>

      <label className="tm-label">
        {t("workspace.userPseudoLabel")}
        <div className="tm-label-field">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
        </div>
      </label>

      <label className="tm-label">
        {t("workspace.userRoleLabel")}
        <div className="tm-label-field">
          <select
            value={state}
            onChange={(e) => setState(parseInt(e.target.value, 10))}
          >
            <option value={0}>{t("workspace.roleReader")}</option>
            <option value={1}>{t("workspace.roleEditor")}</option>
          </select>
        </div>
      </label>

      {error && <p className="tm-error">{error}</p>}
      {success && <p className="tm-success">{success}</p>}

      <div className="tm-modal-buttons">
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? t("workspace.addingUser") : t("add")}
        </button>
        <button className="cancel-btn" onClick={onClose}>
          {t("cancel")}
        </button>
      </div>
    </BaseModal>
  );
};

export default AddUserModal;
