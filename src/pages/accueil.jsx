import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Golden from "@assets/golden.svg?react";
import "./Accueil.css";
import { toggleTheme } from "@store/index";
import { useIcon } from "../utils/iconImports";
import { useAsset } from "../utils/assetLoader";
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV } from '@assets';


const Accueil = () => {
  const { t } = useTranslation("general");
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const navigate = useNavigate();

  // Utilisation optimisée des icônes
  const { Icon: SunIcon } = useIcon('Sun');
  const { Icon: MoonIcon } = useIcon('Moon');
  
  // Utilisation optimisée des assets
  const { asset: rawImage } = useAsset('raw');

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
      <Golden className="home-logo" />
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === "dark" ? 
          (MoonIcon && <MoonIcon size={24} />) : 
          (SunIcon && <SunIcon size={24} />)
        }
      </div>

      <div className="home-content">
        <div className="home-content-box">
        <h1 className="home-title">{t("general.homeTitle")}</h1>
        <p className="home-subtitle">{t("general.homeSubtitle")}</p>
         <button className="home-button" onClick={handleLoginClick}>
          {t("loginCta")}
        </button>
        </div>
                 <div className="home-img">
           {rawImage && <img src={rawImage} alt="Fond personnage" className="home-perso" />}
         </div>
      </div>


      <div className="ln-backText">
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

export default Accueil;
