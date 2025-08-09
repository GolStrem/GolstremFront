import React from "react";
import { BaseModal } from "@components";
import { useTranslation } from "react-i18next";

const DeleteWorkspaceModal = ({ name, onConfirm, onCancel }) => {
  const { t } = useTranslation("workspace");

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <h3>{t("workspace.deleteWorkspaceTitle")}</h3>
      <p>
        {t("workspace.deleteWorkspaceQuestion")} <strong>« {name} »</strong> ?
      </p>

      <p className="tm-warning-text">⚠️ {t("workspace.deleteWorkspaceWarning")}</p>

      <div className="tm-modal-buttons">
        <button className="tm-danger" onClick={onConfirm}>
          {t("delete")}
        </button>
        <button onClick={onCancel}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default DeleteWorkspaceModal;
