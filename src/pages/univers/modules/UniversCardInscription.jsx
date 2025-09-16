import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAutoTextColor } from '@service'
import {
  FaCheck,
  FaTimes,
  FaUsers,
  FaFileAlt,
  FaMapMarkerAlt,
  FaScroll,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import "./UniversCardInscription.css";
import { BackLocation, SearchBar } from "@components/index";
import { ApiUnivers, DroitAccess } from "@service";
import Masonry from "react-masonry-css";
import { useTranslation } from "react-i18next";





// Normalise les données de l'API vers le format interne de la vue
const normalizeApiData = (data, ficheData = []) => {
  // Nouveau format: tableau d'utilisateurs en attente
  if (Array.isArray(data)) {
    const pending = data.filter((u) => u?.state === -1);
    return {
      join: pending.map((u) => ({
        id: u.id,
        __type: 'join',
        title: u.pseudo ?? `Utilisateur ${u.id}`,
        requester: u.pseudo ?? "",
        avatar: u.image ?? null,
        status: u.state === 1 ? "approved" : u.state === 0 ? "rejected" : "pending",
        createdAt: u.createdAt ?? null,
        message: u.message ?? null,
      })),
      fiche: Array.isArray(ficheData) ? ficheData.map((f) => ({
        id: f.id,
        __type: 'fiche',
        title: f.characterName ?? `Personnage ${f.id}`,
        requester: f.playerName ?? "",
        avatar: f.characterImage ?? f.playerImage ?? null,
        status: f.idModerator ? "approved" : "pending",
        createdAt: f.createdAt ?? null,
        message: f.modeleDescription ?? null,
        idFiche: f.idFiche,
        idModele: f.idModele,
        modeleName: f.modeleName,
        idOwner: f.idOwner,
      })) : [],
      lieux: [],
      quete: [],
    };
  }

  // Anciens formats pris en charge
  return {
    join:  (data?.join  ?? data?.adhesions ?? data?.joinRequests ?? []).map((u)=>({ ...u, __type: 'join' })),
    fiche: (data?.fiche ?? data?.fiches    ?? data?.ficheRequests ?? []).map((f)=>({ ...f, __type: 'fiche' })),
    lieux: (data?.lieux ?? data?.places    ?? data?.placeRequests ?? []).map((l)=>({ ...l, __type: 'lieux' })),
    quete: (data?.quete ?? data?.quests    ?? data?.questRequests ?? []).map((q)=>({ ...q, __type: 'quete' })),
  };
};

const TabButton = ({ tab, isActive, onClick, count, label, hint }) => {
  // Recalcule si l’onglet actif change ou si le count change
  const { ref, color } = useAutoTextColor([isActive, count]);

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`UniIn-tab ${isActive ? "active" : ""}`}
      onClick={onClick}
      title={hint}
    >
      <span className="UniIn-tabIcon">{tab.icon}</span>
      <span className="UniIn-tabLabel">{label}</span>
      <span ref={ref} className="UniIn-tabCount" style={{ color }}>
        {count}
      </span>
    </button>
  );
};


