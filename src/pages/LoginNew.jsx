import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSun, FaMoon, FaUserAlt, FaPlus, FaDiscord } from "react-icons/fa";
import { golstremb, golden, raw } from "@assets";
import { LnModal } from '@components';
import { toggleTheme } from '@store/index';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@service';
import { login as loginAction } from '@store/authSlice';
import { setTheme } from '@store/themeSlice';


import './LoginNew.css';
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV } from '@assets';

const LoginNew = () => {
  const { t } = useTranslation('login');

  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  const [modal, setModal] = useState(null); // 'login' | 'register' | null
  const openLogin    = () => setModal('login');
  const openRegister = () => setModal('register');
  const closeModal   = () => setModal(null);

  const CLIENT_ID   = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;

  const discordUrl =
  `https://discord.com/oauth2/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=identify%20email`;

  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");
  
      if (token) {
        // 1) On enregistre le token
        localStorage.setItem("token", token);
        window.history.replaceState({}, document.title, window.location.pathname);
  
        // 2) On récupère les infos utilisateur
        const { data } = await ApiService.getUserDetail();
        delete data.friends;
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, value);
        }
  
        // 3) Theme
        dispatch(setTheme(localStorage.getItem("theme")));
        document.documentElement.style.setProperty("--jaune", localStorage.getItem("color"));
  
        // 4) Redux auth
        dispatch(
          loginAction({
            token: ApiService.getToken(),
            ...data
          })
        );
  
        // 5) Redirection
        navigate("/dashboard");
      } 
      else {
        // Si pas de token dans l'URL mais déjà connecté
        const existingToken = localStorage.getItem("token");
        if (existingToken) {
          navigate("/dashboard");
        }
      }
    };
    handleAuth();
  }, [navigate, dispatch]);

  return (
    <div className="loginNew">
      {/* — interrupteur dark / light — */}
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === 'dark' ? 
          <FaMoon size={24} /> : 
          <FaSun size={24} />
        }
      </div>

      {/* — header mobile — */}
      <header className="ln-header">
        <img src={golden} alt="Mon logo" className="ln-logor" />
      </header>

      {/* — carré “Connexion” & “Créer un compte” — */}
      <div className="ln-form">
        <button className="ln-connexion" onClick={openLogin}>
          <FaUserAlt className="ln-ico" />
          <span>{t('login.connexionText')}</span>
        </button>

        <button className="ln-create" onClick={openRegister}>
          <FaPlus className="ln-ico" />
          <span>{t('login.nouveauCompte')}</span>
        </button>

        <button className="ln-discord ln-connexion" onClick={() => (window.location.href = discordUrl)}>
          <span className="ln-ico"><FaDiscord className="ln-ico" /></span>
          <span>{t('discordBis')}</span>
        </button>

      </div>

      {modal && <LnModal type={modal} onClose={closeModal} />}

      <div className="ln-backText">
        <GoldenStremE alt="texte logo 1" className="ln-tgold" />
        <GoldenStremV alt="texte logo 2" className="ln-tgold" />
        <GoldenStremV alt="texte logo 3" className="ln-tgold" />
      </div>

      {/* — aside + background décoratif — */}
      <div className="ln-back">
        <aside className="ln-aside">
          <img src={golstremb} alt="Mon logo" className="ln-logo" />
        </aside>

        <div className="ln-background">
          <img src={raw} alt="Fond personnage" className="ln-character" />

          <div className="ln-text">
            <GoldenStremP alt="texte logo 1" className="ln-textlogo" />
            <GoldenStremC alt="texte logo 2" className="ln-textlogo" />
            <GoldenStremC alt="texte logo 3" className="ln-textlogo" />
            <p className="ln-connect">{t('login.connexionText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;
