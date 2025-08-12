import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoldenLogo } from "@assets";
import { useNavigate } from "react-router-dom";
import "./LockScreen.css";
import "./Dashboard.css";

const UNLOCK_THRESHOLD_PX = 140; // distance à tirer vers le haut pour déverrouiller

const LockScreen = () => {
  const { t } = useTranslation("general");
  const [currentTime, setCurrentTime] = useState("");
  const [dragging, setDragging] = useState(false);
  const [offsetY, setOffsetY] = useState(0); // négatif quand on tire vers le haut
  const [unlocking, setUnlocking] = useState(false);

  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const startYRef = useRef(0);

  // Horloge
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // Gestion du drag (souris + tactile via Pointer Events)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      if (unlocking) return;
      setDragging(true);
      startYRef.current = e.clientY ?? (e.touches?.[0]?.clientY || 0);
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragging || unlocking) return;
      const y = e.clientY ?? (e.touches?.[0]?.clientY || 0);
      const delta = y - startYRef.current; // négatif si on monte
      const clamped = Math.max(-window.innerHeight, Math.min(0, delta));
      setOffsetY(clamped);
    };

    const onPointerUp = () => {
      if (!dragging || unlocking) return;

      // Si on a tiré suffisamment vers le haut, on lance l’animation d’unlock
      if (Math.abs(offsetY) >= UNLOCK_THRESHOLD_PX) {
        setUnlocking(true);
        // L’animation CSS emmène le contenu vers le haut (-100vh).
        // À la fin de l’animation (transitionend), on navigue.
      } else {
        // Retour en place
        setOffsetY(0);
      }
      setDragging(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Empêche le scroll “tirer pour rafraîchir” sur mobile
    const preventTouchScroll = (e) => {
      if (dragging) e.preventDefault();
    };
    el.addEventListener("touchmove", preventTouchScroll, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [dragging, unlocking, offsetY]);

  // Navigation après l’animation d’unlock
  const handleTransitionEnd = () => {
    if (!unlocking) return;
    const target = localStorage.getItem("locationBeforeLocked") || "/dashboard";
    // Optionnel : on peut vider la valeur pour éviter d’anciennes redirections
    localStorage.removeItem("locationBeforeLocked");
    navigate(target);
  };

  // Fallback bouton (tap/clic) pour déverrouiller
  const handleQuickUnlock = () => {
    setUnlocking(true);
  };

  // Expose la valeur au CSS via variable (pour le follow du drag)
  const styleVars = {
    "--offsetY": `${offsetY}px`,
    "--progress": `${Math.min(1, Math.max(0, Math.abs(offsetY) / UNLOCK_THRESHOLD_PX))}`,
  };

  return (
    <div
      ref={wrapRef}
      className={`lock-screen ${localStorage.getItem("theme") || ""} ${dragging ? "is-dragging" : ""} ${unlocking ? "is-unlocking" : ""}`}
      style={styleVars}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="lock-content">
        
        <GoldenLogo alt="texte logo 3" className="lock-screen-logo" />

        <div className="clock">{currentTime}</div>

        {/* Indicateur visuel “Glisser vers le haut” */}
        <div className="swipe-hint">
          {t("general.swipeUpToUnlock")}
        </div>

        {/* Bouton fallback (optionnel) */}
        <button
          className="lock-quick-unlock"
          onClick={handleQuickUnlock}
          aria-label={t("general.lockScreen")}
          title={t("general.lockScreen")}
        >
          🔓
        </button>

        <div className="lock-badge" aria-hidden="true">
  {/* Cadenas fermé */}
  <span className="lock-icon locked">🔒</span>

  {/* Cadenas ouvert */}
  <span className="lock-icon unlocked">🔓</span>
</div>


        




      </div>

      {/* Voile qui s’atténue pendant le drag */}
      <div className="lock-scrim" />
    </div>
  );
};

export default LockScreen;
