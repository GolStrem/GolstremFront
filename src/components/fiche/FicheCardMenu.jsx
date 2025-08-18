import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { BiCopy } from "react-icons/bi";

import "./FicheCardMenu.css";

const FicheCardMenu = ({ onEdit, onDuplicate, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

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
          }} className="ficheBouton">✏️ Modifier</div>
          <div onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }} className="ficheBouton"> <BiCopy />&nbsp; Dupliquer</div>
          <div onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }} className="ficheBouton">🗑️ Supprimer</div>
        </div>
      )}
    </div>
  );
};

export default FicheCardMenu;