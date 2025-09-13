import React, { useEffect, useState } from "react";
import { BackLocation, ModalGeneric, BaseModal } from "@components";
import { useParams } from "react-router-dom";
import { ApiUnivers } from "@service";
import "./UniversCardModelFiche.css";
import { useTranslation } from "react-i18next";

// Hooks personnalisés
import { useUniversModels, useUniversRules } from "../hooks";

// Composants
import { ModelCard, RulesTable, RuleForm, EditRuleModal, ModelModal } from "../components";

const UniversCardModelFiche = () => {
  const { t } = useTranslation("univers");
  const { id: universId } = useParams();
  const [universName, setUniversName] = useState("Univers");

  // Hooks personnalisés
  const {
    models,
    isLoading: modelsLoading,
    modelsError,
    selectedModelId,
    setSelectedModelId,
    createModel,
    editModel,
    deleteModel
  } = useUniversModels(universId);

  const {
    rules,
    rulesError,
    rulesLoading,
    createRule,
    editRule,
    deleteRule
  } = useUniversRules(universId, selectedModelId);

  // États pour les modales
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rule, setRule] = useState("role");
  const [error, setError] = useState("");

  // États pour l'édition des modèles
  const [editModelOpen, setEditModelOpen] = useState(false);
  const [modelEditing, setModelEditing] = useState(null);
  const [deleteModelOpen, setDeleteModelOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // États pour l'édition des règles
  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [ruleEditing, setRuleEditing] = useState(null);
  const [deleteRuleOpen, setDeleteRuleOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // Récupération du nom de l'univers
  useEffect(() => {
    const fetchName = async () => {
      try {
        if (!universId) return;
        const res = await ApiUnivers.getDetailUnivers(universId);
        setUniversName(res?.data?.name || "Univers");
      } catch (e) {
        setUniversName("Univers");
      }
    };
    fetchName();
  }, [universId]);

  const selectedModelName = models.find((m) => m.id === selectedModelId)?.name || "";

  // Gestionnaires d'événements pour les modèles
  const handleCreateModel = async (modelData) => {
    try {
      await createModel(modelData);
      setIsCreateModelOpen(false);
    } catch (e) {
      throw e;
    }
  };

  const handleEditModel = async (modelData) => {
    try {
      setBusyId(modelEditing.id);
      await editModel(modelEditing.id, modelData);
      setEditModelOpen(false);
      setModelEditing(null);
      } catch (e) {
      // Gestion d'erreur silencieuse
      } finally {
      setBusyId(null);
    }
  };

  const handleDeleteModel = async () => {
    try {
      setBusyId(modelToDelete.id);
      await deleteModel(modelToDelete.id);
      setDeleteModelOpen(false);
      setModelToDelete(null);
      } catch (e) {
      // Gestion d'erreur silencieuse
      } finally {
      setBusyId(null);
    }
  };

  // Gestionnaires d'événements pour les règles
  const handleCreateRule = async (ruleData) => {
    try {
      // Vérifier l'unicité pour les règles role et moduleMandatory
      if (ruleData.rule === "role" || ruleData.rule === "moduleMandatory") {
        const existing = rules.find((r) => r.rule === ruleData.rule);
        if (existing) {
          await editRule(existing.id, ruleData);
          setIsFormOpen(false);
          setRule("role");
          return;
        }
      }
      
      await createRule(ruleData);
      setIsFormOpen(false);
      setRule("role");
    } catch (e) {
      setError("feedback.createRuleFailed");
    }
  };

  const handleEditRule = async (ruleData) => {
    try {
      await editRule(ruleEditing.id, ruleData);
      setEditRuleOpen(false);
      setRuleEditing(null);
    } catch (e) {
      // Gestion d'erreur silencieuse
    }
  };

  const handleDeleteRule = async () => {
    try {
      await deleteRule(ruleToDelete.id);
      setDeleteRuleOpen(false);
      setRuleToDelete(null);
    } catch (e) {
      // Gestion d'erreur silencieuse
    }
  };

  return (
    <div className="UniModel-container">
      <BackLocation />
      <div className="UniModel-header">
        <h1 className="UniModel-h1">{t("title", { name: universName })}</h1>
        <p className="UniModel-subtitle">{t("subtitle")}</p>
      </div>

      {/* Modal de création de modèle */}
      <ModelModal
        isOpen={isCreateModelOpen}
          onClose={() => setIsCreateModelOpen(false)}
        onSubmit={handleCreateModel}
          title={t("titles.createModel")}
        />

      {/* Liste des modèles */}
      <div className="UniModel-list">
        <div className="UniModel-listHeader">
          <h2 className="UniModel-h2">{t("modelsList", { count: models?.length || 0 })}</h2>
        </div>
        {modelsLoading && <div>{t("loading")}</div>}
        {modelsError && <div className="UniModel-error">{t(modelsError, modelsError)}</div>}
        {!modelsLoading && !modelsError && (
          <>
            <div className="UniModel-cards">
              {/* Carte de création */}
              <div
                className="UniModel-card uniCard-create"
                role="button"
                tabIndex={0}
                onClick={() => setIsCreateModelOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsCreateModelOpen(true); }}
              >
                <div className="UniModel-cardImg placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800 }}>+</div>
                <div className="UniModel-cardBody">
                  <div className="UniModel-cardTitle">{t("createModel")}</div>
                  <div className="UniModel-cardDesc">{t("subtitle")}</div>
                </div>
              </div>
              
              {/* Cartes des modèles */}
              {models.map((m) => (
                <ModelCard
                    key={`card-${m.id}`}
                  model={m}
                  isSelected={selectedModelId === m.id}
                  onSelect={setSelectedModelId}
                  onEdit={(model) => { setModelEditing(model); setEditModelOpen(true); }}
                  onDelete={(model) => { setModelToDelete(model); setDeleteModelOpen(true); }}
                  isBusy={busyId === m.id}
                />
                ))}
            </div>
          </>
        )}
      </div>

      {/* Liste des règles */}
      <div className="UniModel-list">
        <div className="UniModel-listHeader">
          <h2 className="UniModel-h2">{t("rulesTitle")}</h2>
        </div>
        {selectedModelId === null && <div>{t("selectModelFirst")}</div>}
        {selectedModelId !== null && (
          <>
            {rulesLoading && <div>{t("loading")}</div>}
            {rulesError && <div className="UniModel-error">{t(rulesError, rulesError)}</div>}
            {!rulesLoading && !rulesError && (
              <div className="UniModel-rules">
                <RulesTable
                  rules={rules}
                  onEditRule={(rule) => { setRuleEditing(rule); setEditRuleOpen(true); }}
                  onDeleteRule={(rule) => { setRuleToDelete(rule); setDeleteRuleOpen(true); }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bouton de création de règle */}
      <div className="UniModel-actions">
        <button
          type="button"
          className="UniModel-btn"
          onClick={() => setIsFormOpen(true)}
          disabled={selectedModelId === null}
        >
          {t("createRule")}
        </button>
      </div>

      {/* Modal de création de règle */}
      {isFormOpen && (
        <BaseModal onClose={() => setIsFormOpen(false)} className={`tmedit cf-modal-large master-create-rule`}>
          <h2>{t("createRule")}</h2>
          <RuleForm
            rule={rule}
            setRule={setRule}
            onSubmit={handleCreateRule}
            onCancel={() => setIsFormOpen(false)}
            selectedModelName={selectedModelName}
            error={error}
            setError={setError}
          />
        </BaseModal>
      )}

      {/* Modales d'édition de modèle */}
      {editModelOpen && modelEditing && (
        <ModelModal
          isOpen={editModelOpen}
          onClose={() => { setEditModelOpen(false); setModelEditing(null); }}
          onSubmit={handleEditModel}
          initialData={{ 
            name: modelEditing.name || "", 
            description: modelEditing.description || "", 
            image: modelEditing.image || "" 
          }}
          title={t("titles.editModel", { name: modelEditing.name || "" })}
        />
      )}

      {deleteModelOpen && modelToDelete && (
        <ModalGeneric
          onClose={() => { setDeleteModelOpen(false); setModelToDelete(null); }}
          handleSubmit={handleDeleteModel}
          initialData={{}}
          fields={{}}
          title={t("titles.deleteModel", { name: modelToDelete.name || "" })}
        />
      )}

      {/* Modales d'édition de règle */}
      <EditRuleModal
        ruleEditing={ruleEditing}
          onClose={() => { setEditRuleOpen(false); setRuleEditing(null); }}
        onSubmit={handleEditRule}
      />

      {deleteRuleOpen && ruleToDelete && (
        <ModalGeneric
          onClose={() => { setDeleteRuleOpen(false); setRuleToDelete(null); }}
          handleSubmit={handleDeleteRule}
          initialData={{}}
          fields={{}}
          title={t("titles.deleteRule", { type: t(`rule.name.${ruleToDelete.rule}`) })}
        />
      )}
    </div>
  );
};

export default UniversCardModelFiche;