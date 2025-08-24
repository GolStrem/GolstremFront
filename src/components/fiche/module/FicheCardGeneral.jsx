import React, { useCallback, useEffect, useState, useRef } from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";
import { ApiService } from "@service";
import "./FicheCard.css"
import { useTranslation } from "react-i18next";


const FicheCardGeneral = ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const { t } = useTranslation("common");
  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra;
  
  // État pour les valeurs avec alias résolus
  const [resolvedValues, setResolvedValues] = useState(extraData);
  const [isLoading, setIsLoading] = useState(false);
  

  const abortControllerRef = useRef(null);

  // Mettre à jour resolvedValues quand extraData change (y compris quand indexModule change)
  useEffect(() => {
    // Annuler l'appel API précédent s'il y en a un
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    
    if (extraData && Object.keys(extraData).length > 0) {
      setResolvedValues(extraData);
      setIsLoading(true);
    } else {
      setResolvedValues({});
      setIsLoading(false);
    }
  }, [extraData, indexModule]);

  // Traitement des alias
  useEffect(() => {
    if (!extraData || Object.keys(extraData).length === 0 || !isLoading) {
      return;
    }

    const processAliases = async () => {

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const aliasRegex = /\$\$(\d+)\$\$/g;
      const foundNumbers = new Set();


      Object.values(extraData).forEach((val) => {
        if (typeof val === "string") {
          let match;
          while ((match = aliasRegex.exec(val)) !== null) {
            foundNumbers.add(match[1]);
          }
        }
      });


      if (foundNumbers.size === 0) {
        setResolvedValues(extraData);
        setIsLoading(false);
        return;
      }

      try {
        const aliasModule = await ApiService.getAliasModule(Array.from(foundNumbers));
        
        // Vérifier si l'appel a été annulé pendant l'attente
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
   
        const aliasMap = aliasModule.data;

        // Remplacer les alias dans les valeurs
        const processedValues = Object.fromEntries(
          Object.entries(extraData).map(([key, val]) => {
            if (typeof val === "string") {
              const replaced = val.replace(aliasRegex, (_, num) => {
                const replacement = aliasMap[num];
                return replacement || `$$${num}$$`;
              });
              return [key, replaced];
            }
            return [key, val];
          })
        );
        setResolvedValues(processedValues);
      } catch (error) {
        // Ignorer les erreurs d'annulation
        if (error.name === 'AbortError') {
          return;
        }
        setResolvedValues(extraData); // Fallback sur les valeurs originales
      } finally {
        setIsLoading(false);
      }
    };

    processAliases();
  }, [extraData, isLoading]);

  // Mémoriser le callback onEdit pour éviter les re-renders
  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  return (
    <div className="cf-content">

      {/* Nav synchronisée */}
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />

      <div className="cf-header">
        <h1 className="cf-h1">{data.name}</h1> 
        {resolvedValues?.age && resolvedValues.age.trim() !== '' && resolvedValues.age !== '<p></p>' && (
          <span className="cf-rank">
            {isLoading ? t("loading") : resolvedValues.age}
          </span>
        )}
      </div>

      {resolvedValues?.about && resolvedValues.about.trim() !== '' && resolvedValues.about !== '<p></p>' && (
        <section className="cf-text"> 
          <h2 className="cf-h2">{t("about")}</h2> 
          <div className="cf-about-display">
            {isLoading ? t("loading") : (
              <div dangerouslySetInnerHTML={{ __html: resolvedValues.about }} />
            )}
          </div> 
        </section> 
      )}
      {data.droit === "write" && (
        <button className="cf-edit-btn" onClick={handleEdit}>✏️ {t("edit")}</button>
      )}
    </div>
  );
};

export default FicheCardGeneral;
