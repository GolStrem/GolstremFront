import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "@components";

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

const EditRuleModal = ({ 
  ruleEditing, 
  onClose, 
  onSubmit 
}) => {
  const { t } = useTranslation("univers");
  const [editSelectedModules, setEditSelectedModules] = useState(new Set());
  const [editSizeMin, setEditSizeMin] = useState("");
  const [editSizeMax, setEditSizeMax] = useState("");
  const [editSizeError, setEditSizeError] = useState("");

  useEffect(() => {
    if (ruleEditing && ruleEditing.rule === "moduleMandatory") {
      try {
        const raw = String(ruleEditing.value || "");
        const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
        setEditSelectedModules(new Set(arr));
      } catch {
        setEditSelectedModules(new Set());
      }
    }
    if (ruleEditing && ruleEditing.rule === "size") {
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
  }, [ruleEditing]);

  const handleSubmit = async () => {
    if (ruleEditing.rule === "moduleMandatory") {
      const filtered = MODULES.map((m) => m.key).filter((k) => editSelectedModules.has(k));
      const next = filtered.join(", ");
      await onSubmit({ target: "default", rule: ruleEditing.rule, value: next });
    } else if (ruleEditing.rule === "size") {
      const minNum = editSizeMin === "" ? undefined : Number(editSizeMin);
      const maxNum = editSizeMax === "" ? undefined : Number(editSizeMax);
      if (minNum === undefined && maxNum === undefined) {
        setEditSizeError("feedback.sizeMinMaxRequired");
        return;
      }
      if (minNum !== undefined && Number.isNaN(minNum)) { 
        setEditSizeError("feedback.sizeMinNumber"); 
        return; 
      }
      if (maxNum !== undefined && Number.isNaN(maxNum)) { 
        setEditSizeError("feedback.sizeMaxNumber"); 
        return; 
      }
      const val = {};
      if (minNum !== undefined) val[">"] = minNum;
      if (maxNum !== undefined) val["<"] = maxNum;
      await onSubmit({ target: ruleEditing.target, rule: ruleEditing.rule, value: JSON.stringify(val) });
    }
  };

  if (!ruleEditing) return null;

  return (
    <BaseModal onClose={onClose} className="tmedit cf-modal-large master-edit-rule">
      <h2>{t("titles.editRule", { type: t(`rule.name.${ruleEditing.rule}`) })}</h2>
      <div className="UniModel-form">
        {ruleEditing.rule === "moduleMandatory" && (
          <>
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
                      {t(m.key)}
                    </button>
                  );
                })}
              </div>
            </div>
            {Array.from(editSelectedModules).length === 0 && (
              <div className="UniModel-error">{t("feedback.selectAtLeastOneModule")}</div>
            )}
          </>
        )}

        {ruleEditing.rule === "size" && (
          <>
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
          </>
        )}

        <div className="UniModel-actions">
          <button className="UniModel-btn" onClick={onClose}>{t("cancel", "Annuler")}</button>
          <button
            type="button"
            className="UniModel-btn primary"
            disabled={ruleEditing.rule === "moduleMandatory" && Array.from(editSelectedModules).length === 0}
            onClick={handleSubmit}
          >
            {t("rule.save")}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default EditRuleModal;
