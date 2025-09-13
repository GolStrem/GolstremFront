import React from "react";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTrash } from "react-icons/fa";

const RulesTable = ({ 
  rules, 
  onEditRule, 
  onDeleteRule 
}) => {
  const { t } = useTranslation("univers");

  const formatRuleValue = (rule) => {
    let prettyValue = String(rule.value);
    
    if (rule.rule === "size") {
      try {
        const obj = typeof rule.value === "string" ? JSON.parse(rule.value) : rule.value;
        const min = obj?.[">"];
        const max = obj?.["<"];
        if (min != null && max != null) prettyValue = t("phrases.between", { min, max });
        else if (min != null) prettyValue = t("phrases.atLeast", { min });
        else if (max != null) prettyValue = t("phrases.atMost", { max });
      } catch {}
    } else if (rule.rule === "role") {
      const roleNum = Number(rule.value);
      const roleLabelMap = {
        0: t('rule.role_0'),
        1: t('rule.role_1'),
        2: t('rule.role_2'),
        3: t('rule.role_3')
      };
      prettyValue = roleLabelMap[roleNum] ?? String(rule.value);
    } else if (rule.rule === "moduleMandatory") {
      const mods = String(rule.value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((k) => t(k));
      prettyValue = mods.join(", ");
    }
    
    return prettyValue;
  };

  const formatTarget = (target) => {
    if (target === 'default') return '';
    return t(target.split('.')[0]) + (target.includes('.') ? '.' + target.split('.').slice(1).map(el => t(el)).join('.') : '');
  };

  const formatRuleType = (rule) => {
    if (rule === 'moduleMandatory') return t('rule.name.modules');
    if (rule === 'role') return t('rule.name.role');
    return t('rule.name.size');
  };

  if (!rules?.length) {
    return <div>{t("noRules")}</div>;
  }

  return (
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
        {rules.map((r) => (
          <tr key={r.id}>
            <td>{formatTarget(r.target)}</td>
            <td>{formatRuleType(r.rule)}</td>
            <td>{formatRuleValue(r)}</td>
            <td>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="UniModel-iconBtn"
                  title={t('tooltips.editRule')}
                  onClick={() => onEditRule(r)}
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  className="UniModel-iconBtn UniModel-danger"
                  title={t('tooltips.deleteRule')}
                  onClick={() => onDeleteRule(r)}
                >
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RulesTable;
