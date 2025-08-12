import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

const useInactivityHandler = () => {
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      setLastActivityTime(Date.now());
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    const inactivityCheckInterval = setInterval(() => {
      // Empêche de relancer si on est déjà sur /lockscreen
      if (
        Date.now() - lastActivityTime > INACTIVITY_TIMEOUT &&
        location.pathname !== "/lockscreen"
      ) {
        localStorage.setItem("locationBeforeLocked", window.location.pathname);
        navigate("/lockscreen");
      }
    }, 30000);

    return () => {
      clearInterval(inactivityCheckInterval);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [isAuthenticated, navigate, location.pathname, lastActivityTime]);

  return null;
};

export default useInactivityHandler;
