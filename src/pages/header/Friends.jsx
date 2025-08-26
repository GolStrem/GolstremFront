import React, { useMemo, useState } from "react";
import "./Friends.css";
import {
  FaUserFriends,
  FaSearch,
  FaUserPlus,
  FaUserMinus,
  FaBan,
  FaTimes,
  FaCheck,
  FaEllipsisH,
  FaEnvelope,
  FaFileAlt,
  FaGlobe
} from "react-icons/fa";

const mockFriends = [
  { id: 1, pseudo: "Henel", avatar: null },
  { id: 2, pseudo: "Hemae", avatar: null },
  { id: 3, pseudo: "Zheneos", avatar: null },
  { id: 4, pseudo: "Riven", avatar: null },
];

const mockRequests = [
  { id: 11, pseudo: "Kara", avatar: null },
  { id: 12, pseudo: "Alen", avatar: null },
];

const Friends = () => {
  const [tab, setTab] = useState("all"); // "all" | "requests"
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState(mockFriends);
  const [requests, setRequests] = useState(mockRequests);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = friends;
    if (q) list = list.filter((f) => f.pseudo.toLowerCase().includes(q));
    return list;
  }, [friends, search]);

  const acceptRequest = (id) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setFriends((prev) => [{ id: Date.now(), pseudo: req.pseudo, avatar: null }, ...prev]);
  };

  const declineRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const removeFriend = (id) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const blockFriend = (id) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  const inviteFriend = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("invite") || "").trim();
    if (!value) return;
    console.log("Invite/search by pseudo:", value);
    e.currentTarget.reset();
  };

  const hasFriends = filteredFriends.length > 0;
  const hasRequests = requests.length > 0;

  return (
    <div className="fr-page">
      {/* Header */}
      <div className="fr-header">
        <div className="fr-header-left">
          <FaUserFriends />
          <h1>Amis</h1>
          <span className="fr-badge">{friends.length}</span>
        </div>

        <div className="fr-header-right">
          <div className="fr-tabs">
            <button
              className={`fr-tab ${tab === "all" ? "is-active" : ""}`}
              onClick={() => setTab("all")}
            >
              Tous
            </button>
            <button
              className={`fr-tab ${tab === "requests" ? "is-active" : ""}`}
              onClick={() => setTab("requests")}
            >
              Demandes {hasRequests ? <span className="fr-dot" /> : null}
            </button>
          </div>

          <div className="fr-searchbar">
            <FaSearch />
            <input
              type="text"
              placeholder="Rechercher un ami…"
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
            <strong>Inviter un ami</strong>
            <span>Par pseudo</span>
          </div>
          <input
            name="invite"
            className="fr-ic-input"
            type="text"
            placeholder="Ex. Kara#1234"
          />
          <button className="fr-btn fr-primary" type="submit">Envoyer</button>
        </form>
      </section>

      {/* Contenu */}
      <section className="fr-content">
        {tab === "requests" ? (
          hasRequests ? (
            <div className="fr-request-list">
              {requests.map((r) => (
                <article className="fr-request-item" key={r.id}>
                  <div className="fr-avatar">
                    {r.avatar ? (
                      <img src={r.avatar} alt={r.pseudo} />
                    ) : (
                      <div className="fr-avatar-fallback">{r.pseudo[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div className="fr-ri-body">
                    <strong>{r.pseudo}</strong>
                    <span>Souhaite vous ajouter</span>
                  </div>
                  <div className="fr-ri-actions">
                    <button className="fr-btn fr-success" onClick={() => acceptRequest(r.id)}>
                      <FaCheck /> Accepter
                    </button>
                    <button className="fr-btn fr-ghost" onClick={() => declineRequest(r.id)}>
                      <FaTimes /> Refuser
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="fr-empty-state">
              <div className="fr-empty-icon"><FaEnvelope /></div>
              <h2>Aucune demande</h2>
              <p>Quand quelqu’un vous enverra une demande, elle s’affichera ici.</p>
            </div>
          )
        ) : hasFriends ? (
          <div className="fr-grid">
            {filteredFriends.map((f) => (
              <article className="fr-card" key={f.id}>
                <div className="fr-card-top">
                  <div className="fr-avatar-wrap">
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.pseudo} />
                    ) : (
                      <div className="fr-avatar-fallback">{f.pseudo[0]?.toUpperCase()}</div>
                    )}
                  </div>

                  <div className="fr-info">
                    <strong className="fr-name">{f.pseudo}</strong>
                  </div>
                </div>

                <div className="fr-actions-row">
                  <button className="fr-btn fr-btn--fiche">
                    <FaFileAlt /> Fiche
                  </button>
                  <button className="fr-btn fr-btn--univers">
                    <FaGlobe /> Univers
                  </button>
                  <button className="fr-btn" onClick={() => removeFriend(f.id)}>
                    <FaUserMinus /> Retirer
                  </button>
                  <button className="fr-btn fr-danger" onClick={() => blockFriend(f.id)}>
                    <FaBan /> Bloquer
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="fr-empty-state">
            <div className="fr-empty-icon"><FaUserFriends /></div>
            <h2>Aucun ami pour le moment</h2>
            <p>Invitez vos amis pour commencer à jouer et à échanger ensemble.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Friends;
