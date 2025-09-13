import { useState, useEffect } from "react";
import { ApiUnivers } from "@service";

export const useUniversRules = (universId, selectedModelId) => {
  const [rules, setRules] = useState([]);
  const [rulesError, setRulesError] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);

  const fetchRules = async () => {
    if (!universId || selectedModelId === null) {
      setRules([]);
      return;
    }
    setRulesLoading(true);
    setRulesError("");
    try {
      const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setRules(data);
    } catch (e) {
      setRulesError("Impossible de charger les règles du modèle");
    } finally {
      setRulesLoading(false);
    }
  };

  const createRule = async (ruleData) => {
    try {
      await ApiUnivers.createRuleFiche(universId, selectedModelId, ruleData);
      await fetchRules();
    } catch (e) {
      throw new Error("Échec de la création de la règle");
    }
  };

  const editRule = async (ruleId, ruleData) => {
    try {
      await ApiUnivers.editRuleFiche(universId, selectedModelId, ruleId, ruleData);
      await fetchRules();
    } catch (e) {
      throw new Error("Échec de la modification de la règle");
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      await ApiUnivers.deleteRuleFiche(universId, selectedModelId, ruleId);
      await fetchRules();
    } catch (e) {
      throw new Error("Échec de la suppression de la règle");
    }
  };

  useEffect(() => {
    fetchRules();
  }, [universId, selectedModelId]);

  return {
    rules,
    rulesError,
    rulesLoading,
    createRule,
    editRule,
    deleteRule,
    refetchRules: fetchRules
  };
};
