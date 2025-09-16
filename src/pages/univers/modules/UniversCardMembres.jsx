import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackLocation, SearchBar } from "@components";
import { ApiUnivers, ApiService, DroitAccess, Capitalize  } from "@service";
import { ff } from "@assets";
import "./UniversCardMembres.css";
import { FaCrown, FaFileAlt, FaEllipsisH } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('univers');
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
  const [mobileOpenId, setMobileOpenId] = useState(null);

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
    if (!window.confirm(t('members.excludeConfirm'))) return;
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

  const toggleMobileMenu = (memberId) => {
    setMobileOpenId((prev) => (prev === memberId ? null : memberId));
  };

  return (
    <div className="UniMe-container">
      <BackLocation />

      <div className="UniMe-header">
        <h1 className="UniMe-title">{t('members.title')}</h1>
        <p className="UniMe-subtitle">{t('members.subtitle')}</p>
        <div className="UniMe-toolbar">
          <div className="UniMe-sort">
            <label htmlFor="unime-sort-select">{t('members.sortBy')}</label>
            <select id="unime-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">{t('members.sort_default')}</option>
              <option value="name">{t('members.sort_name')}</option>
              <option value="role">{t('members.sort_role')}</option>
            </select>
          </div>
          <div className="UniMe-search">
            <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="UniMe-loading">{t('members.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="UniMe-empty">{t('members.empty')}</div>
      ) : (
        <section className="UniMe-list" aria-label={t('members.title')}>
          {sorted.map((m) => (
            <article key={m.id} className={`UniMe-item ${mobileOpenId === m.id ? 'is-open' : ''}`}>
              <div className="UniMe-roleBg">{t(`members.rolesUpper.${Number(m.state ?? 0)}`) || ""}</div>
              <div className="UniMe-avatarWrap">
                <div
                  className="UniMe-avatar"
                  style={{ backgroundImage: `url(${m.image || ff})` }}
                  role="img"
                  aria-label={m.pseudo}
                />
                {ownerId != null && m.id === ownerId && (
                  <div className="UniMe-crown" title={t('members.owner')}>
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
                    title={t('members.pendingRequest')}
                  >
                    {t('members.pendingRequest')}
                  </button>
                ) : (
                  <button
                    className="UniMe-chip UniMe-friend"
                    onClick={() => handleAddFriend(m.id)}
                    disabled={busyIds.has(m.id)}
                    title={t('members.addFriend')}
                  >
                    {t('members.addFriend')}
                  </button>
                )}

                {/* Lien vers les fiches de l'utilisateur dans cet univers */}
                <button
                  className="UniMe-chip"
                  onClick={() => navigate(`/fiches/owner/${m.id}?idUnivers=${universId}`)}
                  title={t('members.viewSheets')}
                >
                  <FaFileAlt /> {t('members.sheets')}
                </button>
                {DroitAccess.isOwner(droit) ? (
                  <div className="UniMe-roleSelect">
                    <select
                      value={Number(m.state ?? 0)}
                      onChange={(e) => handleChangeRole(m.id, Number(e.target.value))}
                      disabled={busyIds.has(m.id)}
                    >
                      {[-1,0,1,2,3].map((val) => (
                        <option key={val} value={val}>{t(`members.roles.${val}`)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="UniMe-roleText">{Capitalize(t(`members.rolesUpper.${Number(m.state ?? 0)}`) || t('members.rolesUpper.0'))}</p>
                )}
                 {DroitAccess.isOwner(droit) && (
                <button
                  className="UniMe-chip UniMe-danger"
                  onClick={() => handleExclude(m.id)}
                  disabled={busyIds.has(m.id)}
                  title={t('members.excludeTitle')}
                >
                  {t('members.exclude')}
                </button>
                 )}
              </div>

              {/* Bouton ... pour mobile */}
              <div className="UniMe-more">
                <button
                  className="UniMe-moreBtn"
                  aria-haspopup="menu"
                  aria-expanded={mobileOpenId === m.id}
                  aria-label={t('members.moreActions')}
                  onClick={() => toggleMobileMenu(m.id)}
                >
                  <FaEllipsisH />
                </button>
                {mobileOpenId === m.id && (
                  <div className="UniMe-moreMenu" role="menu">
                    {/* Demande d'ami / attente / rien si moi ou déjà ami */}
                    {m.id === currentUserId ? null : friendIds.has(m.id) ? null : requestedIds.has(m.id) ? (
                      <button className="UniMe-chip" disabled title={t('members.pendingRequest')} role="menuitem">
                        {t('members.pendingRequest')}
                      </button>
                    ) : (
                      <button
                        className="UniMe-chip UniMe-friend"
                        onClick={() => { handleAddFriend(m.id); setMobileOpenId(null); }}
                        disabled={busyIds.has(m.id)}
                        title={t('members.addFriend')}
                        role="menuitem"
                      >
                        {t('members.addFriend')}
                      </button>
                    )}

                    {/* Fiches */}
                    <button
                      className="UniMe-chip"
                      onClick={() => { navigate(`/fiches/owner/${m.id}?idUnivers=${universId}`); setMobileOpenId(null); }}
                      title={t('members.viewSheets')}
                      role="menuitem"
                    >
                      <FaFileAlt /> {t('members.sheets')}
                    </button>

                    {/* Rôle (sélecteur si owner) ou texte sinon) */}
                    {DroitAccess.isOwner(droit) ? (
                      <div className="UniMe-roleSelect" role="menuitem">
                        <select
                          value={Number(m.state ?? 0)}
                          onChange={(e) => { handleChangeRole(m.id, Number(e.target.value)); setMobileOpenId(null); }}
                          disabled={busyIds.has(m.id)}
                        >
                          {[-1,0,1,2,3].map((val) => (
                            <option key={val} value={val}>{t(`members.roles.${val}`)}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="UniMe-roleText" role="menuitem">{Capitalize(t(`members.rolesUpper.${Number(m.state ?? 0)}`) || t('members.rolesUpper.0'))}</p>
                    )}

                    {/* Exclure (seulement owner) */}
                    {DroitAccess.isOwner(droit) && (
                      <button
                        className="UniMe-chip UniMe-danger"
                        onClick={() => { handleExclude(m.id); setMobileOpenId(null); }}
                        disabled={busyIds.has(m.id)}
                        title={t('members.excludeTitle')}
                        role="menuitem"
                      >
                        {t('members.exclude')}
                      </button>
                    )}
                  </div>
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
        title={isMember ? t('members.leave') : t('members.join')}
      >
        {isMember ? t('members.leave') : t('members.join')}
      </button>
    </div>
  );
};

export default UniversCardMembres;


