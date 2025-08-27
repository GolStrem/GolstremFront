import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Golden from "@assets/golden.svg?react";
import "./Create.css";
import { toggleTheme } from "@store/index";
import { FaSun, FaMoon } from "react-icons/fa";
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV, raw } from '@assets';


const Create = () => {
  const { t } = useTranslation("general");
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const navigate = useNavigate();


  const handleRedirect = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  

  return (
    <div className="home-page">
      <Golden className="home-logo" />
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === "dark" ? 
          <FaMoon size={24} /> : 
          <FaSun size={24} />
        }
      </div>

      <div className="home-content">
        <div className="home-content-box crea">
        <h1 className="home-title">{t("general.createTitle")}</h1>
        <p className="home-subtitle">{t("general.createSubtitle")}</p>
              
      <button className="redirect-button cre" onClick={handleRedirect}>
        {isAuthenticated ? t('general.notFoundDashboard') : t('general.notFoundHome')}
      </button>

        </div>
                 <div className="home-img">
           <img src={raw} alt="Fond personnage" className="home-perso" />
         </div>
      </div>


      <div className="ln-backText">1
          <GoldenStremE alt={t('decorationAlt')} className="ln-tgold" />
          <GoldenStremV alt={t('decorationAlt')} className="ln-tgold" />
          <GoldenStremV alt={t('decorationAlt')} className="ln-tgold" />
      </div>
      
      {/* — aside + background décoratif — */}
      <div className="ln-back">
        <div className="ln-background">
          <div className="error-text ln-text">
            <GoldenStremP alt={t('decorationAlt')} className="ln-textlogo" />
            <GoldenStremC alt={t('decorationAlt')} className="ln-textlogo" />
            <GoldenStremC alt={t('decorationAlt')} className="ln-textlogo" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Create;
