import { useState, useEffect } from "react";
import { ApiUnivers } from "@service";

export const useUniversModels = (universId) => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(null);

  const fetchModels = async () => {
    if (!universId) return;
    setIsLoading(true);
    setModelsError("");
    try {
      const res = await ApiUnivers.getListModelFiche(universId);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setModels(data);
      if (data?.length) {
        setSelectedModelId((prev) => prev ?? data[0]?.id);
      } else {
        setSelectedModelId(null);
      }
    } catch (e) {
      setModelsError("Impossible de charger les modèles");
    } finally {
      setIsLoading(false);
    }
  };

  const createModel = async (modelData) => {
    try {
      await ApiUnivers.createModelFiche(universId, modelData);
      await fetchModels();
    } catch (e) {
      throw new Error("Échec de la création du modèle");
    }
  };

  const editModel = async (modelId, modelData) => {
    try {
      await ApiUnivers.editModelFiche(universId, modelId, modelData);
      await fetchModels();
    } catch (e) {
      throw new Error("Échec de la modification du modèle");
    }
  };

  const deleteModel = async (modelId) => {
    try {
      await ApiUnivers.deleteModelFiche(universId, modelId);
      await fetchModels();
      if (selectedModelId === modelId) {
        setSelectedModelId(models.find(m => m.id !== modelId)?.id ?? null);
      }
    } catch (e) {
      throw new Error("Échec de la suppression du modèle");
    }
  };

  useEffect(() => {
    fetchModels();
  }, [universId]);

  return {
    models,
    isLoading,
    modelsError,
    selectedModelId,
    setSelectedModelId,
    createModel,
    editModel,
    deleteModel,
    refetchModels: fetchModels
  };
};
