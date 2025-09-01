import React from "react";
import { FaEye } from "react-icons/fa";
import { isValidImageUrl } from "@service";
import { useTranslation } from "react-i18next";

const ImgPlus = ({ config, values, setValues, handleChange, setPreviewSrc }) => {
    const { t } = useTranslation("modal");
    
    console.log("ImgPlus component rendered with:", { config, values });

    // Détecter combien de champs URL existent déjà
    const urlKeyBase = "inputUrl";
    const urlRegex = /^inputUrl(\d+)$/;

    const urlIndexes = Object.keys(values)
        .filter((k) => urlRegex.test(k))
        .map((k) => Number(k.replace(urlKeyBase, "")))
        .filter((n) => !Number.isNaN(n));

    const existingCount = Math.max(
        urlIndexes.length ? Math.max(...urlIndexes) + 1 : 0,
        1
    );

    const rows = Array.from({ length: existingCount }, (_, idx) => idx);

    const addRow = () => {
        // Ajoute un nouveau champ URL vide
        const nextIndex = existingCount;
        const nextUrlKey = `${urlKeyBase}${nextIndex}`;
        setValues((prev) => ({ ...prev, [nextUrlKey]: "" }));
    };

    const removeRow = (indexToRemove) => {
        if (existingCount <= 1) return; // Garder au moins un champ
        
        const urlKey = `${urlKeyBase}${indexToRemove}`;
        
        setValues((prev) => {
            const newValues = { ...prev };
            delete newValues[urlKey];
            
            const remainingUrlKeys = Object.keys(newValues)
                .filter(k => urlRegex.test(k))
                .sort((a, b) => {
                    const aIndex = Number(a.replace(urlKeyBase, ""));
                    const bIndex = Number(b.replace(urlKeyBase, ""));
                    return aIndex - bIndex;
                });
            
            // Recréer les clés avec des index séquentiels
            const reorganizedValues = {};
            Object.keys(newValues).forEach(key => {
                if (!urlRegex.test(key)) {
                    reorganizedValues[key] = newValues[key];
                }
            });
            
            remainingUrlKeys.forEach((oldKey, newIndex) => {
                const newKey = `${urlKeyBase}${newIndex}`;
                reorganizedValues[newKey] = newValues[oldKey];
            });
            
            return reorganizedValues;
        });
    };

    return (
        <div className="cf-field">
            <label className="tm-label label-fiche">{t(config?.label || "Images")}</label>
            {rows.map((idx) => {
                const urlKey = `${urlKeyBase}${idx}`;
                return (
                    <div key={idx} className="shosho" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }} >
                        {existingCount > 1 && (
                            <button 
                                type="button" 
                                className="tm-secondary shoshote" 
                                onClick={() => removeRow(idx)}
                                title="Supprimer ce champ"
                            >
                                -
                            </button>
                        )}
                        <div className="parentdodo">
                            <div className="dodo">
                                <label className="tm-label label-fiche" htmlFor={urlKey}>
                                    {t("img")} {idx + 1} :
                                    {values[urlKey] && isValidImageUrl(values[urlKey]) && (
                                        <div style={{ marginLeft: 6, marginBottom:-6 }}>
                                            <FaEye size={16}
                                                style={{ cursor: "pointer", fontSize: 20 }}
                                                title={t("preview")}
                                                onClick={() => setPreviewSrc(values[urlKey])}
                                            />
                                        </div>
                                    )}
                                </label>
                                <input 
                                    id={urlKey} 
                                    className="gugute" 
                                    type="url" 
                                    placeholder="https://exemple.com/image.jpg"
                                    value={values[urlKey] ?? ""} 
                                    onChange={handleChange(urlKey)}
                                    style={{
                                        border: (!values[urlKey] || isValidImageUrl(values[urlKey])) ? undefined : '2px solid #ff4444',
                                        borderRadius: (!values[urlKey] || isValidImageUrl(values[urlKey])) ? undefined : '4px'
                                    }}
                                />
                                {values[urlKey] && !isValidImageUrl(values[urlKey]) && (
                                    <div style={{ 
                                        color: '#ff4444', 
                                        fontSize: '12px', 
                                        marginTop: '4px',
                                        fontStyle: 'italic'
                                    }}>
                                        {t("invalidUrl")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div style={{ display: "flex", justifyContent: "flex-start"  }} >
                <button 
                    type="button" 
                    className="shoshote vd" 
                    onClick={addRow}
                    title="Ajouter un autre champ d'URL"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ImgPlus;
