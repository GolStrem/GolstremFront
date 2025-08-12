import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "./routes";
import { useSystemThemeSync } from "@service";
import LockScreen from "./pages/LockScreen"; 
import useInactivityHandler from "./services/hook/useInactivityHandler"; 


function AppContent() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  useInactivityHandler();

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      <Route path="/lockscreen" element={<LockScreen />} />
    </Routes>
  );
}

function App() {
  const mode = useSelector((state) => state.theme.mode);

  useSystemThemeSync(); 

  useEffect(() => {
    document.body.className = mode === "dark" ? "dark-mode" : "light-mode";
  }, [mode]);

  return (
    <>
      <div className="global-background"></div>
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
