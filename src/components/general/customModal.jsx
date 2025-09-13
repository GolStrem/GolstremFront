import React, { useState, useEffect } from "react";
import { BaseModal } from "@components";
import { ApiUnivers } from "@service";
import { useTranslation } from "react-i18next";

const CustomModal = ({ 
  isOpen, 
  onClose, 
  ficheId, 
  listModule,
  onSuccess
}) => {
  const { t } = useTranslation("univers");
  const [userUniverses, setUserUniverses] = useState([]);
  const [selectedUniversId, setSelectedUniversId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [universModels, setUniversModels] = useState([]);
  const [userRoleInUnivers, setUserRoleInUnivers] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les univers de l'utilisateur
  const loadUserUniverses = async () => {
    try {
      const response = await ApiUnivers.getUnivers({ filter: { withMe: 1 } });
      const universes = response?.data?.data || [];
      setUserUniverses(universes);
    } catch (error) {
      console.error("Erreur lors du chargement des univers:", error);
    }
  };

  // Récupérer le grade de l'utilisateur dans l'univers
  const getUserRoleInUnivers = async (universId) => {
    try {
      const response = await ApiUnivers.getDetailUnivers(universId);
      const userRole = response?.data?.role || response?.data?.userRole || 0;
      setUserRoleInUnivers(userRole);
      return userRole;
    } catch (error) {
      console.error("Erreur lors de la récupération du grade:", error);
      setUserRoleInUnivers(0);
      return 0;
    }
  };

  // Charger les modèles d'un univers (filtrés par grade)
  const loadUniversModels = async (universId) => {
    try {
      // D'abord récupérer le grade de l'utilisateur
      const userRole = await getUserRoleInUnivers(universId);
      
      // Charger tous les modèles
      const response = await ApiUnivers.getListModelFiche(universId, { checkRole: 1 });
      const allModels = response?.data?.data || response?.data || [];
      
      // Filtrer les modèles selon le grade de l'utilisateur
      // L'utilisateur peut voir les modèles dont le grade requis est <= à son grade
      const filteredModels = allModels.filter(model => {
        const modelRequiredRole = model.role || model.requiredRole || 0;
        return modelRequiredRole <= userRole;
      });
      
      setUniversModels(filteredModels);
      if (filteredModels.length > 0) {
        setSelectedModelId(filteredModels[0].id);
      } else {
        setSelectedModelId("");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error);
      setUniversModels([]);
      setSelectedModelId("");
    }
  };

  // Vérifier les critères de la fiche contre le modèle
  const validateFicheAgainstModel = async (universId, modelId) => {
    if (!universId || !modelId) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      // Utiliser la nouvelle route de vérification
      const response = await ApiUnivers.verifRuleFiche(ficheId, {
        idUnivers: universId,
        idModele: modelId
      });
      
      if (response?.data?.status === "success") {
        setValidationResult({ 
          success: true, 
          message: t("connection.validationSuccessMessage")
        });
      } else {
        // Gestion spécifique des erreurs selon le type
        const errorData = response?.data?.error || {};
        const errorStatus = response?.data?.status;
        
        // Détection des types d'erreur spécifiques
        if (errorData.moduleMandatory || errorData.size) {
          // Erreur 403: Modules manquants ou problème de taille
          let errorMessage = t("connection.error403.message");
          
          if (errorData.moduleMandatory) {
            errorMessage += ` ${t("connection.error403.missingModules", { modules: errorData.moduleMandatory })}`;
          }
          
          if (errorData.size && errorData.size.length > 0) {
            errorMessage += ` ${t("connection.error403.sizeIssue")}`;
          }
          
          setValidationResult({ 
            success: false, 
            message: errorMessage,
            errorType: "403",
            errorDetails: errorData
          });
        } else if (response?.data?.message && (
          response.data.message.includes("déjà enregistré") || 
          response.data.message.includes("already registered") ||
          response.data.message.includes("no fiche") ||
          response.data.message.includes("Preview: no fiche")
        )) {
          // Erreur 404: Fiche déjà enregistrée
          setValidationResult({ 
            success: false, 
            message: t("connection.error404.message"),
            errorType: "404"
          });
        } else if (response?.data?.message && (
          response.data.message.includes("en attente") || 
          response.data.message.includes("pending") ||
          response.data.message.includes("demande") ||
          response.data.message.includes("already pending")
        )) {
          // Erreur 409: Demande d'adhésion en attente
          setValidationResult({ 
            success: false, 
            message: t("connection.error409.message"),
            errorType: "409"
          });
        } else {
          // Erreur générique
          setValidationResult({ 
            success: false, 
            message: response?.data?.message || t("connection.validationFailedMessage"),
            errors: response?.data?.errors || []
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      
      // Gestion spécifique des erreurs HTTP
      const errorStatus = error?.response?.status;
      const errorData = error?.response?.data;
      
      if (errorStatus === 403) {
        // Erreur 403: Modules manquants ou problème de taille
        const errorInfo = errorData?.error || {};
        let errorMessage = t("connection.error403.message");
        
        if (errorInfo.moduleMandatory) {
          errorMessage += ` ${t("connection.error403.missingModules", { modules: errorInfo.moduleMandatory })}`;
        }
        
        if (errorInfo.size && errorInfo.size.length > 0) {
          errorMessage += ` ${t("connection.error403.sizeIssue")}`;
        }
        
        setValidationResult({ 
          success: false, 
          message: errorMessage,
          errorType: "403",
          errorDetails: errorInfo
        });
      } else if (errorStatus === 404) {
        // Erreur 404: Fiche déjà enregistrée
        setValidationResult({ 
          success: false, 
          message: t("connection.error404.message"),
          errorType: "404"
        });
      } else if (errorStatus === 409) {
        // Erreur 409: Demande d'adhésion en attente
        setValidationResult({ 
          success: false, 
          message: t("connection.error409.message"),
          errorType: "409"
        });
      } else {
        // Autres erreurs
        setValidationResult({ 
          success: false, 
          message: t("connection.validationError")
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Envoyer la demande de connexion
  const submitUniversConnection = async () => {
    if (!validationResult?.success) {
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiUnivers.subscribeFiche(ficheId, {
        idUnivers: selectedUniversId,
        idModele: selectedModelId
      });
      
      // Appeler le callback de succès
      onSuccess?.();
      
      // Fermer la modal et remettre à zéro
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      
      // Gestion spécifique des erreurs HTTP lors de l'envoi
      const errorStatus = error?.response?.status;
      const errorData = error?.response?.data;
      
      if (errorStatus === 403) {
        // Erreur 403: Modules manquants ou problème de taille
        const errorInfo = errorData?.error || {};
        let errorMessage = t("connection.error403.message");
        
        if (errorInfo.moduleMandatory) {
          errorMessage += ` ${t("connection.error403.missingModules", { modules: errorInfo.moduleMandatory })}`;
        }
        
        if (errorInfo.size && errorInfo.size.length > 0) {
          errorMessage += ` ${t("connection.error403.sizeIssue")}`;
        }
        
        setValidationResult({ 
          success: false, 
          message: errorMessage,
          errorType: "403",
          errorDetails: errorInfo
        });
      } else if (errorStatus === 404) {
        // Erreur 404: Fiche déjà enregistrée
        setValidationResult({ 
          success: false, 
          message: t("connection.error404.message"),
          errorType: "404"
        });
      } else if (errorStatus === 409) {
        // Erreur 409: Demande d'adhésion en attente
        setValidationResult({ 
          success: false, 
          message: t("connection.error409.message"),
          errorType: "409"
        });
      } else {
        // Autres erreurs - garder le résultat de validation actuel
        console.error("Erreur inattendue lors de l'envoi:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer la modal et remettre à zéro
  const handleClose = () => {
    setSelectedUniversId("");
    setSelectedModelId("");
    setUniversModels([]);
    setUserRoleInUnivers(null);
    setValidationResult(null);
    onClose();
  };

  // Charger les univers quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadUserUniverses();
    }
  }, [isOpen]);

  // Charger les modèles quand un univers est sélectionné
  useEffect(() => {
    if (selectedUniversId) {
      loadUniversModels(selectedUniversId);
      // Réinitialiser la validation quand on change d'univers
      setValidationResult(null);
    }
  }, [selectedUniversId]);

  // Vérifier automatiquement quand un modèle est sélectionné
  useEffect(() => {
    if (selectedUniversId && selectedModelId) {
      validateFicheAgainstModel(selectedUniversId, selectedModelId);
    }
  }, [selectedModelId]);

  if (!isOpen) return null;

  return (
    <BaseModal onClose={handleClose} className="cf-modal-large cf-univers-connection-modal">
      <h2>{t("connection.title")}</h2>
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label className="tm-label label-fiche">
            {t("connection.selectUnivers")}
          </label>
          <select 
            value={selectedUniversId} 
            onChange={(e) => setSelectedUniversId(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", width: "40%", backgroundColor:"var(--color-input-bg)" }}
          >
            <option value="">{t("connection.selectUniversPlaceholder")}</option>
            {userUniverses.map(univers => (
              <option key={univers.id} value={univers.id}>
                {univers.name}
              </option>
            ))}
          </select>
        </div>

        {selectedUniversId && (
          <div style={{ marginBottom: "20px" }}>
            <label className="tm-label label-fiche">
              {t("connection.selectModel")}
            </label>

            <select 
              value={selectedModelId} 
              onChange={(e) => setSelectedModelId(e.target.value)}
              style={{ 
							padding: "8px", 
							borderRadius: "4px", 
							border: "1px solid #ddd", 
							width: "40%",
							backgroundColor:"var(--color-input-bg)"
						}}
    
              disabled={universModels.length === 0}
              className="selectbo"
            >
              <option value="">
                {universModels.length === 0 ? t("connection.noModelsForRole") : t("connection.selectModelPlaceholder")}
              </option>
              {universModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}

         {isValidating && (
           <div style={{ 
             marginBottom: "20px", 
             padding: "10px", 
             borderRadius: "4px",
             backgroundColor: "#fff3cd",
             border: "1px solid #ffeaa7",
             color: "#856404"
           }}>
             <strong>⏳ {t("connection.validating")}</strong>
           </div>
         )}

         {validationResult && !isValidating && (
           <div style={{ 
             marginBottom: "20px", 
             padding: "10px", 
             borderRadius: "4px",
             backgroundColor: validationResult.success ? "#d4edda" : "#f8d7da",
             border: `1px solid ${validationResult.success ? "#c3e6cb" : "#f5c6cb"}`,
             color: validationResult.success ? "#155724" : "#721c24"
           }}>
             {validationResult.success ? (
               <div>
                 <strong>✓ {t("connection.validationSuccess")}</strong>
                 <p>{validationResult.message}</p>
               </div>
             ) : (
               <div>
                 <strong>✗ {validationResult.errorType ? t(`connection.error${validationResult.errorType}.title`) : t("connection.validationFailed")}</strong>
                 <p>{validationResult.message}</p>
                 {validationResult.errors?.map((error, index) => (
                   <p key={index}>• {error}</p>
                 ))}
                 {validationResult.errorType === "403" && (
                   <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#fff3cd", borderRadius: "4px", fontSize: "12px" }}>
                     {validationResult.errorDetails?.moduleMandatory && (
                       <div style={{ marginBottom: "4px" }}>
                         <strong>{t("connection.error403.missingModules", { modules: validationResult.errorDetails.moduleMandatory })}</strong>
                       </div>
                     )}
                     {validationResult.errorDetails?.size && validationResult.errorDetails.size.length > 0 && (
                       <div>
                         <strong>{t("connection.error403.emptyElements")}</strong>
                         <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                           {validationResult.errorDetails.size.map((item, index) => (
                             <li key={index}>
                               <strong>{item.target}</strong> : {item.value}
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             )}
           </div>
         )}

        <div className="tm-modal-buttons" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button 
            type="button"
            className="cf-btn-secondary"
            onClick={handleClose}
          >
            {t("connection.cancel")}
          </button>
          <button 
            type="button"
            className="cf-btn-success"
            onClick={submitUniversConnection}
            disabled={!validationResult?.success || isSubmitting || isValidating}
          >
            {isSubmitting ? t("connection.sending") : t("connection.sendRequest")}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default CustomModal;
