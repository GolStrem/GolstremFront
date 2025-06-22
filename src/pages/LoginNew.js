import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { FaSun, FaMoon, FaUserAlt, FaPlus } from 'react-icons/fa';
import LnModal from '../components/LnModal.js'; // adapte le chemin si besoin


import './LoginNew.css';

import golstremb  from '../assets/golstremb.svg';
import personp    from '../assets/Fichier6.png';
import golstremp  from '../assets/golstremp_1.svg';
import golstremc  from '../assets/golstremc.svg';
import golden     from '../assets/golden.svg';
import golstremE     from '../assets/golstremE.svg';
import golstremV     from '../assets/goldstremV.svg';

const LoginNew = () => {
  const dispatch  = useDispatch();
  const mode      = useSelector(state => state.theme.mode);


  const [modal, setModal] = useState(null);        // 'login' | 'register' | null
  const openLogin    = () => setModal('login');
  const openRegister = () => setModal('register');
  const closeModal   = () => setModal(null);





  return (
    <div className={`loginNew ${mode}`}>
      {/* — interrupteur dark / light — */}
      <div className={`mode-toggle ${mode}`} onClick={() => dispatch(toggleTheme())}> {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}</div>
      
       {/* — header mobile — */}
      <header className="ln-header">
        <img src={golden} alt="Mon logo" className="ln-logor" />
      </header>

      {/* — carré “Connexion” & “Créer un compte” — */}
      <div className="ln-form">
        <button className={`ln-connexion ${mode}`} onClick={openLogin}>
          <FaUserAlt className="ln-ico" />
          <span>Connexion</span>
        </button>

        <button className={`ln-create ${mode}`} onClick={openRegister}>
          <FaPlus className="ln-ico" />
          <span>Créer&nbsp;un&nbsp;compte</span>
        </button>

      </div>

      {modal && <LnModal type={modal} onClose={closeModal} mode={mode} />}


      <div className='ln-backText'>
            <img src={golstremE} alt="texte logo 1" className="ln-tgold" />
            <img src={golstremV} alt="texte logo 2" className="ln-tgold" />
            <img src={golstremV} alt="texte logo 3" className="ln-tgold" />
      </div>

      {/* — aside + background décoratif — */}
      <div className="ln-back">
        <aside className="ln-aside">
          <img src={golstremb} alt="Mon logo" className="ln-logo" />
        </aside>

        <div className="ln-background">
          <img src={personp}   alt="Fond personnage" className="ln-character" />

          <div className="ln-text">
            <img src={golstremp} alt="texte logo 1" className="ln-textlogo" />
            <img src={golstremc} alt="texte logo 2" className="ln-textlogo" />
            <img src={golstremc} alt="texte logo 3" className="ln-textlogo" />
            <p className="ln-connect">CONNEXION</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;
