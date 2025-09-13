import React, { useEffect, useState } from "react";
import { BackLocation } from "@components";
import { useParams } from "react-router-dom";
import { ApiUnivers, useNavigatePage } from "@service";
import "./UniversCardAdministration.css";

const UniversCardAdministration = () => {
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
        <h1 className="UniAd-h1">Administration {universName}</h1>
        <p className="UniAd-subtitle">
          Ici, vous pouvez gérer tous les réglages liés à cet univers : membres, ouverture et modèles de fiches.
        </p>
      </div>

      <div className="UniAd-buttons-wrapper">
        <div className="UniAd-Boite-bouton">
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/univers/${universId}/membres`)}
          >
            Membres
          </button>
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/univers/${universId}/opening`)}
          >
            Ouverture / Inscription
          </button>
          <button
            type="button"
            className="UniAd-bouton"
            onClick={() => navigate(`/fiches/univers/${universId}/modelFiche`)}
          >
            Modèle Fiche
          </button>
        </div>
      </div>
    </div>

  );
};

export default UniversCardAdministration;
