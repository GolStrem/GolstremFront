import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalGeneric } from "@components";

const ModelModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {}, 
  title, 
  isLoading = false,
  error = ""
}) => {
  const { t } = useTranslation("univers");
  const [createModelError, setCreateModelError] = useState(error);

  const handleSubmit = async (values) => {
    setCreateModelError("");
    const nm = values?.name?.trim?.() ?? "";
    if (!nm) {
      setCreateModelError("Le nom du modèle est requis");
      return;
    }
    try {
      await onSubmit({
        name: nm,
        description: values?.description ?? "",
        image: values?.image ?? "",
      });
      onClose();
    } catch (e) {
      setCreateModelError("Échec de la création du modèle");
    }
  };

  if (!isOpen) return null;

  return (
    <ModalGeneric
      onClose={onClose}
      handleSubmit={handleSubmit}
      initialData={initialData}
      fields={{
        name: { type: "inputText", label: t("model.name") },
        description: { type: "textarea", label: t("model.description") },
        image: { type: "inputUrl", label: t("model.image") },
      }}
      title={title}
    />
  );
};

export default ModelModal;
