import React, { useState, useEffect } from "react";
import { UserInfo } from "@service";
import { BaseModal } from "@components";
import "./BannerModal.css";

const BannerModal = ({ onChangeBanner, onCancel, defaultBanner }) => {
  const [bannerUrl, setBannerUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const currentBanner = await UserInfo.get("banner");
        if (currentBanner) {
          setBannerUrl(currentBanner);
        } else {
          setBannerUrl(defaultBanner); // ✅ fallback sur valeur par défaut
        }
      } catch (err) {
        setError("Erreur lors du chargement de la bannière.");
        setBannerUrl(defaultBanner);
      }
    };

    loadBanner();
  }, [defaultBanner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bannerUrl.startsWith("http")) {
      setError("L'URL doit commencer par http(s).");
      return;
    }

    try {
      await UserInfo.set("banner", bannerUrl);
      onChangeBanner(bannerUrl);
      onCancel();
    } catch {
      setError("Erreur lors de l'enregistrement.");
    }
  };

  const handleReset = async () => {
    try {
      await UserInfo.set("banner", defaultBanner); // ✅ renvoie vers banner.jpg
      onChangeBanner(defaultBanner);
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
            name="banner"
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
