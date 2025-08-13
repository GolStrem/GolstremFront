import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserInfo } from "@service"; // ou adapter selon ton code
import { BaseModal } from "@components";
import "../dashboard/modal/BannerModal.css";

const LockScreenBackgroundModal = ({ onCancel, lightUrl, darkUrl, setLightUrl, setDarkUrl }) => {
  const { t } = useTranslation("general");


  const [errorLight, setErrorLight] = useState("");
  const [errorDark, setErrorDark] = useState("");

  // Valide une URL simple
  const isValidUrl = (url) => url.startsWith("http");

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    setErrorLight("");
    setErrorDark("");

    if (lightUrl && !isValidUrl(lightUrl)) {
      setErrorLight(t("general.bannerErrorHttp"));
      valid = false;
    }
    if (darkUrl && !isValidUrl(darkUrl)) {
      setErrorDark(t("general.bannerErrorHttp"));
      valid = false;
    }
    if (!valid) return;

    // Sauvegarde dans UserInfo
    UserInfo.set("lightLock", lightUrl);
    UserInfo.set("darkLock", darkUrl);

    onCancel();
  };

  return (
    <BaseModal onClose={onCancel} className="tmedit">
      <h3>{t("general.changeLockscreenBackground")}</h3>

      <form className="tm-modal-form" onSubmit={handleSubmit}>

        <label>
          {t("general.lightLockBackground")}
          <input
            type="text"
            value={lightUrl}
            onChange={(e) => setLightUrl(e.target.value)}
            placeholder="https://..."
          />
          {lightUrl && (
            <div className="preview-banner">
              <img src={lightUrl} alt={t("bannerAlt")} />
            </div>
          )}
          {errorLight && <p className="error">{errorLight}</p>}
        </label>

        <label>
          {t("general.darkLockBackground")}
          <input
            type="text"
            value={darkUrl}
            onChange={(e) => setDarkUrl(e.target.value)}
            placeholder="https://..."
          />
          {darkUrl && (
            <div className="preview-banner">
              <img src={darkUrl} alt={t("bannerAlt")} />
            </div>
          )}
          {errorDark && <p className="error">{errorDark}</p>}
        </label>

        <div className="tm-modal-buttons">
          <button type="submit" className="tm-primary">{t("validate")}</button>
          <button type="button" onClick={onCancel}>{t("close")}</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default LockScreenBackgroundModal;
