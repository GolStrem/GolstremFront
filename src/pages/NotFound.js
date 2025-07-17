import './NotFound.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@store/index';
import { FaSun, FaMoon } from 'react-icons/fa';
import './LoginNew.css';
import { GoldenStremC, GoldenStremE, GoldenStremP, GoldenStremV } from '@assets';


const NotFound = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mode = useSelector((state) => state.theme.mode); // Récupère le mode (dark/light)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Vérifie si l'utilisateur est connecté

  const handleRedirect = () => {
    navigate(isAuthenticated ? '/dashboard' : '/'); // Redirige en fonction de l'état de connexion
  };

  return (
    <div className={`notFound ${mode}`}>
      {/* — interrupteur dark / light — */}
      <div className={`mode-toggle ${mode}`} onClick={() => dispatch(toggleTheme())}> {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}</div>
      


        <div className='number'>404</div>
      <h1 className='error'>Page introuvable</h1>

      {/* Bouton unique avec condition */}
      <button className= {`redirect-button ${mode}`} onClick={handleRedirect} >
        {isAuthenticated ? 'Retourner au Dashboard' : 'Retourner à l\'accueil'}
      </button>

      <div className={`circle ${mode}`}></div>
      <div className={`circleD ${mode}`}></div>

      <div className='ln-backText'>
            <GoldenStremE alt="texte logo 1" className="ln-tgold" />
            <GoldenStremV alt="texte logo 2" className="ln-tgold" />
            <GoldenStremV alt="texte logo 3" className="ln-tgold" />
      </div>

      {/* — aside + background décoratif — */}
      <div className="ln-back">
        <div className="ln-background">

          <div className="error-text ln-text ">
            <GoldenStremP alt="texte logo 1" className="ln-textlogo" />
            <GoldenStremC alt="texte logo 2" className="ln-textlogo" />
            <GoldenStremC alt="texte logo 3" className="ln-textlogo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
