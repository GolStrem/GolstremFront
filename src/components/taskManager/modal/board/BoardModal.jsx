import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "@components";

const BoardModal = ({ closeModal, handleCreateBoard }) => {
  const { t } = useTranslation("workspace"); // workspace pour le contenu spécifique


  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");

  const handleSubmit = () => {
    if (title.trim()) {
      handleCreateBoard({ name: title.trim(), color });
      closeModal();
    }
  };

  return (
    <BaseModal onClose={closeModal} className="tmedit">


      <h3>{t("workspace.createBoardTitle")}</h3>

      <label>
        {t("workspace.boardNameLabel")}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label>
        {t("workspace.boardColorLabel")}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>

      <div className="tm-modal-buttons">
        <button onClick={handleSubmit}>{t("create")}</button>
        <button onClick={closeModal}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default BoardModal;
