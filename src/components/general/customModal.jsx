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
        setValidationResult({ 
          success: false, 
          message: response?.data?.message || t("connection.validationFailedMessage"),
          errors: response?.data?.errors || []
        });
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setValidationResult({ 
        success: false, 
        message: t("connection.validationError")
      });
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
            {userRoleInUnivers !== null && (
              <div style={{  marginBottom: "8px", padding: "4px 8px", backgroundColor: "#e3f2fd", borderRadius: "4px",  fontSize: "12px", color: "#1976d2" }}
              >
                {t("connection.yourRole")}: {t(`connection.role_${userRoleInUnivers}`)} 
                ({universModels.length} {universModels.length > 1 ? t("connection.modelsAvailablePlural") : t("connection.modelsAvailable")})
              </div>
            )}
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
                 <strong>✗ {t("connection.validationFailed")}</strong>
                 <p>{validationResult.message}</p>
                 {validationResult.errors?.map((error, index) => (
                   <p key={index}>• {error}</p>
                 ))}
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
