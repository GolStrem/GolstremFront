import React from "react";
import { useIcon } from "../../utils/iconImports";
import { useTranslation } from "react-i18next";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, onClear }) => {
  const { t } = useTranslation("general");

  // Utilisation optimisée des icônes
  const { Icon: CloseIcon } = useIcon('Close', 'Io');

  return (
    <div className="tm-search-wrapper">
      <input
        type="text"
        placeholder={t("general.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={t("general.searchPlaceholder")} 
      />
      {value && (
        <button
          className="tm-search-clear"
          onClick={onClear}
          title={t("general.clear")}
          aria-label={t("general.clear")}
        >
          {CloseIcon && <CloseIcon size={18} />}
        </button>
      )}
    </div>
  );
};

export default SearchBar;
