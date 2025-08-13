import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoldenLogo } from "@assets";
import { useNavigate } from "react-router-dom";
import "./LockScreen.css";
import "./Dashboard.css";
import { LockScreenBackgroundModal } from "@components";
import { UserInfo } from "@service";

const UNLOCK_THRESHOLD_PX = 140; // distance à tirer vers le haut pour déverrouiller
const DRAG_THRESHOLD_PX = 10; // seuil minimum de déplacement pour activer le drag

const LockScreen = () => {
  const { t } = useTranslation("general");
  const [currentTime, setCurrentTime] = useState("");
  const [dragging, setDragging] = useState(false);
  const [offsetY, setOffsetY] = useState(0); // négatif quand on tire vers le haut
  const [unlocking, setUnlocking] = useState(false);
  const [dragStarted, setDragStarted] = useState(false); // pour tracker si le drag a vraiment commencé

  const [showModal, setShowModal] = useState(false);

  const [lightUrl, setLightUrl] = useState('');
  const [darkUrl, setDarkUrl] = useState('');
  const [hideClock, setHideClock] = useState(0);

  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const startYRef = useRef(0);

  useEffect(() => {
    const fetchLockImage = async () => {
      try {
        setLightUrl(await UserInfo.get("lightLock"))
        setDarkUrl(await UserInfo.get("darkLock"))
        setHideClock(await UserInfo.get('hideClock'))
      } catch (err) {
      }
    };
    fetchLockImage();
  }, []);

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
      if (unlocking || showModal) return;
      
      // Vérifier si on clique sur un bouton ou un élément cliquable
      const target = e.target;
      const isClickable = target.closest('button') || 
                         target.closest('[role="button"]') || 
                         target.closest('.change-banner-btn-mod') ||
                         target.closest('.lock-quick-unlock') ||
                         target.closest('.modal-overlay') ||
                         target.closest('.modal-content') ||
                         target.closest('.tmedit') ||
                         target.closest('input') ||
                         target.closest('label') ||
                         target.closest('form');
      
      if (isClickable) {
        // Ne pas activer le drag pour les éléments cliquables
        return;
      }
      
      setDragging(true);
      setDragStarted(false);
      startYRef.current = e.clientY ?? (e.touches?.[0]?.clientY || 0);
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragging || unlocking || showModal) return;
      const y = e.clientY ?? (e.touches?.[0]?.clientY || 0);
      const delta = y - startYRef.current; // négatif si on monte
      
      // Vérifier si on a dépassé le seuil pour activer le drag
      if (!dragStarted && Math.abs(delta) >= DRAG_THRESHOLD_PX) {
        setDragStarted(true);
      }
      
      // Seulement appliquer le déplacement si le drag a vraiment commencé
      if (dragStarted) {
        const clamped = Math.max(-window.innerHeight, Math.min(0, delta));
        setOffsetY(clamped);
        
        // Déclenche le déverrouillage dès qu'on atteint 70% de la hauteur de la page
        const unlockTriggerHeight = window.innerHeight * 0.7;
        if (Math.abs(clamped) >= unlockTriggerHeight && !unlocking) {
          setUnlocking(true);
        }
      }
    };

    const onPointerUp = () => {
      if (!dragging || unlocking || showModal) return;

      // Si le drag a commencé et qu'on a tiré suffisamment vers le haut, on lance l'animation d'unlock
      if (dragStarted && Math.abs(offsetY) >= UNLOCK_THRESHOLD_PX) {
        setUnlocking(true);
        // L'animation CSS emmène le contenu vers le haut (-100vh).
        // À la fin de l'animation (transitionend), on navigue.
      } else if (dragStarted) {
        // Retour en place seulement si le drag avait commencé
        setOffsetY(0);
      }
      setDragging(false);
      setDragStarted(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Empêche le scroll "tirer pour rafraîchir" sur mobile seulement si le drag a commencé
    const preventTouchScroll = (e) => {
      if (dragStarted && !showModal) e.preventDefault();
    };
    el.addEventListener("touchmove", preventTouchScroll, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [dragging, unlocking, offsetY, dragStarted, showModal]);

  // Navigation après l'animation d'unlock
  const handleTransitionEnd = () => {
    if (!unlocking) return;
    const target = localStorage.getItem("locationBeforeLocked") || "/dashboard";
    // Optionnel : on peut vider la valeur pour éviter d'anciennes redirections
    localStorage.removeItem("locationBeforeLocked");
    navigate(target);
  };

  // Gestion du background personnalisé pour le thème light
  useEffect(() => {
    
    // Supprimer l'ancien style s'il existe
    const existingStyle = document.getElementById('lock-screen-custom-style');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    // Créer le nouveau style seulement si on a des URLs
    if (lightUrl || darkUrl) {
      const style = document.createElement("style");
      style.id = 'lock-screen-custom-style';
      style.textContent = `
        ${darkUrl ? `.lock-screen.dark { background-image: url('${darkUrl}'); }` : ''}
        ${lightUrl ? `.lock-screen.light { background-image: url('${lightUrl}'); }` : ''}
      `;
      document.head.appendChild(style);
    }
  }, [lightUrl, darkUrl]);

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

        {hideClock == 0 && <div className="clock">{currentTime}</div>}

        {/* Indicateur visuel "Glisser vers le haut" */}
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

            
          <button
            className="change-banner-btn-mod"
            onClick={() => setShowModal(true)}
          >
            ✎
          </button>




      </div>

      <div className="lock-scrim" />
      {showModal && (
        <LockScreenBackgroundModal
          onCancel={() => setShowModal(false)}
          lightUrl={lightUrl}
          darkUrl={darkUrl}
          hideClock={hideClock}
          setLightUrl={setLightUrl}
          setDarkUrl={setDarkUrl}
          setHideClock={setHideClock}
        />
      )}
    </div>
    
  );
};

export default LockScreen;
