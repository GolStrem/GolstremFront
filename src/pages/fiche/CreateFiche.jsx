import React, { useState } from "react";
import { FicheEditModal } from "@components"; // <-- import de la modale séparée
import "./CreateFiche.css";

const CreateFiche = () => {
  const imgUrl = "https://i.pinimg.com/736x/e0/21/49/e021490dbdba45a9787df70673e1c4f3.jpg";

  const [data, setData] = useState({
    name: "Henel Aemue",
    race: "Ange",
    about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (updated) => {
    setData(updated);
  };

  return (
    <div className="cf-container">
      {/* Fond sable */}
      <div className="cf-right" aria-hidden="true" />

      {/* Image gauche oblique */}
      <div className="cf-left" aria-hidden="true">
        <img src={imgUrl} alt="Portrait décoratif" className="cf-img" />
      </div>

      {/* --------- CARD --------- */}
      <div className="cf-card">
        <div className="cf-content">
          <nav className="cf-tabs" aria-label="Sections de la fiche">
            <button className="cf-tab cf-tab--active">Général</button>
            <button className="cf-tab">Caractère</button>
            <button className="cf-tab">Pouvoir</button>
            <button className="cf-tab">Galerie</button>
            <button className="cf-tab">Histoire</button>
            <button className="cf-tab">Autre</button>
            <button className="cf-tab cf-tab--ghost" title="Ajouter un onglet">+</button>
          </nav>

          <header className="cf-header">
            <h1 className="cf-h1">{data.name}</h1>
            <p className="cf-meta">
              <span className="cf-rank">{data.age}</span>
              <span className="cf-dot">•</span>
              <span className="cf-date">20/03/1999</span>
            </p>
          </header>

          <section className="cf-text">
            <h2 className="cf-h2">À propos</h2>
            <p className="cf-about-display">{data.about}</p>
          </section>
        </div>

        {/* Colonne portrait */}
        <aside className="cf-portrait-float">
          <img src={imgUrl} alt="Portrait du personnage" />
        </aside>

        {/* Bouton Modifier en bas à droite */}
        <button className="cf-edit-btn" onClick={() => setIsModalOpen(true)}>
          ✏️ Modifier
        </button>
      </div>
      {/* --------- /CARD --------- */}

      {/* Tags */}
      <div className="cf-global-badges">
        <span className="cf-badge">DISCORD</span>
        <span className="cf-badge">SERVEUR ZHENEOS</span>
      </div>

      {/* Modale de modification */}
      {isModalOpen && (
        <FicheEditModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={data}
        />
      )}
    </div>
  );
};

export default CreateFiche;
