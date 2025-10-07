// Shop.jsx
import React, { useState } from "react";
import "./Shop.css";
import "./Config.css";

const offers = [
  {
    title: "Support",
    price: "5€/mois",
    description: "Accès à du contenu exclusif et mises à jour régulières",
    bonuses: [
      "Accès aux coulisses",
      "Badges spéciaux",
      "Accès aux archives"
    ]
  },
  {
    title: "Membre",
    price: "10€/mois",
    description: "Profitez de plus de contenu et de bonus exclusifs",
    bonuses: [
      "Tout ce que contient Supporter",
      "Contenu exclusif mensuel",
      "Vote sur les prochains projets"
    ]
  },
  {
    title: "Créateur",
    price: "25€/mois",
    description: "Le top du soutien avec tous les bonus inclus",
    bonuses: [
      "Tout ce que contient Patron",
      "Appels privés mensuels",
      "Accès anticipé aux nouveautés",
      "Mention spéciale dans les crédits"
    ]
  }
];

const Shop = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);

  return (
    <div className="parametre-page">
      <aside className="parametre-sidebar">SHOP</aside> 
        <div className="shop-page">
          <h1 className="shop-title">Nos Offres</h1>
          <div className="shop-offers">
            {offers.map((offer, idx) => (
              <div
                className="shop-offer-card"
                key={idx}
                onClick={() => setSelectedOffer(offer)}
              >
                <h2 className="offer-title">{offer.title}</h2>
                <p className="offer-price">{offer.price}</p>
                <p className="offer-description">{offer.description}</p>
              </div>
            ))}
          </div>

          {selectedOffer && (
            <div className="modal-overlay" onClick={() => setSelectedOffer(null)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()} // stop la propagation pour pas fermer
              >
                <h2>{selectedOffer.title}</h2>
                <p className="modal-price">{selectedOffer.price}</p>
                <p>{selectedOffer.description}</p>
                <ul className="modal-bonuses">
                  {selectedOffer.bonuses.map((bonus, idx) => (
                    <li key={idx}>
                      <span className="bonus-dot">•</span> {bonus}
                    </li>
                  ))}
                </ul>
                <button className="offer-button">Souscrire</button>
                <button
                  className="modal-close"
                  onClick={() => setSelectedOffer(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default Shop;
