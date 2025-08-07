import React, { useEffect } from "react";



const BaseModal = ({ onClose, className = "", children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div
        className={`tm-modal-popup ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
      <button className="tm-modal-close" onClick={onClose}>
        ✖
      </button>

        {children}
      </div>
    </div>
  );
};

export default BaseModal;
