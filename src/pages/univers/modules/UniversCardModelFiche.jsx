import React, { useEffect, useState } from "react";
import { BackLocation, ModalGeneric, BaseModal } from "@components";
import { useParams } from "react-router-dom";
import { ApiUnivers } from "@service";
import "./UniversCardModelFiche.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const UniversCardModelFiche = () => {
  const { t } = useTranslation("univers");
  const { t: tc } = useTranslation("common");
  const { id: universId } = useParams();
  const [universName, setUniversName] = useState("Univers");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [modelsError, setModelsError] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelImage, setModelImage] = useState("");
  const [createModelError, setCreateModelError] = useState("");
  const [createModelLoading, setCreateModelLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rule, setRule] = useState("role");
  // role
  const [roleValue, setRoleValue] = useState(0);
  // Modules & éléments alignés avec CreateFiche.jsx
  const MODULES = [
    {
      key: "general",
      label: "Général",
      // champs textuels susceptibles d'avoir des règles de taille
      elements: ["age", "about"],
    },
    {
      key: "character",
      label: "Caractère",
      elements: ["personalité", "peur", "motivation"],
    },
    {
      key: "story",
      label: "Histoire",

    },
    {
      key: "power",
      label: "Pouvoir",

    },
    {
      key: "gallery",
      label: "Galerie",

    },
  ];
  const [selectedModules, setSelectedModules] = useState(new Set());
  // size
  const [sizeModule, setSizeModule] = useState("");
  const [sizeElement, setSizeElement] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [error, setError] = useState("");
  const [rules, setRules] = useState([]);
  const [rulesError, setRulesError] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Modals state
  const [editModelOpen, setEditModelOpen] = useState(false);
  const [modelEditing, setModelEditing] = useState(null);
  const [deleteModelOpen, setDeleteModelOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [ruleEditing, setRuleEditing] = useState(null);
  const [deleteRuleOpen, setDeleteRuleOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [editSelectedModules, setEditSelectedModules] = useState(new Set());
  const [editSizeMin, setEditSizeMin] = useState("");
  const [editSizeMax, setEditSizeMax] = useState("");
  const [editSizeError, setEditSizeError] = useState("");

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

  useEffect(() => {
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
          setRules([]);
        }
      } catch (e) {
        setModelsError("Impossible de charger les modèles");
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, [universId]);

  useEffect(() => {
    const fetchRules = async () => {
      if (!universId || selectedModelId == null) {
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
    fetchRules();
  }, [universId, selectedModelId]);

  const selectedModelName = models.find((m) => m.id === selectedModelId)?.name || "";

  useEffect(() => {
    if (editRuleOpen && ruleEditing && ruleEditing.rule === "moduleMandatory") {
      try {
        const raw = String(ruleEditing.value || "");
        const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
        setEditSelectedModules(new Set(arr));
      } catch {
        setEditSelectedModules(new Set());
      }
    }
    if (editRuleOpen && ruleEditing && ruleEditing.rule === "size") {
      try {
        const obj = typeof ruleEditing.value === "string" ? JSON.parse(ruleEditing.value) : ruleEditing.value;
        setEditSizeMin(obj?.[">"] ?? "");
        setEditSizeMax(obj?.["<"] ?? "");
        setEditSizeError("");
      } catch {
        setEditSizeMin("");
        setEditSizeMax("");
        setEditSizeError("");
      }
    }
  }, [editRuleOpen, ruleEditing]);

  return (
    <div className="UniModel-container">
      <BackLocation />
      <div className="UniModel-header">
        <h1 className="UniModel-h1">{t("title", { name: universName })}</h1>
        <p className="UniModel-subtitle">{t("subtitle")}</p>
      </div>

      {/* Create model card will be shown inside the models grid below */}

      {isCreateModelOpen && (
        <ModalGeneric
          onClose={() => setIsCreateModelOpen(false)}
          handleSubmit={async (values) => {
            setCreateModelError("");
            const nm = values?.name?.trim?.() ?? "";
            if (!nm) {
              setCreateModelError("Le nom du modèle est requis");
              return;
            }
            try {
              setCreateModelLoading(true);
              await ApiUnivers.createModelFiche(universId, {
                name: nm,
                description: values?.description ?? "",
                image: values?.image ?? "",
              });
              const res = await ApiUnivers.getListModelFiche(universId);
              const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
              setModels(data);
              if (data?.length) setSelectedModelId(data[0]?.id);
              setModelName("");
              setModelDescription("");
              setModelImage("");
              setIsCreateModelOpen(false);
            } catch (e) {
              setCreateModelError("Échec de la création du modèle");
            } finally {
              setCreateModelLoading(false);
            }
          }}
          initialData={{ name: modelName, description: modelDescription, image: modelImage }}
          fields={{
            name: { type: "inputText", label: t("model.name") },
            description: { type: "textarea", label: t("model.description") },
            image: { type: "inputUrl", label: t("model.image") },
          }}
          title={t("titles.createModel")}
        />
      )}

      <div className="UniModel-list">
        <div className="UniModel-listHeader">
          <h2 className="UniModel-h2">{t("modelsList", { count: models?.length || 0 })}</h2>
        </div>
        {isLoading && <div>{tc("loading")}</div>}
        {modelsError && <div className="UniModel-error">{t(modelsError, modelsError)}</div>}
        {!isLoading && !modelsError && (
          <>
            <div className="UniModel-cards">
              {/* Create model card (not counted) */}
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
              {models.map((m) => (
                  <div
                    key={`card-${m.id}`}
                    className={`UniModel-card ${selectedModelId === m.id ? "active" : ""}`}
                    onClick={() => setSelectedModelId(m.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedModelId(m.id); } }}
                  >
                    {m.image ? (
                      <img className="UniModel-cardImg" src={m.image} alt={m.name} />
                    ) : (
                      <div className="UniModel-cardImg placeholder" />
                    )}
                    <div className="UniModel-cardBody">
                      <div className="UniModel-cardTitle">{m.name}</div>
                      {m.description ? (
                        <div className="UniModel-cardDesc">{m.description}</div>
                      ) : null}
                    </div>
                    <div className="UniModel-cardActions">
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="UniModel-iconBtn"
                          title={t('tooltips.editModel')}
                          onClick={(e) => { e.stopPropagation(); setModelEditing(m); setEditModelOpen(true); }}
                          disabled={busyId === m.id}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="UniModel-iconBtn UniModel-danger"
                          title={t('tooltips.deleteModel')}
                          onClick={(e) => { e.stopPropagation(); setModelToDelete(m); setDeleteModelOpen(true); }}
                          disabled={busyId === m.id}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div className="UniModel-list">
        <div className="UniModel-listHeader">
          <h2 className="UniModel-h2">{t("rulesTitle")}</h2>
        </div>
        {selectedModelId == null && <div>{t("selectModelFirst")}</div>}
        {selectedModelId && (
          <>
            {rulesLoading && <div>{tc("loading")}</div>}
            {rulesError && <div className="UniModel-error">{t(rulesError, rulesError)}</div>}
            {!rulesLoading && !rulesError && (
              <div className="UniModel-rules">
                {rules?.length ? (
                  <table className="UniModel-table">
                    <thead>
                      <tr>
                        <th>{t("table.target")}</th>
                        <th>{t("table.type")}</th>
                        <th>{t("table.condition")}</th>
                        <th>{t("table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((r) => {
                        let prettyValue = String(r.value);
                        if (r.rule === "size") {
                          try {
                            const obj = typeof r.value === "string" ? JSON.parse(r.value) : r.value;
                            const min = obj?.[">"];
                            const max = obj?.["<"];
                            if (min != null && max != null) prettyValue = t("phrases.between", { min, max });
                            else if (min != null) prettyValue = t("phrases.atLeast", { min });
                            else if (max != null) prettyValue = t("phrases.atMost", { max });
                          } catch {}
                        } else if (r.rule === "role") {
                          const roleNum = Number(r.value);
                          const roleLabelMap = {
                            0: t('rule.role_0'),
                            1: t('rule.role_1'),
                            2: t('rule.role_2'),
                            3: t('rule.role_3')
                          };
                          prettyValue = roleLabelMap[roleNum] ?? String(r.value);
                        } else if (r.rule === "moduleMandatory") {
                          // Traduire la liste de modules via common.json
                          const mods = String(r.value || "")
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((k) => tc(k));
                          prettyValue = mods.join(", ");
                        }
                        return (
                          <tr key={r.id}>
                            <td>{r.target === 'default' ? '' : tc(r.target.split('.')[0]) + (r.target.includes('.') ? '.' + r.target.split('.').slice(1).map(el => tc(el)).join('.') : '')}</td>
                            <td>{r.rule === 'moduleMandatory' ? t('rule.name.modules') : r.rule === 'role' ? t('rule.name.role') : t('rule.name.size')}</td>
                            <td>{prettyValue}</td>
                            <td>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  className="UniModel-iconBtn"
                                  title={t('tooltips.editRule')}
                                  onClick={() => { setRuleEditing(r); setEditRuleOpen(true); }}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  className="UniModel-iconBtn UniModel-danger"
                                  title={t('tooltips.deleteRule')}
                                  onClick={() => { setRuleToDelete(r); setDeleteRuleOpen(true); }}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div>{t("noRules")}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="UniModel-actions">
        <button
          type="button"
          className="UniModel-btn"
          onClick={() => setIsFormOpen(true)}
          disabled={selectedModelId == null}
        >
          {t("createRule")}
        </button>
      </div>

      {isFormOpen && (
        <BaseModal onClose={() => setIsFormOpen(false)} className={`tmedit cf-modal-large master-create-rule`}>
          <h2>{t("createRule")}</h2>
          <div className="UniModel-form">
          <div className="UniModel-field">
            <label className="UniModel-label">{t("rule.type")}</label>
            <select className="UniModel-input" value={rule} onChange={(e) => setRule(e.target.value)}>
              <option value="role">{t("rule.type_role")}</option>
              <option value="moduleMandatory">{t("rule.type_moduleMandatory", { model: selectedModelName })}</option>
              <option value="size">{t("rule.type_size")}</option>
            </select>
          </div>

          {rule === "role" && (
            <div className="UniModel-field">
              <label className="UniModel-label">{t("rule.role_label")}</label>
              <select className="UniModel-input" value={roleValue} onChange={(e) => setRoleValue(Number(e.target.value))}>
                <option value={0}>{t("rule.role_0")}</option>
                <option value={1}>{t("rule.role_1")}</option>
                <option value={2}>{t("rule.role_2")}</option>
                <option value={3}>{t("rule.role_3")}</option>
              </select>
            </div>
          )}

          {rule === "moduleMandatory" && (
            <div className="UniModel-field">
              <label className="UniModel-label">{t("rule.modules_label")}</label>
              <div className="UniModel-models">
                {MODULES.map((m) => {
                  const checked = selectedModules.has(m.key);
  return (
                    <label key={m.key} className={`UniModel-chip ${checked ? "active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedModules((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(m.key); else next.delete(m.key);
                            return next;
                          });
                        }}
                        style={{ display: "none" }}
                      />
                      {tc(m.key)}
                    </label>
                  );
                })}
              </div>
              <div className="UniModel-cardDesc" style={{ marginTop: 8 }}>{t("rule.hint_elements")}</div>
            </div>
          )}

          {rule === "size" && (
            <>
              <div className="UniModel-field">
                <label className="UniModel-label">{t("rule.size_module")}</label>
                <select className="UniModel-input" value={sizeModule} onChange={(e) => { setSizeModule(e.target.value); setSizeElement(""); }}>
                  <option value="">— Sélectionner —</option>
                  {MODULES.map((m) => (
                    <option key={m.key} value={m.key}>{tc(m.key)}</option>
                  ))}
                </select>
              </div>
              <div className="UniModel-field">
                <label className="UniModel-label">{t("rule.size_element")}</label>
                <select className="UniModel-input" value={sizeElement} onChange={(e) => setSizeElement(e.target.value)} disabled={!sizeModule || (MODULES.find(x => x.key === sizeModule)?.elements?.length ?? 0) === 0}>
                  <option value="">{t("phrases.noneWholeModule")}</option>
                  {MODULES.find((m) => m.key === sizeModule)?.elements?.map((el) => (
                    <option key={el} value={el}>{tc(el)}</option>
                  ))}
                </select>
              </div>
              {/* Aperçu Target retiré sur demande */}
              <div className="UniModel-field">
                <label className="UniModel-label">{t("rule.type_size")}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="UniModel-input" type="number" min={0} placeholder={t("rule.size_min")} value={sizeMin} onChange={(e) => setSizeMin(e.target.value)} />
                  <input className="UniModel-input" type="number" min={0} placeholder={t("rule.size_max")} value={sizeMax} onChange={(e) => setSizeMax(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {error && <div className="UniModel-error">{t(error, error)}</div>}

          <div className="UniModel-actions">
            <button className="UniModel-btn" onClick={() => setIsFormOpen(false)}>Annuler</button>
            <button
              type="button"
              className="UniModel-btn primary"
              onClick={async () => {
                setError("");
                try {
                  if (selectedModelId == null) {
                    setError("feedback.selectModelForRule");
                    return;
                  }
                  let payload = { target: "default", rule: rule, value: "" };
                  if (rule === "role") {
                    payload.value = String(roleValue);
                    // Unicité: s'il existe déjà une règle role, on la remplace
                    const existingRole = Array.isArray(rules) ? rules.find((r) => r.rule === "role") : null;
                    if (existingRole) {
                      await ApiUnivers.editRuleFiche(universId, selectedModelId, existingRole.id, {
                        target: "default",
                        rule: "role",
                        value: payload.value,
                      });
                      const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
                      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                      setRules(data);
                      setIsFormOpen(false);
                      setRule("role");
                      setRoleValue(1);
                      setSelectedModules(new Set());
                      setSizeModule("");
                      setSizeElement("");
                      setSizeMin("");
                      setSizeMax("");
                      return;
                    }
                  } else if (rule === "moduleMandatory") {
                    const mods = Array.from(selectedModules);
                    if (mods.length === 0) {
                      setError("feedback.selectAtLeastOneModule");
                      return;
                    }
                    payload.value = mods.join(", ");
                    payload.target = "default";
                    // Unicité: s'il existe déjà une règle moduleMandatory, on la remplace
                    const existing = Array.isArray(rules) ? rules.find((r) => r.rule === "moduleMandatory") : null;
                    if (existing) {
                      await ApiUnivers.editRuleFiche(universId, selectedModelId, existing.id, {
                        target: "default",
                        rule: "moduleMandatory",
                        value: payload.value,
                      });
                      const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
                      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                      setRules(data);
                      setIsFormOpen(false);
                      setRule("role");
                      setRoleValue(1);
                      setSelectedModules(new Set());
                      setSizeModule("");
                      setSizeElement("");
                      setSizeMin("");
                      setSizeMax("");
                      return;
                    }
                  } else if (rule === "size") {
                    if (!sizeModule) {
                      setError("feedback.sizeModuleRequired");
                      return;
                    }
                    const minNum = sizeMin === "" ? null : Number(sizeMin);
                    const maxNum = sizeMax === "" ? null : Number(sizeMax);
                    if (minNum == null && maxNum == null) {
                      setError("feedback.sizeMinMaxRequired");
                      return;
                    }
                    if (minNum != null && Number.isNaN(minNum)) { setError("feedback.sizeMinNumber"); return; }
                    if (maxNum != null && Number.isNaN(maxNum)) { setError("feedback.sizeMaxNumber"); return; }
                    const val = {};
                    if (minNum != null) val[">"] = minNum;
                    if (maxNum != null) val["<"] = maxNum;
                    payload.value = JSON.stringify(val);
                    payload.target = sizeElement ? `${sizeModule}.${sizeElement}` : sizeModule;
                  }

                  await ApiUnivers.createRuleFiche(universId, selectedModelId, payload);
                  const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
                  const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                  setRules(data);

                  // reset
                  setIsFormOpen(false);
                  setRule("role");
                  setRoleValue(1);
                  setSelectedModules(new Set());
                  setSizeModule("");
                  setSizeElement("");
                  setSizeMin("");
                  setSizeMax("");
                } catch (e) {
                  setError("feedback.createRuleFailed");
                }
              }}
            >
              {t("rule.save")}
            </button>
          </div>
          </div>
        </BaseModal>
      )}
      {/* Modals: Edit Model */}
      {editModelOpen && modelEditing && (
        <ModalGeneric
          onClose={() => { setEditModelOpen(false); setModelEditing(null); }}
          handleSubmit={async (updated) => {
            try {
              setBusyId(modelEditing.id);
              await ApiUnivers.editModelFiche(universId, modelEditing.id, {
                name: updated.name ?? modelEditing.name,
                description: updated.description ?? modelEditing.description,
                image: updated.image ?? modelEditing.image,
              });
              const res = await ApiUnivers.getListModelFiche(universId);
              const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
              setModels(data);
            } catch {}
            setBusyId(null);
            setEditModelOpen(false);
            setModelEditing(null);
          }}
          initialData={{ name: modelEditing.name || "", description: modelEditing.description || "", image: modelEditing.image || "" }}
          fields={{
            name: { type: "inputText", label: t("model.name") },
            description: { type: "textarea", label: t("model.description") },
            image: { type: "inputUrl", label: t("model.image") },
          }}
          title={t("titles.editModel", { name: modelEditing.name || "" })}
        />
      )}

      {/* Modals: Delete Model */}
      {deleteModelOpen && modelToDelete && (
        <ModalGeneric
          onClose={() => { setDeleteModelOpen(false); setModelToDelete(null); }}
          handleSubmit={async () => {
            try {
              setBusyId(modelToDelete.id);
              await ApiUnivers.deleteModelFiche(universId, modelToDelete.id);
              const res = await ApiUnivers.getListModelFiche(universId);
              const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
              setModels(data);
              if (selectedModelId === modelToDelete.id) {
                setSelectedModelId(data[0]?.id ?? null);
                setRules([]);
              }
            } catch {}
            setBusyId(null);
            setDeleteModelOpen(false);
            setModelToDelete(null);
          }}
          initialData={{}}
          fields={{}}
          title={t("titles.deleteModel", { name: modelToDelete.name || "" })}
        />
      )}

      {/* Modals: Edit Rule */}
      {editRuleOpen && ruleEditing && ruleEditing.rule === "moduleMandatory" && (
        <BaseModal onClose={() => { setEditRuleOpen(false); setRuleEditing(null); }} className="tmedit cf-modal-large master-edit-rule">
          <h2>{t("titles.editRule", { type: ruleEditing.rule })}</h2>
          <div className="UniModel-form">
            <div className="UniModel-field">
              <label className="UniModel-label">{t("rule.modules_label")}</label>
              <div className="UniModel-models">
                {MODULES.map((m) => {
                  const checked = editSelectedModules.has(m.key);
  return (
                    <button
                      key={`edit-mod-${m.key}`}
                      type="button"
                      className={`UniModel-chip ${checked ? "active" : ""}`}
                      onClick={() => {
                        setEditSelectedModules((prev) => {
                          const next = new Set(prev);
                          if (next.has(m.key)) next.delete(m.key); else next.add(m.key);
                          return next;
                        });
                      }}
                    >
                      {tc(m.key)}
                    </button>
                  );
                })}
              </div>
            </div>
            {Array.from(editSelectedModules).length === 0 && (
              <div className="UniModel-error">{t("feedback.selectAtLeastOneModule")}</div>
            )}
            <div className="UniModel-actions">
              <button className="UniModel-btn" onClick={() => { setEditRuleOpen(false); setRuleEditing(null); }}>{t("cancel", "Annuler")}</button>
              <button
                type="button"
                className="UniModel-btn primary"
                disabled={Array.from(editSelectedModules).length === 0}
                onClick={async () => {
                  try {
                    const filtered = MODULES.map((m) => m.key).filter((k) => editSelectedModules.has(k));
                    const next = filtered.join(", ");
                    await ApiUnivers.editRuleFiche(universId, selectedModelId, ruleEditing.id, { target: "default", rule: ruleEditing.rule, value: next });
                    const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
                    const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                    setRules(data);
                  } catch {}
                  setEditRuleOpen(false);
                  setRuleEditing(null);
                }}
              >
                {t("rule.save")}
              </button>
            </div>
          </div>
        </BaseModal>
      )}

      {editRuleOpen && ruleEditing && ruleEditing.rule === "size" && (
        <BaseModal onClose={() => { setEditRuleOpen(false); setRuleEditing(null); }} className="tmedit cf-modal-large master-edit-rule">
          <h2>{t("titles.editRule", { type: ruleEditing.rule })}</h2>
          <div className="UniModel-form">
            <div className="UniModel-field">
              <label className="UniModel-label">{t("rule.type_size")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="UniModel-input" type="number" min={0} placeholder={t("rule.size_min")} value={editSizeMin} onChange={(e) => setEditSizeMin(e.target.value)} />
                <input className="UniModel-input" type="number" min={0} placeholder={t("rule.size_max")} value={editSizeMax} onChange={(e) => setEditSizeMax(e.target.value)} />
              </div>
            </div>
            {editSizeError && (
              <div className="UniModel-error">{t(editSizeError, editSizeError)}</div>
            )}
            <div className="UniModel-actions">
              <button className="UniModel-btn" onClick={() => { setEditRuleOpen(false); setRuleEditing(null); }}>{t("cancel", "Annuler")}</button>
              <button
                type="button"
                className="UniModel-btn primary"
                onClick={async () => {
                  try {
                    const minNum = editSizeMin === "" ? undefined : Number(editSizeMin);
                    const maxNum = editSizeMax === "" ? undefined : Number(editSizeMax);
                    if (minNum === undefined && maxNum === undefined) {
                      setEditSizeError("feedback.sizeMinMaxRequired");
                      return;
                    }
                    if (minNum !== undefined && Number.isNaN(minNum)) { setEditSizeError("feedback.sizeMinNumber"); return; }
                    if (maxNum !== undefined && Number.isNaN(maxNum)) { setEditSizeError("feedback.sizeMaxNumber"); return; }
                    const val = {};
                    if (minNum !== undefined) val[">"] = minNum;
                    if (maxNum !== undefined) val["<"] = maxNum;
                    await ApiUnivers.editRuleFiche(universId, selectedModelId, ruleEditing.id, { target: ruleEditing.target, rule: ruleEditing.rule, value: JSON.stringify(val) });
                    const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
                    const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                    setRules(data);
                  } catch {}
                  setEditRuleOpen(false);
                  setRuleEditing(null);
                }}
              >
                {t("rule.save")}
              </button>
            </div>
          </div>
        </BaseModal>
      )}

      {editRuleOpen && ruleEditing && ruleEditing.rule !== "moduleMandatory" && ruleEditing.rule !== "size" && (
        <ModalGeneric
          onClose={() => { setEditRuleOpen(false); setRuleEditing(null); }}
          handleSubmit={async (updated) => {
            try {
              if (ruleEditing.rule === "moduleMandatory") {
                const arr = Array.isArray(updated.selectedModules) ? updated.selectedModules : [];
                const filtered = MODULES.map((m) => m.key).filter((k) => arr.includes(k));
                const next = filtered.join(", ");
                await ApiUnivers.editRuleFiche(universId, selectedModelId, ruleEditing.id, { target: "default", rule: ruleEditing.rule, value: next });
              } else if (ruleEditing.rule === "role") {
                const labels = [t("rule.role_0"), t("rule.role_1"), t("rule.role_2"), t("rule.role_3")];
                let next = updated.roleValue ?? String(ruleEditing.value || "1");
                if (labels.includes(updated.roleValue)) {
                  const idx = labels.indexOf(updated.roleValue);
                  next = String(idx);
                }
                await ApiUnivers.editRuleFiche(universId, selectedModelId, ruleEditing.id, { target: "default", rule: ruleEditing.rule, value: next });
              }
              const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
              const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
              setRules(data);
            } catch {}
            setEditRuleOpen(false);
            setRuleEditing(null);
          }}
          initialData={(function(){
            if (!ruleEditing) return {};
            if (ruleEditing.rule === "size") {
              try {
                const obj = typeof ruleEditing.value === "string" ? JSON.parse(ruleEditing.value) : ruleEditing.value;
                return { min: obj?.[">"] ?? "", max: obj?.["<"] ?? "" };
              } catch { return { min: "", max: "" }; }
            }
            if (ruleEditing.rule === "role") {
              const num = Number(ruleEditing.value ?? 0);
              const map = {
                0: t("rule.role_0"),
                1: t("rule.role_1"),
                2: t("rule.role_2"),
                3: t("rule.role_3"),
              };
              return { roleValue: map[num] ?? t("rule.role_0") };
            }
            if (ruleEditing.rule === "moduleMandatory") {
              const raw = String(ruleEditing.value || "");
              const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
              return { selectedModules: arr };
            }
            return { value: String(ruleEditing.value || "") };
          })()}
          fields={(function(){
            if (!ruleEditing) return {};
            if (ruleEditing.rule === "size") {
              return {
                min: { type: "inputText", label: t("rule.edit_min_label") },
                max: { type: "inputText", label: t("rule.edit_max_label") },
              };
            }
            if (ruleEditing.rule === "moduleMandatory") {
              return {
                modules: {
                  type: "checkBox",
                  list: MODULES.map((m) => m.key),
                  label: "",
                  key: "selectedModules",
                },
              };
            }
            return {
              roleValue: {
                type: "select",
                value: [t("rule.role_0"), t("rule.role_1"), t("rule.role_2"), t("rule.role_3")],
                label: t("rule.role_label"),
              },
            };
          })()}
          title={t("titles.editRule", { type: ruleEditing.rule })}
        />
      )}

      {/* Modals: Delete Rule */}
      {deleteRuleOpen && ruleToDelete && (
        <ModalGeneric
          onClose={() => { setDeleteRuleOpen(false); setRuleToDelete(null); }}
          handleSubmit={async () => {
            try {
              await ApiUnivers.deleteRuleFiche(universId, selectedModelId, ruleToDelete.id);
              const res = await ApiUnivers.getListRuleFiche(universId, selectedModelId);
              const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
              setRules(data);
            } catch {}
            setDeleteRuleOpen(false);
            setRuleToDelete(null);
          }}
          initialData={{}}
          fields={{}}
          title={t("titles.deleteRule", { type: ruleToDelete.rule })}
        />
      )}
    </div>
  );
};

export default UniversCardModelFiche;

