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




const TABS = [
  { key: "join",  label: "Adhésions", icon: <FaUsers /> , hint: "Demandes pour rejoindre l’univers" },
  { key: "fiche", label: "Fiches",    icon: <FaFileAlt />, hint: "Validation préalable des fiches" },
  { key: "lieux", label: "Lieux",     icon: <FaMapMarkerAlt />, hint: "Créations de lieux/établissements" },
  { key: "quete", label: "Quêtes",    icon: <FaScroll />, hint: "Idées de quêtes à valider" },
];

const mockData = {
  join: [],
  fiche: [],
  lieux: [],
  quete: [],
};

// Normalise les données de l'API vers le format interne de la vue
const normalizeApiData = (data) => {
  // Nouveau format: tableau d'utilisateurs en attente
  if (Array.isArray(data)) {
    const pending = data.filter((u) => u?.state === -1);
    return {
      join: pending.map((u) => ({
        id: u.id,
        title: u.pseudo ?? `Utilisateur ${u.id}`,
        requester: u.pseudo ?? "",
        avatar: u.image ?? null,
        status: u.state === 1 ? "approved" : u.state === 0 ? "rejected" : "pending",
        createdAt: u.createdAt ?? null,
        message: u.message ?? null,
      })),
      fiche: [],
      lieux: [],
      quete: [],
    };
  }

  // Anciens formats pris en charge
  return {
    join:  data?.join  ?? data?.adhesions ?? data?.joinRequests ?? mockData.join,
    fiche: data?.fiche ?? data?.fiches    ?? data?.ficheRequests ?? mockData.fiche,
    lieux: data?.lieux ?? data?.places    ?? data?.placeRequests ?? mockData.lieux,
    quete: data?.quete ?? data?.quests    ?? data?.questRequests ?? mockData.quete,
  };
};

