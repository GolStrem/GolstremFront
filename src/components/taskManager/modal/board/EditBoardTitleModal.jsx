import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { BaseModal } from "@components";

const EditBoardTitleModal = ({ currentTitle, onConfirm, onCancel }) => {
  const { t } = useTranslation("workspace");
  const [title, setTitle] = useState(currentTitle);
  const mode = useSelector((state) => state.theme.mode);

  const handleSubmit = () => {
    if (title.trim()) {
      onConfirm(title.trim());
    }
  };

  return (
    <BaseModal onClose={onCancel} className={`tmedit ${mode}`}>


      <h3>{t("workspace.renameBoardTitle")}</h3>

      <label>
        {t("workspace.newBoardNameLabel")}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className="tm-modal-buttons">
        <button onClick={handleSubmit}>{t("validate")}</button>
        <button onClick={onCancel}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default EditBoardTitleModal;
