import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const MODULES = [
  {
    key: "general",
    label: "Général",
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

const RuleForm = ({ 
  rule, 
  setRule, 
  onSubmit, 
  onCancel, 
  selectedModelName,
  error,
  setError 
}) => {
  const { t } = useTranslation("univers");
  
  // État pour les différents types de règles
  const [roleValue, setRoleValue] = useState(0);
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [sizeModule, setSizeModule] = useState("");
  const [sizeElement, setSizeElement] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");

  const handleSubmit = async () => {
    setError("");
    
    let payload = { target: "default", rule: rule, value: "" };
    
    if (rule === "role") {
      payload.value = String(roleValue);
    } else if (rule === "moduleMandatory") {
      const mods = Array.from(selectedModules);
      if (mods.length === 0) {
        setError("feedback.selectAtLeastOneModule");
        return;
      }
      payload.value = mods.join(", ");
      payload.target = "default";
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
      if (minNum != null && Number.isNaN(minNum)) { 
        setError("feedback.sizeMinNumber"); 
        return; 
      }
      if (maxNum != null && Number.isNaN(maxNum)) { 
        setError("feedback.sizeMaxNumber"); 
        return; 
      }
      const val = {};
      if (minNum != null) val[">"] = minNum;
      if (maxNum != null) val["<"] = maxNum;
      payload.value = JSON.stringify(val);
      payload.target = sizeElement ? `${sizeModule}.${sizeElement}` : sizeModule;
    }

    await onSubmit(payload);
  };

  return (
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
                  {t(m.key)}
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
                <option key={m.key} value={m.key}>{t(m.key)}</option>
              ))}
            </select>
          </div>
          <div className="UniModel-field">
            <label className="UniModel-label">{t("rule.size_element")}</label>
            <select className="UniModel-input" value={sizeElement} onChange={(e) => setSizeElement(e.target.value)} disabled={!sizeModule || (MODULES.find(x => x.key === sizeModule)?.elements?.length ?? 0) === 0}>
              <option value="">{t("phrases.noneWholeModule")}</option>
              {MODULES.find((m) => m.key === sizeModule)?.elements?.map((el) => (
                <option key={el} value={el}>{t(el)}</option>
              ))}
            </select>
          </div>
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
        <button className="UniModel-btn" onClick={onCancel}>Annuler</button>
        <button type="button" className="UniModel-btn primary" onClick={handleSubmit}>
          {t("rule.save")}
        </button>
      </div>
    </div>
  );
};

export default RuleForm;
