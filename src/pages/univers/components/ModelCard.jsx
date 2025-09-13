import React from "react";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTrash } from "react-icons/fa";

const ModelCard = ({ 
  model, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  isBusy 
}) => {
  const { t } = useTranslation("univers");

  return (
    <div
      className={`UniModel-card ${isSelected ? "active" : ""}`}
      onClick={() => onSelect(model.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { 
        if (e.key === 'Enter' || e.key === ' ') { 
          onSelect(model.id); 
        } 
      }}
    >
      {model.image ? (
        <img className="UniModel-cardImg" src={model.image} alt={model.name} />
      ) : (
        <div className="UniModel-cardImg placeholder" />
      )}
      <div className="UniModel-cardBody">
        <div className="UniModel-cardTitle">{model.name}</div>
        {model.description ? (
          <div className="UniModel-cardDesc">{model.description}</div>
        ) : null}
      </div>
      <div className="UniModel-cardActions">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="UniModel-iconBtn"
            title={t('tooltips.editModel')}
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(model); 
            }}
            disabled={isBusy}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="UniModel-iconBtn UniModel-danger"
            title={t('tooltips.deleteModel')}
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(model); 
            }}
            disabled={isBusy}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
