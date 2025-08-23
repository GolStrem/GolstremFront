import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIcon } from "../utils/iconImports";
import { useAsset } from "../utils/assetLoader";
import { LnModal } from '@components';
import { toggleTheme } from '@store/index';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './LoginNew.css';
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV } from '@assets';

const LoginNew = () => {
  const { t } = useTranslation('login');

  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  // Utilisation optimisée des icônes
  const { Icon: SunIcon } = useIcon('Sun');
  const { Icon: MoonIcon } = useIcon('Moon');
  const { Icon: UserAltIcon } = useIcon('UserAlt');
  const { Icon: PlusIcon } = useIcon('Plus');
  
  // Utilisation optimisée des assets
  const { asset: golstrembImage } = useAsset('golstremb');
  const { asset: goldenImage } = useAsset('golden');
  const { asset: rawImage } = useAsset('raw');

  const [modal, setModal] = useState(null); // 'login' | 'register' | null
  const openLogin    = () => setModal('login');
  const openRegister = () => setModal('register');
  const closeModal   = () => setModal(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token !== null) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="loginNew">
      {/* — interrupteur dark / light — */}
      <div
        className={`mode-toggle ${mode}`}
        onClick={() => dispatch(toggleTheme())}
      >
        {mode === 'dark' ? 
          (MoonIcon && <MoonIcon size={24} />) : 
          (SunIcon && <SunIcon size={24} />)
        }
      </div>

      {/* — header mobile — */}
      <header className="ln-header">
        {goldenImage && <img src={goldenImage} alt="Mon logo" className="ln-logor" />}
      </header>

      {/* — carré “Connexion” & “Créer un compte” — */}
      <div className="ln-form">
        <button className="ln-connexion" onClick={openLogin}>
          {UserAltIcon && <UserAltIcon className="ln-ico" />}
          <span>{t('login.connexionText')}</span>
        </button>

        <button className="ln-create" onClick={openRegister}>
          {PlusIcon && <PlusIcon className="ln-ico" />}
          <span>{t('login.nouveauCompte')}</span>
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
          {golstrembImage && <img src={golstrembImage} alt="Mon logo" className="ln-logo" />}
        </aside>

        <div className="ln-background">
          {rawImage && <img src={rawImage} alt="Fond personnage" className="ln-character" />}

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
