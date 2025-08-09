import React, { useState } from "react";
import { isValidImageUrl } from "@service";
import { BaseModal } from "@components";
import { useTranslation } from "react-i18next";

const ModifWorkspaceModal = ({ workspace, onConfirm, onCancel }) => {
  const { t } = useTranslation("workspace");

  const [form, setForm] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    image: workspace?.image || ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const trimmed = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim()
    };

    if (!trimmed.name) {
      alert(t("workspace.workspaceNameRequired"));
      return;
    }

    if (trimmed.image && !isValidImageUrl(trimmed.image)) {
      alert(t("workspace.workspaceImageInvalid"));
      return;
    }

    onConfirm(trimmed);
  };

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <h3>{t("workspace.editWorkspaceTitle")}</h3>

      <div className="tm-modal-form">
        <label className="tm-modal-form-label">
          {t("workspace.taskNameLabel")}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        <label className="tm-modal-form-label">
          {t("workspace.taskDescriptionLabel")}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label className="tm-modal-form-label">
          {t("workspace.taskImageLabel")}
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="tm-modal-buttons">
        <button className="tm-confirm" onClick={handleSubmit}>
          {t("save")}
        </button>
        <button onClick={onCancel}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default ModifWorkspaceModal;
