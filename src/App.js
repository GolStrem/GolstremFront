import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes';
import { useSystemThemeSync }  from '@service'; // ici

function App() {
  const mode = useSelector((state) => state.theme.mode);
  useSystemThemeSync(); // 👈 synchronisation système

  useEffect(() => {
    document.body.className = mode === 'dark' ? 'dark-mode' : 'light-mode';
  }, [mode]);

  return (
    <>
      <div className="global-background" />

      <Router>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </>
  );
}

export default App;