const UniversCardInscription = ({
  universeId,
  onApprove,
  onReject,
  onApproveMany,
  onRejectMany,
}) => {
  const { t } = useTranslation('univers');
  const params = useParams();
  const currentUniverseId = universeId ?? params?.id;
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({ all: new Set(), join: new Set(), fiche: new Set(), lieux: new Set(), quete: new Set() });
  const [lists, setLists] = useState({ join: [], fiche: [], lieux: [], quete: [] });
  const [loading, setLoading] = useState(true);
  const [droit, setDroit] = useState(null);

  const TABS = [
    { key: "all",   label: t('requests.tabs.all'),   icon: <FaSearch />,      hint: t('requests.hints.all') },
    { key: "join",  label: t('requests.tabs.join'),  icon: <FaUsers /> ,      hint: t('requests.hints.join') },
    { key: "fiche", label: t('requests.tabs.fiche'), icon: <FaFileAlt />,     hint: t('requests.hints.fiche') },
    { key: "lieux", label: t('requests.tabs.lieux'), icon: <FaMapMarkerAlt />,hint: t('requests.hints.lieux') },
    { key: "quete", label: t('requests.tabs.quete'), icon: <FaScroll />,      hint: t('requests.hints.quete') },
  ];

  // Charger depuis l'API
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        // Charger les données d'inscription et les fiches en parallèle
        const [inscriptionResponse, ficheResponse] = await Promise.all([
          ApiUnivers.getInscriptionUnivers(currentUniverseId, { search }),
          ApiUnivers.getSubscribeFiche(currentUniverseId)
        ]);
        
        if (cancelled) return;
        
        const next = normalizeApiData(inscriptionResponse.data, ficheResponse.data);
        setLists(next);
      } catch (e) {
        // Fallback silencieux sur mock en cas d'erreur
        if (!cancelled) setLists({ join: [], fiche: [], lieux: [], quete: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (currentUniverseId) run();
    return () => { cancelled = true; };
  }, [currentUniverseId, search]);

  useEffect(() => {
    const loadUnivers = async () => {
      if (!currentUniverseId) return;
      try {
        const res = await ApiUnivers.getDetailUnivers(currentUniverseId);
        setDroit(res?.data?.droit);
       
      } catch {

      }
    };
    loadUnivers();
  }, [currentUniverseId]);

  const counts = {
    all:   lists.join.length + lists.fiche.length + lists.lieux.length + lists.quete.length,
    join:  lists.join.length,
    fiche: lists.fiche.length,
    lieux: lists.lieux.length,
    quete: lists.quete.length,
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const aggregatedAll = useMemo(() => {
    // On concatène en ajoutant un id composé pour éviter collisions lors de la sélection
    const withCompound = (arr) => arr.map(it => ({ ...it, __compoundId: `${it.__type || 'unknown'}:${it.id}` }));
    return [
      ...withCompound(lists.join),
      ...withCompound(lists.fiche),
      ...withCompound(lists.lieux),
      ...withCompound(lists.quete),
    ];
  }, [lists]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = active === 'all' ? aggregatedAll : (lists[active] || []);
    if (!q) return list;
    return list.filter((it) =>
      [it.title, it.requester, it.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, lists, active, aggregatedAll]);

  const toggleOne = (tabKey, id) => {
    setSelected((prev) => {
      const next = new Set(prev[tabKey]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tabKey]: next };
    });
  };

  const toggleAll = (tabKey, itemIds) => {
    setSelected((prev) => {
      const cur = prev[tabKey];
      const allSelected = itemIds.every((id) => cur.has(id));
      const next = new Set(allSelected ? [] : itemIds);
      return { ...prev, [tabKey]: next };
    });
  };

  const refresh = async () => {
    try {
      const [inscriptionResponse, ficheResponse] = await Promise.all([
        ApiUnivers.getInscriptionUnivers(currentUniverseId, { search }),
        ApiUnivers.getSubscribeFiche(currentUniverseId)
      ]);
      const next = normalizeApiData(inscriptionResponse.data, ficheResponse.data);
      setLists(next);
    } catch {}
  };

  const approveOne = async (tabKey, id) => {
    try {
      setLoading(true);
      if (tabKey === "fiche") {
        // Pour les fiches, utiliser l'endpoint spécifique avec state: 2
        await ApiUnivers.AcceptSubscribeFiche(currentUniverseId, id, { state: 2 });
      } else if (tabKey === "join") {
        // Pour les autres types (join), utiliser l'endpoint d'inscription
        await ApiUnivers.putInscriptionUnivers(currentUniverseId, id, { state: 0 });
      }
      await refresh();
      onApprove?.(tabKey, id);
    } catch {} finally { setLoading(false); }
  };

  const rejectOne = async (tabKey, id) => {
    try {
      setLoading(true);
      if (tabKey === "fiche") {
        // Pour les fiches, utiliser l'endpoint spécifique de suppression
        await ApiUnivers.deleteSubscribeFiche(currentUniverseId, id);
      } else if (tabKey === "join") {
        // Pour les autres types (join), utiliser l'endpoint d'inscription
        await ApiUnivers.deleteInscriptionUnivers(currentUniverseId, id);
      }
      await refresh();
      onReject?.(tabKey, id);
    } catch {} finally { setLoading(false); }
  };

  const approveSelected = async (tabKey) => {
    const ids = Array.from(selected[tabKey]);
    if (ids.length === 0) return;
    try {
      setLoading(true);
      if (tabKey === "fiche") {
        // Pour les fiches, utiliser l'endpoint spécifique avec state: 2
        await Promise.all(ids.map((id) => ApiUnivers.AcceptSubscribeFiche(currentUniverseId, id, { state: 2 })));
      } else if (tabKey === "join") {
        // Pour les autres types (join), utiliser l'endpoint d'inscription
        await Promise.all(ids.map((id) => ApiUnivers.putInscriptionUnivers(currentUniverseId, id, { state: 0 })));
      } else if (tabKey === "all") {
        // Séparer par type via l'id composé
        const joinIds = ids.filter((cid) => String(cid).startsWith('join:')).map((cid) => String(cid).split(':').slice(1).join(':'));
        const ficheIds = ids.filter((cid) => String(cid).startsWith('fiche:')).map((cid) => String(cid).split(':').slice(1).join(':'));
        await Promise.all([
          ...joinIds.map((id) => ApiUnivers.putInscriptionUnivers(currentUniverseId, id, { state: 0 })),
          ...ficheIds.map((id) => ApiUnivers.AcceptSubscribeFiche(currentUniverseId, id, { state: 2 })),
        ]);
      }
      await refresh();
      onApproveMany?.(tabKey, ids);
    } catch {} finally {
      setSelected((p) => ({ ...p, [tabKey]: new Set() }));
      setLoading(false);
    }
  };

  const rejectSelected = async (tabKey) => {
    const ids = Array.from(selected[tabKey]);
    if (ids.length === 0) return;
    try {
      setLoading(true);
      if (tabKey === "fiche") {
        // Pour les fiches, utiliser l'endpoint spécifique de suppression
        await Promise.all(ids.map((id) => ApiUnivers.deleteSubscribeFiche(currentUniverseId, id)));
      } else if (tabKey === "join") {
        // Pour les autres types (join), utiliser l'endpoint d'inscription
        await Promise.all(ids.map((id) => ApiUnivers.deleteInscriptionUnivers(currentUniverseId, id)));
      } else if (tabKey === "all") {
        const joinIds = ids.filter((cid) => String(cid).startsWith('join:')).map((cid) => String(cid).split(':').slice(1).join(':'));
        const ficheIds = ids.filter((cid) => String(cid).startsWith('fiche:')).map((cid) => String(cid).split(':').slice(1).join(':'));
        await Promise.all([
          ...joinIds.map((id) => ApiUnivers.deleteInscriptionUnivers(currentUniverseId, id)),
          ...ficheIds.map((id) => ApiUnivers.deleteSubscribeFiche(currentUniverseId, id)),
        ]);
      }
      await refresh();
      onRejectMany?.(tabKey, ids);
    } catch {} finally {
      setSelected((p) => ({ ...p, [tabKey]: new Set() }));
      setLoading(false);
    }
  };

  const currentIds = (active === 'all' ? filtered.map((x) => x.__compoundId) : filtered.map((x) => x.id));
  const allChecked = currentIds.length > 0 && currentIds.every((id) => selected[active].has(id));






  return (
    <div className="UniIn-container" data-universe={currentUniverseId ?? ""}>
      {/* Header */}
      <BackLocation/>
      <header className="UniIn-header">
        <div className="UniIn-title">
          <h1>{t('requests.title')}</h1>
          <span className="UniIn-subtitle">{t('requests.subtitle')}</span>
        </div>

        <div className="">
          <SearchBar value={search} onChange={handleSearch} onClear={() => handleSearch("")} />
        </div>
      </header>

      {/* Tabs */}
     <nav className="UniIn-tabs" role="tablist" aria-label="Catégories de demandes">
      {TABS.map((tItem) => (
        <TabButton
          key={tItem.key}
          tab={tItem}
          isActive={active === tItem.key}
          onClick={() => setActive(tItem.key)}
          count={counts[tItem.key]}
          label={tItem.label}
          hint={tItem.hint}
        />
      ))}
    </nav>


      {/* Bulk actions */}
      <div className="UniIn-bulkbar">
        <label className="UniIn-checkall">
          
          <input
            type="checkbox"
            checked={allChecked}
            onChange={() => toggleAll(active, currentIds)}
          />
          
          <span>{t('requests.selectAll')}</span>
        </label>
        {(DroitAccess.hasWriteAccess(droit) || droit === null) && (
        <div className="UniIn-bulkActions">
          <button
            className="UniIn-btn UniIn-approve"
            onClick={() => approveSelected(active)}
            disabled={selected[active].size === 0}
          >
            <FaCheck />
            {t('accept')}
          </button>
          <button
            className="UniIn-btn UniIn-reject"
            onClick={() => rejectSelected(active)}
            disabled={selected[active].size === 0}
          >
            <FaTimes />
            {t('refuse')}
          </button>
        </div>
        )}
      </div>

      {/* List */}
      <section className="UniIn-list" role="region" aria-live="polite">
        {loading ? (
          <div className="UniIn-empty">{t('requests.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="UniIn-empty">
            {t('requests.emptyFor', { label: TABS.find(ti => ti.key === active)?.label })}
          </div>
        ) : (
          <Masonry
            breakpointCols={2}
            className="UniIn-masonry"
            columnClassName="UniIn-masonry-column"
          >
            {filtered.map((it) => {
              const isAll = active === 'all';
              const compoundId = isAll ? it.__compoundId : it.id;
              const typeForAction = isAll ? (it.__type || 'unknown') : active;
              return (
              <article key={compoundId} className="UniIn-card">
                <div className="UniIn-cardLeft">
                  
                  <input
                    type="checkbox"
                    checked={selected[active].has(compoundId)}
                    onChange={() => toggleOne(active, compoundId)}
                  />
                  
                  <div className="UniIn-avatar">
                    {it.avatar ? (
                      <img src={it.avatar} alt={it.requester ?? it.title} />
                    ) : (
                      <div className="UniIn-avatarFallback">
                        {(it.requester ?? it.title)?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="UniIn-cardBody">
                  <div className="UniIn-cardBody2"> 

                    <div className="UniIn-cardTitle">
                      <strong>{it.title}</strong>
                      {((active === "fiche" || (active === 'all' && it.__type === 'fiche')) && it.modeleName) && (
                        <span className="UniIn-modeleName">({it.modeleName})</span>
                      )}
                    </div>
                    <div className="UniIn-meta">
                      <span className={`UniIn-status UniIn-${it.status || "pending"}`}>
                        {t(`requests.status.${it.status || 'pending'}`)}
                      </span>
                      {it.createdAt && (
                        <time dateTime={it.createdAt}>
                          {new Date(it.createdAt).toLocaleString()}
                        </time>
                      )}
                  </div>

                  </div>
                  
                  {it.message && <p className="UniIn-cardMsg">{it.message}</p>}
                  
                </div>

                <div className="UniIn-cardActions">
                  
                  {active !== "join" && (
                    <button
                      className="UniIn-iconBtn UniIn-iconEye1"
                      title={t('requests.viewRequest')}
                      onClick={() => window?.open?.("#", "_blank")}
                    >
                      <FaEye />
                    </button>
                  )}
                  {(DroitAccess.hasWriteAccess(droit) || droit === null) && (
                  <button
                    className="UniIn-iconBtn UniIn-approve"
                    title={t('accept')}
                    onClick={() => approveOne(typeForAction, it.id)}
                  >
                    <FaCheck />
                  </button>
                  )}
                  {(DroitAccess.hasWriteAccess(droit) || droit === null) && (
                  <button
                    className="UniIn-iconBtn UniIn-reject"
                    title={t('refuse')}
                    onClick={() => rejectOne(typeForAction, it.id)}
                  >
                    <FaTimes />
                  </button>
                  )}
                </div>

              </article>
            )})}
          </Masonry>
        )}
      </section>
    </div>
  );
};

export default UniversCardInscription;
