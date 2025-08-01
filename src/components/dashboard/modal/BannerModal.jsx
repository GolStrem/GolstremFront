import React, { useState, useEffect } from "react";
import { UserInfo } from "@service";
import { BaseModal } from "@components";
import "./BannerModal.css";

const BannerModal = ({
  defaultBanner,
  initialValue = "",
  onCancel,
  onSubmit,
}) => {
  const [bannerUrl, setBannerUrl] = useState(initialValue || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bannerUrl && defaultBanner) {
      setBannerUrl(defaultBanner);
    }
  }, [defaultBanner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bannerUrl.startsWith("http")) {
      setError("L'URL doit commencer par http(s).");
      return;
    }

    try {
      await onSubmit(bannerUrl);
      onCancel();
    } catch (err) {
      setError("Erreur lors de l'enregistrement.");
    }
  };

  const handleReset = async () => {
    try {
      await onSubmit(defaultBanner);
      onCancel();
    } catch {
      setError("Erreur lors de la réinitialisation.");
    }
  };

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <button className="tm-modal-close" onClick={onCancel}>
        ✖
      </button>

      <h3>Changer la bannière</h3>

      <div className="tm-modal-form">
        <label>
          URL de la nouvelle image :
          <input
            type="text"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://exemple.com/banner.jpg"
          />
        </label>

        {bannerUrl && (
          <div className="preview-banner">
            <img src={bannerUrl} alt="Aperçu de la bannière" />
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit}>
          Valider
        </button>
        <button onClick={onCancel}>Annuler</button>
        <button className="tm-secondary" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>
    </BaseModal>
  );
};


export default BannerModal;
