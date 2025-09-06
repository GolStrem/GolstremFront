import React, { useMemo, useState, useEffect } from "react";
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
import Masonry from "react-masonry-css";




const TABS = [
  { key: "join",  label: "Adhésions", icon: <FaUsers /> , hint: "Demandes pour rejoindre l’univers" },
  { key: "fiche", label: "Fiches",    icon: <FaFileAlt />, hint: "Validation préalable des fiches" },
  { key: "lieux", label: "Lieux",     icon: <FaMapMarkerAlt />, hint: "Créations de lieux/établissements" },
  { key: "quete", label: "Quêtes",    icon: <FaScroll />, hint: "Idées de quêtes à valider" },
];

const mockData = {
  joinRequests: [
    { id: 1, title: "Riven", requester: "Riven",  createdAt: "2025-09-03T19:22:00Z", status: "pending" },
    { id: 2, title: "Zheneos", requester: "Zheneos",  createdAt: "2025-09-04T09:11:00Z", status: "pending" },
    { id: 3, title: "Henelks", requester: "Henelks",  createdAt: "2025-09-05T09:11:00Z", status: "pending" },
  ],
  ficheRequests: [
    { id: 11, title: "Henel Aemue", requester: "Henel", message: "Fiche v2 (ajout background).", createdAt: "2025-09-02T14:05:00Z", status: "pending" },
    { id: 12, title: "Henel Aemue", requester: "Bouboute du 27", message: "Fiche v2 (ajout background).", createdAt: "2025-09-02T14:05:00Z", status: "pending" },
    { id: 13, title: "Henel Aemue", requester: "Hemael", message: "Fiche v2 (ajout background).", createdAt: "2025-09-02T14:05:00Z", status: "pending" },
    { id: 14, title: "Henel Aemue", requester: "Zheneos", message: "Fiche v2 (ajout background).", createdAt: "2025-09-02T14:05:00Z", status: "pending" },
  ],
  placeRequests: [
    { id: 21, title: "Taverne du Lotus Noir", requester: "Kara", message: "Lieu social central avec mini-events.", createdAt: "2025-09-01T18:00:00Z", status: "pending" },
  ],
  questRequests: [
    { id: 31, title: "La Lame d’Orichalque", requester: "Alen", message: "Suite de 3 étapes, difficulté moyenne.", createdAt: "2025-09-03T08:30:00Z", status: "pending" },
  ],
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
  const [active, setActive] = useState("join");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({ join: new Set(), fiche: new Set(), lieux: new Set(), quete: new Set() });
  const [lists, setLists] = useState({ join: [], fiche: [], lieux: [], quete: [] });
  const [loading, setLoading] = useState(true);

  // Charger les données mock via useEffect
  useEffect(() => {
    setLoading(true);

    // Simule un appel API avec délai
    const timer = setTimeout(() => {
      setLists({
        join:  mockData.joinRequests,
        fiche: mockData.ficheRequests,
        lieux: mockData.placeRequests,
        quete: mockData.questRequests,
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [universeId]);

  const counts = {
    join:  lists.join.length,
    fiche: lists.fiche.length,
    lieux: lists.lieux.length,
    quete: lists.quete.length,
  };

  const handleSearch = (value) => {
    setSearch(value);  

    
    setParam((prev) => ({
      ...prev,
      search: value.trim(),
      p: 0, 
    }));
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

  const approveOne = (tabKey, id) => onApprove?.(tabKey, id);
  const rejectOne = (tabKey, id) => onReject?.(tabKey, id);

  const approveSelected = (tabKey) => {
    const ids = Array.from(selected[tabKey]);
    if (ids.length === 0) return;
    onApproveMany?.(tabKey, ids);
    setSelected((p) => ({ ...p, [tabKey]: new Set() }));
  };

  const rejectSelected = (tabKey) => {
    const ids = Array.from(selected[tabKey]);
    if (ids.length === 0) return;
    onRejectMany?.(tabKey, ids);
    setSelected((p) => ({ ...p, [tabKey]: new Set() }));
  };

  const currentIds = filtered.map((x) => x.id);
  const allChecked = currentIds.length > 0 && currentIds.every((id) => selected[active].has(id));






  return (
    <div className="UniIn-container" data-universe={universeId ?? ""}>
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
                  <button
                    className="UniIn-iconBtn UniIn-approve"
                    title="Accepter"
                    onClick={() => approveOne(active, it.id)}
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="UniIn-iconBtn UniIn-reject"
                    title="Refuser"
                    onClick={() => rejectOne(active, it.id)}
                  >
                    <FaTimes />
                  </button>
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
