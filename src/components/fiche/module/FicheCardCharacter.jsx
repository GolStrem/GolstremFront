import { FicheNav } from "@components"; 
import "./FicheCard.css"
import React, { useCallback, useEffect, useState, useRef } from "react";
import { ApiService } from "@service";
import { useTranslation } from "react-i18next";

const FicheCardCharacter= ({ activeTab, indexModule, setActiveTab, data, onEdit }) => {
  const { t } = useTranslation("common");

  const extraData = (data.module === undefined) ? {} : data.module[indexModule]?.extra;
  // État pour les valeurs avec alias résolus
  const [resolvedValues, setResolvedValues] = useState(extraData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Référence pour annuler les appels API précédents
  const abortControllerRef = useRef(null);

  // Mettre à jour resolvedValues quand extraData change (y compris quand indexModule change)
  useEffect(() => {
    // Annuler l'appel API précédent s'il y en a un
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
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
      // Vérifier si l'appel a été annulé
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const aliasRegex = /\$\$(\d+)\$\$/g;
      const foundNumbers = new Set();

      // Trouver tous les alias dans les valeurs
      Object.values(extraData).forEach((val) => {
        if (typeof val === "string") {
          let match;
          while ((match = aliasRegex.exec(val)) !== null) {
            foundNumbers.add(match[1]);
          }
        }
      });


      // S'il n'y a pas d'alias, utiliser les valeurs originales
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
        console.error("Erreur lors du traitement des alias:", error);
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
        <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
        <div className="cf-text cf-height">

        {resolvedValues?.personalité && resolvedValues.personalité.trim() !== '' && resolvedValues.personalité !== '<p></p>' && (
          <>
            <h2>{t("characterTrait")}</h2>
            <div className="cf-rank">
              {isLoading ? t("loading") : (
                <div dangerouslySetInnerHTML={{ __html: resolvedValues.personalité }} />
              )}
            </div>
          </>
        )}
        
        {resolvedValues?.peur && resolvedValues.peur.trim() !== '' && resolvedValues.peur !== '<p></p>' && (
          <>
            <h3>{t("fear")}</h3>
            <div className="cf-rank">
              {isLoading ? t("loading") : (
                <div dangerouslySetInnerHTML={{ __html: resolvedValues.peur }} />
              )}
            </div>
          </>
        )}
        
        {resolvedValues?.motivation && resolvedValues.motivation.trim() !== '' && resolvedValues.motivation !== '<p></p>' && (
          <>
            <h3>{t("motivation")}</h3>
            <div className="cf-rank">
              {isLoading ? t("loading") : (
                <div dangerouslySetInnerHTML={{ __html: resolvedValues.motivation }} />
              )}
            </div>
          </>
        )}
        
        {resolvedValues?.another && resolvedValues.another.trim() !== '' && resolvedValues.another !== '<p></p>' && (
          <>
            <h3>{t("other")}</h3>
            <div className="cf-rank">
              {isLoading ? t("loading") : (
                <div dangerouslySetInnerHTML={{ __html: resolvedValues.another }} />
              )}
            </div>
          </>
        )}
       
        </div>
        

    
          <button className="cf-edit-btn" onClick={handleEdit}>✏️ {t("edit")}</button>
        </div>
  );
};

export default FicheCardCharacter;