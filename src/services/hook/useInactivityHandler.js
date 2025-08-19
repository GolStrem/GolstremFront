import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 min

const useInactivityHandler = () => {
  const lastActivityTimeRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "touchmove", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity));

    const checkInactivity = () => {
      const now = Date.now();
      const elapsed = now - lastActivityTimeRef.current;

      if (elapsed > INACTIVITY_TIMEOUT && location.pathname !== "/lockscreen") {
        localStorage.setItem("locationBeforeLocked", window.location.pathname);
        navigate("/lockscreen");
      } else {
        // Réarme le timeout en tenant compte du temps restant
        const timeLeft = INACTIVITY_TIMEOUT - elapsed;
        timeoutRef.current = setTimeout(checkInactivity, Math.min(timeLeft, 10000)); // max 10s
      }
    };

    // Démarre le premier timeout
    timeoutRef.current = setTimeout(checkInactivity, 10000);

    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isAuthenticated, navigate, location.pathname]);

  return null;
};

export default useInactivityHandler;
