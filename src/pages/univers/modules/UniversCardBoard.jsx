import React, { useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardBoard.css";
import { BackLocation } from "@components";

const ITEMS = [
  { id: 1, type: "Quête", title: "Quête magique", description: "Résoudre l’énigme du vieux mage.", status: "En attente de joueur", date: null, image: "https://i.pinimg.com/736x/50/43/61/504361f450ac78d5cfcb3ce09a365d22.jpg" },
  { id: 2, type: "Événement", title: "Festival annuel", description: "Célébration dans le village central.", status: "Bientôt", date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },
  { id: 3, type: "Ouverture", title: "Nouveau café", description: "Ouverture d’un café artisanal.", status: "Bientôt", date: "2025-09-20 10:00", image: "https://i.pinimg.com/736x/53/83/d4/5383d4dd98bd9439d458969b81af0a6e.jpg" },
  { id: 4, type: "Quête", title: "Chasse au trésor", description: "Trouver les gemmes cachées.", status: "En cours", date: null, image: "https://i.pinimg.com/736x/57/38/b8/5738b8c8e930e00dd44ed4370183c3bd.jpg" },
  { id: 5, type: "Événement", title: "Concert en ville", description: "Performance des musiciens locaux.", status: "Terminé", date: "2025-09-10 20:00", image: "https://i.pinimg.com/736x/27/38/e9/2738e97cc2938e9b26d8cb34401e8e8c.jpg" },
  { id: 6, type: "Ouverture", title: "Nouvelle bibliothèque", description: "Bibliothèque ouverte au public.", status: "En cours", date: "2025-09-15 09:00", image: "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg" },
  { id: 7, type: "Événement", title: "Concert en ville", description: "Performance des musiciens locaux.", status: "Terminé", date: "2025-09-10 20:00", image: "https://i.pinimg.com/736x/27/38/e9/2738e97cc2938e9b26d8cb34401e8e8c.jpg" },
  { id: 8, type: "Ouverture", title: "Nouvelle bibliothèque", description: "Bibliothèque ouverte au public.", status: "En cours", date: "2025-09-15 09:00", image: "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg" },
  { id: 9, type: "Événement", title: "Festival annuel", description: "Célébration dans le village central.", status: "Bientôt", date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },
  { id: 10, type: "Événement", title: "Festival annuel", description: "Célébration dans le village central.", status: "Bientôt", date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },

];

const TYPE_COLORS = {
  "Quête": "#3498db",
  "Événement": "#2ecc71",
  "Ouverture": "#f7d038"
};

const STATUS_COLORS = {
  "En attente de joueur": "#e67e22",
  "En cours": "#3498db",
  "Terminé": "#95a5a6",
  "En attente": "#f39c12",
  "Bientôt": "#9b59b6"
};

const FILTERS_TYPE = ["All", "Quête", "Événement", "Ouverture"];
const FILTERS_STATUS = ["All", "En attente de joueur", "En cours", "Terminé", "En attente", "Bientôt"];
const FILTERS_DATE = ["Tous", "Nouveaux", "Bientôt"];

const UniversCardBoard = () => {
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("Tous");

  const now = new Date();

  const filteredItems = ITEMS.filter(item => {
    const matchType = filterType === "All" || item.type === filterType;
    const matchStatus = filterStatus === "All" || item.status === filterStatus;

    let matchDate = true;
    if(filterDate === "Nouveaux") {
      matchDate = !item.date || new Date(item.date) <= now;
    } else if(filterDate === "Bientôt") {
      matchDate = item.date && new Date(item.date) > now;
    }

    return matchType && matchStatus && matchDate;
  });

  const breakpointColumnsObj = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="UniBo-container">
      <BackLocation />
      <h2 className="UniBo-title">Tableau d'affichage</h2>

      <div className="UniBo-filters">
        <div className="UniBo-filter-group">
          <span className="spanC">Type:</span>
          {FILTERS_TYPE.map(f => (
            <button key={f} className={`UniBo-filter-btn ${filterType===f?"active":""}`} onClick={() => setFilterType(f)}>{f}</button>
          ))}
        </div>

        <div className="UniBo-filter-group">
          <span className="spanC">Status:</span>
          {FILTERS_STATUS.map(f => (
            <button key={f} className={`UniBo-filter-btn ${filterStatus===f?"active":""}`} onClick={() => setFilterStatus(f)}>{f}</button>
          ))}
        </div>

        <div className="UniBo-filter-group">
          <span className="spanC">Date:</span>
          {FILTERS_DATE.map(f => (
            <button key={f} className={`UniBo-filter-btn ${filterDate===f?"active":""}`} onClick={() => setFilterDate(f)}>{f}</button>
          ))}
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="UniBo-masonry-grid"
        columnClassName="UniBo-masonry-grid_column"
      >
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="UniBo-card">
              <div className="UniBo-card-image-wrapper">
                <img src={item.image} alt={item.title} className="UniBo-card-image"/>
                <div className="UniBo-card-overlay">
                  <p>{item.description}</p>
                </div>
              </div>
              <div className="UniBo-card-content">
                <h3 className="UniBo-card-title">{item.title}</h3>
                <div className="UniBo-card-badges">
                  <motion.span
                    key={item.type + item.id + filterType}
                    className="UniBo-card-type"
                    style={{backgroundColor: TYPE_COLORS[item.type]}}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {item.type}
                  </motion.span>

                  {item.status && (
                    <motion.span
                      key={item.status + item.id + filterStatus}
                      className="UniBo-card-status"
                      style={{backgroundColor: STATUS_COLORS[item.status]}}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {item.status}
                    </motion.span>
                  )}

                  {item.date && <span className="UniBo-card-date">{new Date(item.date).toLocaleString()}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </Masonry>
    </div>
  );
};

export default UniversCardBoard;
