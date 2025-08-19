import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserInfo } from "@service";
import { BaseModal } from "@components";
import "./BannerModal.css";

const BannerModal = ({
  defaultBanner,
  initialValue = "",
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation("general");

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
      setError(t("general.bannerErrorHttp"));
      return;
    }

    try {
      await onSubmit(bannerUrl);
      onCancel();
    } catch (err) {
      setError(t("general.bannerErrorSave"));
    }
  };

  const handleReset = async () => {
    try {
      await onSubmit(defaultBanner);
      onCancel();
    } catch {
      setError(t("general.bannerErrorReset"));
    }
  };

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <h3>{t("general.changeBannerTitle")}</h3>

      <div className="tm-modal-form">
        <label className="bannerModLab">
          {t("general.bannerUrlLabel")}
          <input
            type="text"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder={t("general.bannerPlaceholder")}
            className="bannerMod"
          />
        </label>

        {bannerUrl && (
          <div className="preview-banner">
            <img src={bannerUrl} alt={t("bannerAlt")} />
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <div className="tm-modal-buttons">
        <button className="tm-primary" onClick={handleSubmit}>
          {t("validate")}
        </button>
        <button onClick={onCancel}>{t("close")}</button>
        <button className="tm-secondary" onClick={handleReset}>
          {t("general.bannerReset")}
        </button>
      </div>
    </BaseModal>
  );
};

export default BannerModal;
