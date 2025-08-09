import React, { useEffect, useState } from "react";
import "./Config.css";
import { UserNewPseudo, UserNewAvatar, ColorPicker } from "@components";
import { ApiService } from "@service";
import { StyleModalIcon, WarningIcon } from "@assets";
import { useTranslation } from "react-i18next";

const Parametre = () => {
  const { t, i18n } = useTranslation("general");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await ApiService.getUser();
        if (data?.email) setEmail(data.email);
      } catch {
        setEmail(t("general.errorFetchEmail"));
      }
    };
    fetchUser();
  }, [t]);

  const handleLangChange = (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute("lang", lng);
  };

  const currentLang = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2);

  return (
    <div className="parametre-page">
      <aside className="parametre-sidebar">
        {t("general.sidebarTitle")}
      </aside>

      <main className="parametre-main">
        <header className="parametre-header">
          <StyleModalIcon className="parametre-style-top" />
        </header>

        <h2 className="parametre-h2">{t("general.accountSettings")}</h2>

        <section className="parametre-content">
          <div className="parametre-general">
            <UserNewAvatar />

            <div className="parametre-rectangle"></div>

            <div className="parametre-maj">
              <UserNewPseudo />

      
              <p className="param-g a">
                <span className="param-g-label">{t("email")} :</span>{" "}
                <span className="param-g-value">{email || "..."}</span>
              </p>
              <p className="param-g">
                <span className="param-g-label">{t("password")} :</span>{" "}
                <span className="param-g-value">***********</span>
              </p>
              {/* Sélecteur de langue */}
              <label className="param-g a tm-label">
                <span className="param-g-label">{t("language")} :</span>{" "}
                <select
                  className="param-lang-select"
                  value={currentLang}
                  onChange={handleLangChange}
                  aria-label={t("language")}
                >
                  <option value="fr">{t("languageFr")}</option>
                  <option value="en">{t("languageEn")}</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <h2 className="parametre-h2">{t("general.colorSettings")}</h2>
        <ColorPicker />

        <div className="parametre-warning-wrapper">
          <WarningIcon className="parametre-warning" />
        </div>

        <StyleModalIcon className="parametre-style-bottom" />
      </main>
    </div>
  );
};

export default Parametre;