const TabButton = ({ tab, isActive, onClick, count }) => {
  // Recalcule si l’onglet actif change ou si le count change
  const { ref, color } = useAutoTextColor([isActive, count]);

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`UniIn-tab ${isActive ? "active" : ""}`}
      onClick={onClick}
      title={tab.hint}
    >
      <span className="UniIn-tabIcon">{tab.icon}</span>
      <span className="UniIn-tabLabel">{tab.label}</span>
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
  const params = useParams();
  const currentUniverseId = universeId ?? params?.id;
  const [active, setActive] = useState("join");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({ join: new Set(), fiche: new Set(), lieux: new Set(), quete: new Set() });
  const [lists, setLists] = useState({ join: [], fiche: [], lieux: [], quete: [] });
  const [loading, setLoading] = useState(true);
  const [droit, setDroit] = useState(null);


  // Charger depuis l'API
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const { data } = await ApiUnivers.getInscriptionUnivers(currentUniverseId, { search });
        if (cancelled) return;
        const next = normalizeApiData(data);
        setLists(next);
      } catch (e) {
        // Fallback silencieux sur mock en cas d'erreur
        if (!cancelled) setLists(mockData);
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
    join:  lists.join.length,
    fiche: lists.fiche.length,
    lieux: lists.lieux.length,
    quete: lists.quete.length,
  };

  const handleSearch = (value) => {
    setSearch(value);
  };


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = lists[active] || [];
    if (!q) return list;
    return list.filter((it) =>
      [it.title, it.requester, it.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, lists, active]);

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
      const { data } = await ApiUnivers.getInscriptionUnivers(currentUniverseId, { search });
      const next = normalizeApiData(data);
      setLists(next);
    } catch {}
  };

  const approveOne = async (tabKey, id) => {
    try {
      setLoading(true);
      await ApiUnivers.putInscriptionUnivers(currentUniverseId, id, { state: 0 });
      await refresh();
      onApprove?.(tabKey, id);
    } catch {} finally { setLoading(false); }
  };

  const rejectOne = async (tabKey, id) => {
    try {
      setLoading(true);
      await ApiUnivers.deleteInscriptionUnivers(currentUniverseId, id);
      await refresh();
      onReject?.(tabKey, id);
    } catch {} finally { setLoading(false); }
  };

  const approveSelected = async (tabKey) => {
    const ids = Array.from(selected[tabKey]);
    if (ids.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(ids.map((id) => ApiUnivers.putInscriptionUnivers(currentUniverseId, id, { state: 0 })));
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
      await Promise.all(ids.map((id) => ApiUnivers.deleteInscriptionUnivers(currentUniverseId, id)));
      await refresh();
      onRejectMany?.(tabKey, ids);
    } catch {} finally {
      setSelected((p) => ({ ...p, [tabKey]: new Set() }));
      setLoading(false);
    }
  };

  const currentIds = filtered.map((x) => x.id);
  const allChecked = currentIds.length > 0 && currentIds.every((id) => selected[active].has(id));






  return (
    <div className="UniIn-container" data-universe={currentUniverseId ?? ""}>
      {/* Header */}
      <BackLocation/>
      <header className="UniIn-header">
        <div className="UniIn-title">
          <h1>Inscriptions & Demandes</h1>
          <span className="UniIn-subtitle">Gérez les validations de votre univers</span>
        </div>

        <div className="">
          <SearchBar value={search} onChange={handleSearch} onClear={() => handleSearch("")} />
        </div>
      </header>

      {/* Tabs */}
     <nav className="UniIn-tabs" role="tablist" aria-label="Catégories de demandes">
      {TABS.map((t) => (
        <TabButton
          key={t.key}
          tab={t}
          isActive={active === t.key}
          onClick={() => setActive(t.key)}
          count={counts[t.key]}
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
          
          <span>Tout sélectionner</span>
        </label>
        {DroitAccess.hasWriteAccess(droit) && (
        <div className="UniIn-bulkActions">
          <button
            className="UniIn-btn UniIn-approve"
            onClick={() => approveSelected(active)}
            disabled={selected[active].size === 0}
          >
            <FaCheck />
            Accepter
          </button>
          <button
            className="UniIn-btn UniIn-reject"
            onClick={() => rejectSelected(active)}
            disabled={selected[active].size === 0}
          >
            <FaTimes />
            Refuser
          </button>
        </div>
        )}
      </div>

      {/* List */}
      <section className="UniIn-list" role="region" aria-live="polite">
        {loading ? (
          <div className="UniIn-empty">Chargement des demandes…</div>
        ) : filtered.length === 0 ? (
          <div className="UniIn-empty">
            Aucune demande à afficher pour « {TABS.find(t => t.key === active)?.label} ».
          </div>
        ) : (
          <Masonry
            breakpointCols={2}
            className="UniIn-masonry"
            columnClassName="UniIn-masonry-column"
          >
            {filtered.map((it) => (
              <article key={it.id} className="UniIn-card">
                <div className="UniIn-cardLeft">
                  
                  <input
                    type="checkbox"
                    checked={selected[active].has(it.id)}
                    onChange={() => toggleOne(active, it.id)}
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
                    </div>
                    <div className="UniIn-meta">
                      <span className={`UniIn-status UniIn-${it.status || "pending"}`}>
                        {it.status === "approved" ? "Approuvée" : it.status === "rejected" ? "Refusée" : "En attente"}
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
                      title="Voir la demande"
                      onClick={() => window?.open?.("#", "_blank")}
                    >
                      <FaEye />
                    </button>
                  )}
                  {DroitAccess.hasWriteAccess(droit) && (
                  <button
                    className="UniIn-iconBtn UniIn-approve"
                    title="Accepter"
                    onClick={() => approveOne(active, it.id)}
                  >
                    <FaCheck />
                  </button>
                  )}
                  {DroitAccess.hasWriteAccess(droit) && (
                  <button
                    className="UniIn-iconBtn UniIn-reject"
                    title="Refuser"
                    onClick={() => rejectOne(active, it.id)}
                  >
                    <FaTimes />
                  </button>
                  )}
                </div>

              </article>
            ))}
          </Masonry>
        )}
      </section>
    </div>
  );
};

export default UniversCardInscription;
