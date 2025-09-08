import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackLocation, SearchBar } from "@components";
import { ApiUnivers, ApiService, DroitAccess  } from "@service";
import { ffimg } from "@assets";
import "./UniversCardMembres.css";
import { FaCrown, FaFileAlt } from "react-icons/fa";

const ROLE_OPTIONS = [
  { value: -1, label: "En attente" },
  { value: 0, label: "Membre" },
  { value: 1, label: "Roleplayer" },
  { value: 2, label: "Maître du jeu" },
  { value: 3, label: "Admin" },
];

const ROLE_LABEL = {
  [-1]: "EN ATTENTE",
  [0]: "MEMBRE",
  [1]: "ROLEPLAYER",
  [2]: "MAITRE DU JEU",
  [3]: "ADMIN",
};

const UniversCardMembres = () => {
  const { id: universId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [busyIds, setBusyIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [sortBy, setSortBy] = useState("default"); // default | name | role
  const [friendIds, setFriendIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
    const [droit, setDroit] = useState(null);

  const loadMembers = useCallback(async () => {
    if (!universId) return;
    setLoading(true);
    try {
      const { data } = await ApiUnivers.getInscriptionUnivers(universId, {});
      // data peut être un tableau d'utilisateurs { id, pseudo, image, state }
      const list = Array.isArray(data) ? data : [];
      setMembers(list);
    } catch (e) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [universId]);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await ApiService.getUser();
        const id = user?.data?.id ?? user?.data?.userId ?? null;
        setCurrentUserId(id);
      } catch {}
      try {
        if (universId) {
          const res = await ApiUnivers.getDetailUnivers(universId);
          const data = res?.data || {};
          const inferredOwnerId = data.idOwner ?? data.ownerId ?? data.owner_id ?? data.owner?.id ?? data.owner?.userId ?? null;
          if (inferredOwnerId != null) setOwnerId(inferredOwnerId);
          // Détermination d'adhésion via le détail de l'univers (prioritaire)
          const membershipFromDetail = (
            data.youAreMember ??
            data.you_are_member ??
            data.youIn ??
            data.isMember ??
            data.joined ??
            (Array.isArray(data.members) && (currentUserId ? data.members.some((m) => (m.id ?? m.userId) === currentUserId) : undefined))
          );
          if (typeof membershipFromDetail === 'boolean') {
            setIsMember(membershipFromDetail);
          }
        }
      } catch {}
      try {
        const friends = await ApiService.getFriends();
        const setFriends = new Set((friends?.data || []).map((u) => u?.id ?? u?.userId ?? u?.friendId));
        setFriendIds(setFriends);
      } catch {}
      try {
        const req = await ApiService.getFriendsRequest();
        const setReq = new Set((req?.data || []).map((u) => u?.id ?? u?.userId ?? u?.targetId ?? u?.friendId));
        setRequestedIds(setReq);
      } catch {}
      await loadMembers();
    };
    init();
  }, [loadMembers]);

  useEffect(() => {
    const loadUniversRights = async () => {
      if (!universId) return;
      try {
        const res = await ApiUnivers.getDetailUnivers(universId);
        setDroit(res?.data?.droit);
      } catch {}
    };
    loadUniversRights();
  }, [universId]);

  useEffect(() => {
    if (!currentUserId) return;
    setIsMember(members.some((m) => m.id === currentUserId));
  }, [members, currentUserId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.pseudo, m.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [members, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "default") {
      return list; // ordre d'origine
    } else if (sortBy === "role") {
      list.sort((a, b) => Number(a.state ?? 0) - Number(b.state ?? 0) || String(a.pseudo || "").localeCompare(String(b.pseudo || "")));
    } else {
      list.sort((a, b) => String(a.pseudo || "").localeCompare(String(b.pseudo || "")) || Number(a.state ?? 0) - Number(b.state ?? 0));
    }
    return list;
  }, [filtered, sortBy]);

  const setBusy = (id, busy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleChangeRole = async (memberId, nextState) => {
    try {
      setBusy(memberId, true);
      await ApiUnivers.putInscriptionUnivers(universId, memberId, { state: nextState });
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, state: nextState } : m)));
    } catch (e) {
      // noop
    } finally {
      setBusy(memberId, false);
    }
  };

  const handleExclude = async (memberId) => {
    if (!window.confirm("Exclure cet utilisateur de l'univers ?")) return;
    try {
      setBusy(memberId, true);
      await ApiUnivers.deleteInscriptionUnivers(universId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      // noop
    } finally {
      setBusy(memberId, false);
    }
  };

  const handleAddFriend = async (memberId) => {
    try {
      setBusy(memberId, true);
      await ApiService.sendFriendsRequest({ userId: memberId });
      // Optionnel: feedback utilisateur
      setRequestedIds((prev) => new Set([...Array.from(prev), memberId]));
    } catch (e) {
      // noop
    } finally {
      setBusy(memberId, false);
    }
  };

  const handleToggleJoin = async () => {
    if (!universId) return;
    try {
      // rejoindre
      if (!isMember) {
        await ApiUnivers.postInscriptionUnivers(universId);
      } else if (currentUserId) {
        // quitter
        await ApiUnivers.deleteInscriptionUnivers(universId, currentUserId);
      }
      await loadMembers();
    } catch (e) {}
  };

  return (
    <div className="UniMe-container">
      <BackLocation />

      <div className="UniMe-header">
        <h1 className="UniMe-title">Membres</h1>
        <p className="UniMe-subtitle">Liste des membres de l'univers</p>
        <div className="UniMe-toolbar">
          <div className="UniMe-sort">
            <label htmlFor="unime-sort-select">Trier par</label>
            <select id="unime-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Défaut</option>
              <option value="name">Nom</option>
              <option value="role">Rôle</option>
            </select>
          </div>
          <div className="UniMe-search">
            <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="UniMe-loading">Chargement des membres…</div>
      ) : filtered.length === 0 ? (
        <div className="UniMe-empty">Aucun membre à afficher.</div>
      ) : (
        <section className="UniMe-list" aria-label="Liste des membres">
          {sorted.map((m) => (
            <article key={m.id} className="UniMe-item">
              <div className="UniMe-roleBg">{ROLE_LABEL[Number(m.state ?? 0)] || ""}</div>
              <div className="UniMe-avatarWrap">
                <div
                  className="UniMe-avatar"
                  style={{ backgroundImage: `url(${m.image || ffimg})` }}
                  role="img"
                  aria-label={m.pseudo}
                />
                {ownerId != null && m.id === ownerId && (
                  <div className="UniMe-crown" title="Owner">
                    <FaCrown />
                  </div>
                )}
              </div>
              <div className="UniMe-main">
                <div className="UniMe-name">{m.pseudo || `Utilisateur ${m.id}`}</div>
              </div>
              <div className="UniMe-actionsRow">

                {/* Gestion des demandes d'ami (caché si c'est moi) */}
                {m.id === currentUserId ? null : friendIds.has(m.id) ? null : requestedIds.has(m.id) ? (
                  <button
                    className="UniMe-chip"
                    disabled
                    title="Demande en attente"
                  >
                    Demande en attente
                  </button>
                ) : (
                  <button
                    className="UniMe-chip UniMe-friend"
                    onClick={() => handleAddFriend(m.id)}
                    disabled={busyIds.has(m.id)}
                    title="Ajouter en ami"
                  >
                    Ajouter en ami
                  </button>
                )}

                {/* Lien vers les fiches de l'utilisateur dans cet univers */}
                <button
                  className="UniMe-chip"
                  onClick={() => navigate(`/fiche/owner/${m.id}?idUnivers=${universId}`)}
                  title="Voir ses fiches"
                >
                  <FaFileAlt /> fiches
                </button>
                <div className="UniMe-roleSelect">
                  <select
                    value={Number(m.state ?? 0)}
                    onChange={(e) => handleChangeRole(m.id, Number(e.target.value))}
                    disabled={busyIds.has(m.id)}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                 {DroitAccess.isOwner(droit) && (
                <button
                  className="UniMe-chip UniMe-danger"
                  onClick={() => handleExclude(m.id)}
                  disabled={busyIds.has(m.id)}
                  title="Exclure du groupe"
                >
                  Exclure
                </button>
                 )}
              </div>
            </article>
          ))}
        </section>
      )}
      <button
        className={`UniMe-joinBtnDock ${isMember ? "leave" : "join"}`}
        onClick={handleToggleJoin}
        disabled={!universId}
        title={isMember ? "Quitter l'univers" : "Rejoindre l'univers"}
      >
        {isMember ? "Quitter l'univers" : "Rejoindre l'univers"}
      </button>
    </div>
  );
};

export default UniversCardMembres;


