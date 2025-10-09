// Shop.jsx
import React, { useEffect, useState } from "react";
import "./Shop.css";
import "./Config.css";
import { ApiService } from "@service";

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
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const offerToProduct = (title) => {
    switch (title) {
      case "Support":
        return "STRIPE_PRODUCT_1";
      case "Membre":
        return "STRIPE_PRODUCT_2";
      case "Créateur":
        return "STRIPE_PRODUCT_3";
      default:
        return "STRIPE_PRODUCT_1";
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await ApiService.stripeGetSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de récupérer vos abonnements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubscribe = async (offer) => {
    if (!offer) return;
    try {
      setLoading(true);
      setError("");
      const typeSubscription = offerToProduct(offer.title);
      const response = await ApiService.stripeSubscribe(typeSubscription);
      const url = response?.data?.url || response?.data?.checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      // Si pas de redirection, on rafraîchit la liste et ferme la modale
      await fetchSubscriptions();
      setSelectedOffer(null);
    } catch (e) {
      setError("La souscription a échoué. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (subscribeId) => {
    if (!subscribeId) return;
    try {
      setLoading(true);
      setError("");
      await ApiService.stripeCancelSubscription(subscribeId);
      await fetchSubscriptions();
    } catch (e) {
      setError("La résiliation a échoué. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parametre-page">
      <aside className="parametre-sidebar">SHOP</aside> 
        <div className="shop-page">
          <h1 className="shop-title">Nos Offres</h1>
          {error && <div className="shop-error">{error}</div>}
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
                <button className="offer-button" onClick={() => handleSubscribe(selectedOffer)} disabled={loading}>
                  {loading ? "Chargement..." : "Souscrire"}
                </button>
                <button
                  className="modal-close"
                  onClick={() => setSelectedOffer(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <div className="shop-subs">
            <h2 className="shop-sub-title">Vos abonnements</h2>
            {loading && subscriptions.length === 0 ? (
              <div className="shop-loading">Chargement...</div>
            ) : subscriptions.length === 0 ? (
              <div className="shop-empty">Aucun abonnement actif.</div>
            ) : (
              <ul className="shop-sub-list">
                {subscriptions.map((sub) => {
                  const pendingCancel = !!sub.deletedAt;
                  return (
                    <li key={sub.id} className="shop-sub-item">
                      <div className="shop-sub-info">
                        <span className="shop-sub-type">{sub.type}</span>
                        {pendingCancel ? (
                          <span className="shop-sub-status">Fin le {(new Date(sub.availableAt)).toLocaleDateString()}</span>
                        ) : (
                          <span className="shop-sub-status active">Actif</span>
                        )}
                      </div>
                      <div className="shop-sub-actions">
                        <button
                          className="shop-sub-cancel"
                          onClick={() => handleCancel(sub.id)}
                          disabled={pendingCancel || loading}
                        >
                          {pendingCancel ? "Résiliation programmée" : "Résilier"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
    </div>
  );
};

export default Shop;
