import React, { useEffect, useState } from "react";
import { UserNewPseudo, UserNewAvatar, ColorPicker, Language } from "@components";
import { ApiService } from "@service";
import { StyleModalIcon, WarningIcon } from "@assets";
import { useTranslation } from "react-i18next";
import './Config.css';

const Parametre = () => {
  const { t } = useTranslation("general");
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
            </div>
          </div>
        </section>

        {/* Boîte pour les paramètres de couleur */}
        <div className="param-box">
          <h2 className="parametre-h2">{t("general.colorSettings")}</h2>
          <div className="param-box-content">
            <ColorPicker />
          </div>
        </div>

        {/* Boîte pour les paramètres de langue */}
        <div className="param-box">
          <h2 className="parametre-h2">{t("general.languageSettings")}</h2>
          <div className="param-box-content">
            <Language />
          </div>
        </div>

        <div className="parametre-warning-wrapper">
          <WarningIcon className="parametre-warning" />
        </div>

        <StyleModalIcon className="parametre-style-bottom" />
      </main>
    </div>
  );
};

export default Parametre;
