import React, { useState } from "react";
import "./Notifications.css";
import {
  FaBell,
  FaInbox,
  FaCheckCircle,
  FaFilter,
  FaEnvelope,
  FaMobileAlt,
  FaDiscord
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  // Onglets & filtres (placeholder pour future API)
  const [tab, setTab] = useState("all"); // "all" | "unread"
  const [filterOpen, setFilterOpen] = useState(false);
  const [channels, setChannels] = useState({
    email: true,
    push: true,
    discord: false,
  });

  // Simule une liste vide pour afficher l'empty state
  const notifications = []; // <- future data
  const hasNotifications = notifications.length > 0;

  const toggleChannel = (key) =>
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="notification-page">
      {/* Header sticky */}
      <div className="notif-header">
        <div className="notif-title">
          <FaBell />
          <h1>Notifications</h1>
          <span className="notif-counter">0</span>
        </div>

        <div className="notif-actions">
          <div className="tabs">
            <button
              className={`tab ${tab === "all" ? "is-active" : ""}`}
              onClick={() => setTab("all")}
            >
              Toutes
            </button>
            <button
              className={`tab ${tab === "unread" ? "is-active" : ""}`}
              onClick={() => setTab("unread")}
            >
              Non lues
            </button>
          </div>

          <div className="filters">
            <button
              className="btn filter-btn"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
            >
              <FaFilter />
              Filtres
            </button>
            {filterOpen && (
              <div className="filter-panel" role="menu">
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  Univers
                </label>
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  Fiches
                </label>
                <label className="check">
                  <input type="checkbox" />
                  Messages
                </label>
                <label className="check">
                  <input type="checkbox" />
                  Système
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bandeau préférences rapides */}
      <section className="notif-preferences">
        <div className="pref-card">
          <div className="pref-item" onClick={() => toggleChannel("email")} role="button" tabIndex={0}>
            <div className={`pref-icon ${channels.email ? "on" : ""}`}>
              <FaEnvelope />
            </div>
            <div className="pref-label">
              <strong>Email</strong>
              <span>{channels.email ? "Activé" : "Désactivé"}</span>
            </div>
            <div className={`pref-toggle ${channels.email ? "on" : ""}`}>
              <span />
            </div>
          </div>

          <div className="pref-item" onClick={() => toggleChannel("push")} role="button" tabIndex={0}>
            <div className={`pref-icon ${channels.push ? "on" : ""}`}>
              <FaMobileAlt />
            </div>
            <div className="pref-label">
              <strong>Push</strong>
              <span>{channels.push ? "Activé" : "Désactivé"}</span>
            </div>
            <div className={`pref-toggle ${channels.push ? "on" : ""}`}>
              <span />
            </div>
          </div>

          <div className="pref-item" onClick={() => toggleChannel("discord")} role="button" tabIndex={0}>
            <div className={`pref-icon ${channels.discord ? "on" : ""}`}>
              <FaDiscord />
            </div>
            <div className="pref-label">
              <strong>Discord</strong>
              <span>{channels.discord ? "Activé" : "Désactivé"}</span>
            </div>
            <div className={`pref-toggle ${channels.discord ? "on" : ""}`}>
              <span />
            </div>
          </div>
        </div>
      </section>

      {/* Contenu / Empty state */}
      <section className="notif-content">
        {hasNotifications ? (
          <div className="notif-list">
            {/* mapping futur des notifs */}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illu">
              <FaInbox />
            </div>
            <h2>Rien à signaler</h2>
            <p>
              Vous n’avez pas encore de notifications. Quand il y aura du
              nouveau, cela s’affichera ici.
            </p>
            <div className="empty-actions">
              <button className="btn primary" onClick={() => navigate("/config")}>
                <FaCheckCircle />
                Activer les notifications
              </button>
              <button className="btn ghost" onClick={() => navigate("/friends")}>
                Inviter des amis
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
