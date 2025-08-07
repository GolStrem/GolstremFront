import React from "react";
import { IoClose } from "react-icons/io5";
import "./SearchBar.css"; 

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="tm-search-wrapper">
      <input
        type="text"
        placeholder="Rechercher"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {value && (
        <button
          className="tm-search-clear"
          onClick={onClear}
          title="Effacer"
        >
          <IoClose size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
