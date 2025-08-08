import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Golden from "@assets/golden.svg?react";
import "./Accueil.css";
import { toggleTheme } from "@store/index";
import { FaSun, FaMoon } from "react-icons/fa";

const Accueil = () => {
  const { t } = useTranslation("general");
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === "dark" ? <FaMoon size={24} /> : <FaSun size={24} />}
      </div>

      <div className="home-content">
        <Golden className="home-logo" />
        <h1 className="home-title">{t("general.homeTitle")}</h1>
        <p className="home-subtitle">{t("general.homeSubtitle")}</p>
        <button className="home-button" onClick={handleLoginClick}>
          {t("loginCta")}
        </button>
      </div>
    </div>
  );
};

export default Accueil;
