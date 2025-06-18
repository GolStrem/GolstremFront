import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { FaSun, FaMoon, FaUserAlt, FaPlus } from 'react-icons/fa';

import './LoginNew.css';

import golstremb  from '../assets/golstremb.svg';
import personp    from '../assets/Fichier6.png';
import golstremp  from '../assets/golstremp_1.svg';
import golstremc  from '../assets/golstremc.svg';
import golden     from '../assets/golden.svg';

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
        <button className="ln-connexion" onClick={openLogin}>
          <FaUserAlt size={80} className="ln-ico" />
          <span>Connexion</span>
        </button>

        <button className="ln-create" onClick={openRegister}>
          <FaPlus size={80} className="ln-ico" />
          <span>Créer&nbsp;un&nbsp;compte</span>
        </button>
      </div>

      {/* ---------- POP-UP « Connexion » ---------- */}
      {modal === 'login' && (
        <div className="ln-modal" onClick={closeModal}>
          <div className="ln-modal-box" onClick={e => e.stopPropagation()}>
            <button className="ln-modal-close" onClick={closeModal}>
              &#x2715;
            </button>

            <h2>Connexion</h2>
            <form>
              <label>Pseudo</label>
              <input type="text" required />

              <label>Mot de passe</label>
              <input type="password" required />

              <button type="submit">Se connecter</button>
            </form>
          </div>
        </div>
      )}

      {/* ---------- POP-UP « Créer un compte » ---------- */}
      {modal === 'register' && (
        <div className="ln-modal" onClick={closeModal}>
          <div className="ln-modal-box" onClick={e => e.stopPropagation()}>
            <button className="ln-modal-close" onClick={closeModal}>
              &#x2715;
            </button>

            <h2>Nouveau&nbsp;compte</h2>
            <form>
              <label>Pseudo</label>
              <input type="text" required />

              <label>Mot de passe</label>
              <input type="password" required />

              <label>Confirmez le mot&nbsp;de&nbsp;passe</label>
              <input type="password" required />

              <label>Adresse e-mail</label>
              <input type="email" required />

              <button type="submit">Valider la création</button>
            </form>
          </div>
        </div>
      )}

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
