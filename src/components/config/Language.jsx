import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Language = () => {
  const { t, i18n } = useTranslation("general");
  const [currentLang, setCurrentLang] = useState(i18n.language.slice(0, 2)); // Initialiser avec la langue actuelle

  useEffect(() => {
    // Met à jour `currentLang` dès que la langue change
    const handleLangChange = (lng) => {
      setCurrentLang(lng.slice(0, 2));
    };

    // Écoute les changements de langue
    i18n.on('languageChanged', handleLangChange);

    // Nettoyer l'écouteur quand le composant est démonté
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const handleLangChange = (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng); // Change la langue avec i18n
    document.documentElement.setAttribute("lang", lng); // Met à jour l'attribut lang du document
  };

  return (
    <label className="param-g a tm-label">
      <span className="param-g-label"></span>
      <select
        className="param-lang-select"
        value={currentLang}
        onChange={handleLangChange}
        aria-label={t("language")}
      >
        <option value="fr">{t("languageFr")}</option>
        <option value="en">{t("languageEn")}</option>
        <option value="de">{t("languageDe")}</option>
      </select>
    </label>
  );
};

export default Language;
