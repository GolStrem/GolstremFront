import './NotFound.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@store/index';
import { FaSun, FaMoon } from 'react-icons/fa';
import './LoginNew.css';
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV } from '@assets';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation("general");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mode = useSelector((state) => state.theme.mode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleRedirect = () => {
    navigate(isAuthenticated ? '/dashboard' : '/');
  };

  return (
    <div className="notFound">
      {/* — interrupteur dark / light — */}
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}
      </div>

      <div className="number">404</div>
      <h1 className="error">{t('notFoundTitle')}</h1>

      {/* Bouton unique avec condition */}
      <button className="redirect-button" onClick={handleRedirect}>
        {isAuthenticated ? t('notFoundDashboard') : t('notFoundHome')}
      </button>

      <div className="circle"></div>
      <div className="circleD"></div>

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

export default NotFound;
