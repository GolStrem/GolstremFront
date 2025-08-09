import React, { useState, useEffect } from "react";
import "./TaskEditorModal.css";
import { BoardCardAccess, BaseModal } from "@components";
import { isValidImageUrl } from "@service";
import { useTranslation } from "react-i18next";

const TaskEditorModal = ({ modalData, closeModal, handleCreateOrUpdateCard, handleDeleteCard }) => {
  const { t } = useTranslation("workspace");
  const isEdit = !!modalData.cardId;

  const [formData, setFormData] = useState({
    boardId: null,
    cardId: null,
    name: "",
    description: "",
    color: "#ffffff",
    state: 0,
    endAt: "",
    createdAt: new Date().toISOString().split("T")[0],
    image: ""
  });

  const [isEditing, setIsEditing] = useState(isEdit);

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    image: ""
  });

  useEffect(() => {
    const editing = !modalData.cardId || isEdit;
    setIsEditing(editing);

    if (modalData.card) {
      setFormData({
        boardId: modalData.boardId || null,
        cardId: modalData.cardId || null,
        name: modalData.card.name || "",
        description: modalData.card.description || "",
        color: modalData.card.color || "#ffffff",
        state: modalData.card.state ?? 0,
        endAt: modalData.card.endAt || "",
        createdAt:
          modalData.card.createdAt || new Date().toISOString().split("T")[0],
        image: modalData.card.image || ""
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        boardId: modalData.boardId || null,
        cardId: null,
        name: "",
        description: "",
        color: "#ffffff",
        state: 0,
        endAt: "",
        createdAt: new Date().toISOString().split("T")[0],
        image: ""
      }));
    }

    setErrors({ name: "", description: "", image: "" });
  }, [modalData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "state" ? parseInt(value, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleSubmit = () => {
    const { name, description, endAt, createdAt, image } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = t("workspace.cardNameRequired");
    if (!description.trim())
      newErrors.description = t("workspace.cardDescriptionRequired");
    if (image && !isValidImageUrl(image))
      newErrors.image = t("workspace.cardImageInvalid");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sanitizedData = {
      ...formData,
      name: name.trim(),
      description: description.trim(),
      endAt: endAt || null,
      createdAt: createdAt || new Date().toISOString().split("T")[0]
    };

    handleCreateOrUpdateCard(
      formData.boardId,
      formData.cardId,
      sanitizedData
    );
    closeModal();
  };

  const handleDelete = () => {
    if (formData.cardId) {
      handleDeleteCard(formData.boardId, formData.cardId);
      closeModal();
    }
  };

  return (
    <BaseModal onClose={closeModal} className="tmedit">
      <button className="tm-close-btn" onClick={closeModal} aria-label={t("close")} />

      {isEdit && !isEditing && (
        <button className="tm-edit-btn" onClick={() => setIsEditing(true)}>
          ✏️ {t("workspace.editTask")}
        </button>
      )}

      <h3>
        {isEdit
          ? isEditing
            ? t("workspace.updateTaskTitle")
            : t("workspace.taskDetailTitle")
          : t("workspace.createTaskTitle")}
      </h3>

      <label className="tm-label">
        {t("workspace.taskNameLabel")}
        <div className="tm-label-field">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className={errors.name ? "tm-input-error" : ""}
          />
        </div>
        {errors.name && <p className="tm-error-text">{errors.name}</p>}
      </label>

      <label className="tm-label">
        {t("workspace.taskDescriptionLabel")}
        <div className="tm-label-field">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!isEditing}
            className={errors.description ? "tm-input-error" : ""}
          />
        </div>
        {errors.description && (
          <p className="tm-error-text">{errors.description}</p>
        )}
      </label>

      <div className="tm-color-state-fields">
        <label className="tm-label tm-color-picker">
          {t("workspace.taskColorLabel")}
          <div className="tm-label-field">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </label>

        <label className="tm-label tm-state-select">
          {t("workspace.taskStateLabel")}
          <div className="tm-label-field">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value={0}>{t("workspace.stateTodo")}</option>
              <option value={1}>{t("workspace.stateInProgress")}</option>
              <option value={2}>{t("workspace.stateDone")}</option>
              <option value={3}>{t("workspace.statePending")}</option>
            </select>
          </div>
        </label>
      </div>

      <div className="tm-date-fields">
        <label className="tm-label">
          {t("workspace.taskDueDateLabel")}
          <div className="tm-label-field">
            <input
              type="date"
              name="endAt"
              value={formData.endAt}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </label>
      </div>

      <label className="tm-label">
        {t("workspace.taskImageLabel")}
        <div className="tm-label-field">
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            disabled={!isEditing}
            className={errors.image ? "tm-input-error" : ""}
          />
        </div>
        {errors.image && <p className="tm-error-text">{errors.image}</p>}
      </label>

      <div className="tm-modal-buttons">
        <button onClick={handleSubmit}>
          {isEdit ? t("validate") : t("create")}
        </button>

        {BoardCardAccess.isOwner(modalData.card?.droit) &&
          isEdit &&
          isEditing && (
            <button className="tm-delete-btn" onClick={handleDelete}>
              {t("delete")}
            </button>
          )}

        <button className="tm-cancel-btn" onClick={closeModal}>
          {t("cancel")}
        </button>
      </div>
    </BaseModal>
  );
};

export default TaskEditorModal;
