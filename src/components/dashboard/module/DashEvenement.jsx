import React from "react";
import { banner } from "@assets"; 
import { DashBanner } from "@components"
import "./Dash.css";

const DashEvenement = () => {
  const events = [
    {
      title: "Tournoi de l'Arène",
      description: "Affrontez les meilleurs joueurs dans un tournoi sanglant.",
    },
    {
      title: "Marché de Minuit",
      description: "Objets rares et échanges secrets sous la lumière de la lune.",
    },
    {
      title: "Festival des Étoiles",
      description: "Un moment de paix et de lumière pour tous les rôlistes.",
    },
  ];

  return (
    <div className="dash-container">

      <DashBanner 
      image={banner} 
      title="Mes Événements" 
      className="dash-banev"/>

      <div className="dash-evenement-list">
        {events.map((evt, index) => (
          <div className="dash-evenement-card" key={index}>
            <h4>{evt.title}</h4>
            <p>{evt.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashEvenement;
