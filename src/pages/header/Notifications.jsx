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
import { useTranslation } from "react-i18next";

const Notifications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("general");

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
          <h1>{t("titleNotification")}</h1>
          <span className="notif-counter">0</span>
        </div>

        <div className="notif-actions">
          <div className="tabs">
            <button
              className={`tab ${tab === "all" ? "is-active" : ""}`}
              onClick={() => setTab("all")}
            >
              {t("all")}
            </button>
            <button
              className={`tab ${tab === "unread" ? "is-active" : ""}`}
              onClick={() => setTab("unread")}
            >
              {t("unread")}
            </button>
          </div>

          <div className="filters">
            <button
              className="btn filter-btn"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
            >
              <FaFilter />
              {t("titleFiltres")}
            </button>
            {filterOpen && (
              <div className="filter-panel" role="menu">
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  {t("univers")}
                </label>
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  {t("fiches")}
                </label>
                <label className="check">
                  <input type="checkbox" />
                  {t("gmessages")}
                </label>
                <label className="check">
                  <input type="checkbox" />
                  {t("system")}
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
              <strong>{t("emailBis")}</strong>
              <span>{channels.email ? t("enabled") : t("disabled")}</span>
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
              <strong>{t("push")}</strong>
              <span>{channels.push ? t("enabled") : t("disabled")}</span>
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
              <strong>{t("discordBis")}</strong>
              <span>{channels.discord ? t("enabled") : t("disabled")}</span>
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
            <h2>{t("general.nothing")}</h2>
            <p>{t("general.text")}</p>
            <div className="empty-actions">
              <button className="btn primary" onClick={() => navigate("/config")}>
                <FaCheckCircle />
                {t("general.enableBtn")}
              </button>
              <button className="btn ghost" onClick={() => navigate("/friends")}>
                {t("general.inviteBtn")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
