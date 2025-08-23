import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { BiCopy } from "react-icons/bi";
import { useTranslation } from "react-i18next";

import "./FicheCardMenu.css";

const FicheCardMenu = ({ onEdit, onDuplicate, onDelete }) => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Utilisation optimisée des icônes


  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="card-menu-wrapper" ref={menuRef}>
      <button className="card-menu-button" onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}>
        <FaEllipsisV />
      </button>

      {open && (
        <div className="card-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          <div onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }} className="ficheBouton">✏️ {t("edit")}</div>
          <div onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }} className="ficheBouton"> <BiCopy />&nbsp; {t("duplicate")}</div>
          <div onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }} className="ficheBouton">🗑️ {t("delete")}</div>
        </div>
      )}
    </div>
  );
};

export default FicheCardMenu;