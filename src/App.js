import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes';

function App() {
  const mode = useSelector((state) => state.theme.mode); // Récupère le mode depuis Redux

  useEffect(() => {
    // Synchronise la classe du body avec le mode Redux
    document.body.className = mode === 'dark' ? 'dark-mode' : 'light-mode';
  }, [mode]); // Met à jour à chaque changement de mode

  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
