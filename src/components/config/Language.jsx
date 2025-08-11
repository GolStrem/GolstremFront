import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Language = () => {
  const { t, i18n } = useTranslation("general");
  const [currentLang, setCurrentLang] = useState("fr");

  useEffect(() => {
    const lang = i18n.resolvedLanguage || i18n.language || "fr";
    setCurrentLang(lang.slice(0, 2)); // On garde uniquement le code de langue (ex. "fr" ou "en")
  }, [i18n]);

  const handleLangChange = (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
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
