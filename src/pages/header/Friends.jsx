import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Friends.css";
import {
  FaUserFriends,
  FaSearch,
  FaUserPlus,
  FaUserMinus,
  FaTimes,
  FaCheck,
  FaEnvelope,
  FaFileAlt,
  FaGlobe
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ApiService } from "@service/"

const Friends = () => {
  const { t } = useTranslation("general");
  const navigate = useNavigate();

  const [tab, setTab] = useState("all"); // "all" | "requests"
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteSuccess, setInviteSuccess] = useState(undefined);
  const [inviteInput, setInviteInput] = useState("");


  // === Fetch initial friends & requests ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendsData = await ApiService.getFriends();
        const requestsData = await ApiService.getFriendsRequest();

        setFriends(friendsData.data || []);
        setRequests(requestsData.data || []);
      } catch (error) {
        console.error("Erreur lors du fetch des amis :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // === Filtrage par recherche ===
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.pseudo.toLowerCase().includes(q));
  }, [friends, search]);

  // === Actions ===
  const acceptRequest = async (id) => {
    try {
      await ApiService.sendFriendsRequest({ idReceiver: id });
      const req = requests.find((r) => r.id === id);
      if (!req) return;

      setRequests((prev) => prev.filter((r) => r.id !== id));
      setFriends((prev) => [{ id: req.id, pseudo: req.pseudo, avatar: req.avatar }, ...prev]);
    } catch (error) {
      console.error("Erreur lors de l'acceptation :", error);
    }
  };

  const declineRequest = async (id) => {
    try {
      await ApiService.deleteFriends(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Erreur lors du refus :", error);
    }
  };

  const removeFriend = async (id) => {
    try {
      await ApiService.deleteFriends(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleFicheClick = (friendId) => {
    navigate(`/fiches/owner/${friendId}`);
  };

  const handleUniversClick = (friendId) => {
    navigate(`/univers?param[filter][byFriend]=${friendId}`);
  };

const inviteFriend = async (e) => {
  e.preventDefault();
  const pseudo = inviteInput.trim();
  if (!pseudo) return;

  try {
    const res = await ApiService.getUserByPseudo(pseudo);
    const user = res.data[0];
    if (!user?.id) {
      console.error("Utilisateur introuvable");
      setInviteSuccess(false);
      return;
    }

    await ApiService.sendFriendsRequest({ idReceiver: user.id });

    // ✅ Feedback succès
    setInviteSuccess(true);

    // Reset du champ
    setInviteInput("");

    // Supprime le message après 2s
    setTimeout(() => setInviteSuccess(undefined), 2000);
  } catch (error) {
    console.error("Erreur lors de l'invitation :", error);
    setInviteSuccess(false);
    
    // Supprime le message d'erreur après 2s
    setTimeout(() => setInviteSuccess(undefined), 2000);
  }
};



  if (loading) return <p>{t("general.loading")}…</p>;

  const hasFriends = filteredFriends.length > 0;
  const hasRequests = requests.length > 0;

  return (
    <div className="fr-page">
      {/* Header */}
      <div className="fr-header">
        <div className="fr-header-left">
          <FaUserFriends />
          <h1>{t("titleFriend")}</h1>
          <span className="fr-badge">{friends.length}</span>
        </div>

        <div className="fr-header-right">
          <div className="fr-tabs">
            <button
              className={`fr-tab ${tab === "all" ? "is-active" : ""}`}
              onClick={() => setTab("all")}
            >
              {t("all")}
            </button>
            <button
              className={`fr-tab ${tab === "requests" ? "is-active" : ""}`}
              onClick={() => setTab("requests")}
            >
              {t("requests")} {hasRequests ? <span className="fr-dot" /> : null}
            </button>
          </div>

          <div className="fr-searchbar">
            <FaSearch />
            <input
              type="text"
              placeholder={t("general.searchPlaceholderFriend")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invitation rapide */}
      <section className="fr-actions">
        <form className="fr-invite-card" onSubmit={inviteFriend}>
          <div className="fr-ic-icon">
            <FaUserPlus />
          </div>
          <div className="fr-ic-body">
            <strong>{t("general.inviteTitle")}</strong>
            <span>{t("general.inviteSubtitle")}</span>
          </div>
          <input
            name="invite"
            className={`fr-ic-input ${
              inviteSuccess === true
                ? "success"
                : inviteSuccess === false
                ? "error"
                : ""
            }`}
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder={t("general.invitePlaceholder")}
          />
          <button className="fr-btn fr-primary" type="submit">
            {t("send")}
          </button>
        </form>
      </section>
      
      {inviteSuccess === true && (
            <span className="invite-success-message">{t("general.inviteSuccess")}</span>
          )}
          {inviteSuccess === false && (
            <span className="invite-error-message">{t("general.inviteError")}</span>
          )}


      {/* Contenu */}
      <section className="fr-content">
        <h2 className="fr-h2">{t("general.sectionTitle")}</h2>

        {tab === "requests" ? (
          hasRequests ? (
            <div className="fr-request-list">
              {requests.map((r) => (
                <article className="fr-request-item" key={r.id}>
                  <div className="fr-avatar">
                    {r.image ? (
                      <img src={r.image} alt={r.pseudo} />
                    ) : (
                      <div className="fr-avatar-fallback">{r.pseudo[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div className="fr-ri-body">
                    <strong>{r.pseudo}</strong>
                    <span>{t("general.requestText")}</span>
                  </div>
                  <div className="fr-ri-actions">
                    <button className="fr-btn fr-success" onClick={() => acceptRequest(r.id)}>
                      <FaCheck /> {t("accept")}
                    </button>
                    <button className="fr-btn fr-ghost" onClick={() => declineRequest(r.id)}>
                      <FaTimes /> {t("refuse")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="fr-empty-state">
              <div className="fr-empty-icon"><FaEnvelope /></div>
              <h2>{t("general.noRequestsTitle")}</h2>
              <p>{t("general.noRequestsText")}</p>
            </div>
          )
        ) : hasFriends ? (
          <div className="fr-grid">
            {filteredFriends.map((f) => (
              <article className="fr-card" key={f.id}>
                <div className="fr-card-top">
                  <div className="fr-avatar-wrap">
                    {f.image ? (
                      <img src={f.image} alt={f.pseudo} />
                    ) : (
                      <div className="fr-avatar-fallback">{f.pseudo[0]?.toUpperCase()}</div>
                    )}
                  </div>

                  <div className="fr-info">
                    <strong className="fr-name">{f.pseudo}</strong>
                  </div>
                </div>

                <div className="fr-actions-row">
                  <button className="fr-btn fr-btn--fiche" onClick={() => handleFicheClick(f.id)}>
                    <FaFileAlt /> {t("general.fiche")}
                  </button>
                  <button className="fr-btn fr-btn--univers" onClick={() => handleUniversClick(f.id)}>
                    <FaGlobe /> {t("general.univers")}
                  </button>
                  <button className="fr-btn" onClick={() => removeFriend(f.id)}>
                    <FaUserMinus /> {t("remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="fr-empty-state">
            <div className="fr-empty-icon"><FaUserFriends /></div>
            <h2>{t("general.noFriendsTitle")}</h2>
            <p>{t("general.noFriendsText")}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Friends;
