import React, { useState } from "react";
import { isValidImageUrl } from "@service";
import { BaseModal } from "@components";
import { useTranslation } from "react-i18next";

const CreateWorkspaceModal = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation("workspace");

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    if (!trimmed.image) {
      trimmed.image = null;
    }

    onConfirm(trimmed);
  };

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <h3>{t("workspace.createWorkspaceTitle")}</h3>

      <div className="tm-modal-form">
        <label>
          {t("workspace.taskNameLabel")}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("workspace.workspaceNamePlaceholder")}
          />
        </label>

        <label>
          {t("workspace.taskDescriptionLabel")}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t("workspace.workspaceDescriptionPlaceholder")}
          />
        </label>

        <label>
          {t("workspace.taskImageLabel")}
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder={t("workspace.workspaceImagePlaceholder")}
          />
        </label>
      </div>

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit}>
          {t("create")}
        </button>
        <button onClick={onCancel}>{t("cancel")}</button>
      </div>
    </BaseModal>
  );
};

export default CreateWorkspaceModal;
