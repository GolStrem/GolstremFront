import React from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "@components";

const DeleteBoardModal = ({ title, onConfirm, onCancel }) => {
  const { t } = useTranslation("workspace");

  return (
    <BaseModal onClose={onCancel} className="tmedit">


      <h3>{t("workspace.deleteBoardTitle")}</h3>

      <p>
        {t("workspace.deleteBoardQuestion")} <strong>« {title} »</strong> ?
      </p>

      <p className="tm-warning-text">
        ⚠️ {t("workspace.deleteBoardWarning")}
      </p>

      <div className="tm-modal-buttons">
        <button className="tm-danger" onClick={onConfirm}>
          {t("delete")}
        </button>
        <button onClick={onCancel}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default DeleteBoardModal;
