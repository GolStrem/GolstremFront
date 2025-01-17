import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import logo from '../assets/logo.png';
import { FaSun, FaMoon } from 'react-icons/fa';

const Login = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode);

  const handleLogin = () => {
    if (code === '1234') {
      dispatch(login(code)); // Enregistre l'utilisateur comme connecté
      navigate('/dashboard'); // Redirige vers le tableau de bord
    } else {
      setError('Code invalide. Veuillez réessayer.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={`login ${mode === 'dark' ? 'dark' : 'light'}`}>
      <div className="mode-toggle" onClick={() => dispatch(toggleTheme())}>
        {mode === 'dark' ? <FaMoon size={24} /> : <FaSun size={24} />}
      </div>
      
      <img src={logo} alt="Mon logo" width="200" />
      <h1>Henel</h1>
      <input
        className='input-password'
        type="password"
        placeholder="Code PIN"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError('');
        }}
        onKeyPress={handleKeyPress}
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
};

export default Login;
