import React, { useEffect, useState } from "react";
import { BackLocation } from "@components";
import { useParams } from "react-router-dom";
import { ApiUnivers, useNavigatePage } from "@service";
import "./UniversCardAdministration.css";
import { useTranslation } from "react-i18next";

const UniversCardAdministration = () => {
  const { t } = useTranslation('univers');
  const { id: universId } = useParams();
  const navigate = useNavigatePage();
  const [universName, setUniversName] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      try {
        if (!universId) return;
        const res = await ApiUnivers.getDetailUnivers(universId);
        setUniversName(res?.data?.name || "Univers");
      } catch (e) {
        setUniversName("Univers");
      }
    };
    fetchName();
  }, [universId]);

  return (
    <div className="UniAd-container">
      <BackLocation />
      
      <div className="UniAd-header">
        <h1 className="UniAd-h1">{t('admin.title', { name: universName })}</h1>
        <p className="UniAd-subtitle">
          {t('admin.subtitle')}
        </p>
      </div>

      <div className="UniAd-buttons-wrapper">
        <div className="UniAd-Boite-bouton">
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/univers/${universId}/membres`)}
          >
            {t('admin.buttons.members')}
          </button>
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/univers/${universId}/opening`)}
          >
            {t('admin.buttons.opening')}
          </button>
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/fiches/univers/${universId}/modelFiche`)}
          >
            {t('admin.buttons.models')}
          </button>
        </div>
      </div>
    </div>

  );
};

export default UniversCardAdministration;
