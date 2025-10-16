import React, { useMemo, useState, useCallback } from "react";
import "./Inventory.css";
import { motion, AnimatePresence } from "framer-motion";
import { useGhostDragAndDrop, ApiFiche } from "@service"; // <-- hook + API fiches

// ---- Mock dataset ----
const COLORS = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#A78BFA", "#F59E0B", "#10B981"];
const ICONS = ["🎒","🗡️","🛡️","🧪","📜","💎","🔧","🧿","🍖","🧲","🕯️","🧰","🗝️","⚗️","🏺","🔮"];

const makeItem = (i) => ({
  id: String(i + 1),
  name: `Item ${i + 1}`,
  color: COLORS[i % COLORS.length],
  icon: ICONS[i % ICONS.length],
});

const makeSeedForProfile = (hasUniverse) => ({
  personal: Array.from({ length: 16 }, (_, i) => ({ ...makeItem(i), origin: 'personal' })),
  universe: hasUniverse
    ? Array.from({ length: 12 }, (_, i) => ({ ...makeItem(i + 100), name: `Univ ${i + 1}`, origin: 'universe' }))
    : null,
});

// Détermine une couleur de texte (noir/blanc) lisible selon un fond hex
function getReadableTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return '#111';
  let c = hexColor.trim();
  if (c.startsWith('#')) c = c.slice(1);
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Luminance relative approximative (perçue)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 160 ? '#111' : '#fff';
}

const Inventory = () => {
  // Fiches (chargées depuis l'API)
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Inventaires par fiche
  const [inventories, setInventories] = useState({});

  const currentProfile = useMemo(() => profiles.find((p) => String(p.id) === String(activeProfileId)) || null, [profiles, activeProfileId]);
  const hasUniverseTab = Boolean((currentProfile?.universeId || currentProfile?.idUnivers) && inventories[activeProfileId]?.universe);

  // Onglets
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'universe'

  // Sélection: `${profileId}:${tab}:${itemId}`
  const [selected, setSelected] = useState(new Set());

  // Listes du profil courant
  const currentPersonal = inventories[activeProfileId]?.personal || [];
  const currentUniverse = inventories[activeProfileId]?.universe || [];
  const currentList   = [...currentPersonal, ...(currentUniverse || [])];

  // Helpers mise à jour listes
  const setListFor = (tab, nextList) => {
    setInventories((prev) => {
      const prevProfileInv = prev[activeProfileId] || { personal: [], universe: null };
      return {
        ...prev,
        [activeProfileId]: {
          personal: tab === "personal" ? nextList : prevProfileInv.personal,
          universe: tab === "universe" ? nextList : prevProfileInv.universe,
        },
      };
    });
  };

  const setCurrentList = (next) => setListFor(activeTab, next);
  const setOtherList  = (next) => setListFor(activeTab === "personal" ? "universe" : "personal", next);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return currentList;
    const q = search.toLowerCase();
    return currentList.filter((it) => it.name.toLowerCase().includes(q));
  }, [currentList, search]);

  const selectionKey = (origin, id) => `${activeProfileId}:${origin}:${id}`;
  const isSelected = (id, origin) => selected.has(selectionKey(origin, id));

  const toggleSelect = (id, origin) => {
    const key = selectionKey(origin, id);
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const selectAll = () => {
    const next = new Set(selected);
    filtered.forEach((it) => next.add(selectionKey(it.origin || 'personal', it.id)));
    setSelected(next);
  };

  const clearSelection = () => {
    const prefix = `${activeProfileId}:`;
    const next = new Set([...selected].filter((key) => !key.startsWith(prefix)));
    setSelected(next);
  };

  const migrate = useCallback((idsToMove, fromTab, toTab) => {
    if (fromTab === toTab || idsToMove.length === 0) return;

    const inv = inventories[activeProfileId] || { personal: [], universe: [] };
    const fromList = fromTab === "personal" ? inv.personal : (inv.universe || []);
    const toList   = toTab   === "personal" ? inv.personal : (inv.universe || []);

    const moving  = fromList.filter((it) => idsToMove.includes(it.id));
    const staying = fromList.filter((it) => !idsToMove.includes(it.id));

    setListFor(fromTab, staying);
    setListFor(toTab, [...moving, ...toList]);

    const nextSel = new Set(selected);
    idsToMove.forEach((id) => {
      nextSel.delete(selectionKey(fromTab, id));
      nextSel.delete(selectionKey(toTab, id));
    });
    setSelected(nextSel);
  }, [inventories, activeProfileId, selected]);

  const migrateToOther = () => {
    // migrer la sélection active vers l'autre tab
    const ids = [...selected]
      .filter((k) => k.startsWith(`${activeProfileId}:${activeTab}:`))
      .map((k) => k.split(":")[2]);
    if (!ids.length) return;
    const targetTab = activeTab === "personal" ? "universe" : "personal";
    if (targetTab === "universe" && !hasUniverseTab) return;
    migrate(ids, activeTab, targetTab);
  };

  const migrateOne = (item) => {
    const targetTab = activeTab === "personal" ? "universe" : "personal";
    if (targetTab === "universe" && !hasUniverseTab) return;
    migrate([item.id], activeTab, targetTab);
  };

  const switchTab = (tab) => {
    if (tab === "universe" && !hasUniverseTab) return;
    setActiveTab(tab);
    setSearch("");
  };

  const switchProfile = (profileId) => {
    setActiveProfileId(profileId);
    setActiveTab("personal");
    setSearch("");
    setSelected((prev) => new Set([...prev].filter((k) => !k.startsWith(`${activeProfileId}:`))));
  };

  // Charger les fiches de l'utilisateur
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const ownerId = localStorage.getItem("id");
        if (!ownerId) return;
        const res = await ApiFiche.getFiches("owner", ownerId);
        const list = Array.isArray(res?.data) ? res.data : [];
        if (cancelled) return;
        // Normaliser pour l'affichage: id, name, image, universeId/idUnivers
        const mapped = list.map((f) => ({
          id: f.id,
          name: f.name || f.characterName || `Fiche ${f.id}`,
          image: f.image || f.characterImage || "",
          universeId: f.idUnivers || f.universeId || null,
          color: f.color || f.bgColor || '#FF8C00',
        }));
        setProfiles(mapped);
        // Initialiser/mettre à jour les inventaires pour chaque fiche
        setInventories((prev) => {
          const next = { ...prev };
          for (const p of mapped) {
            if (!next[p.id]) {
              next[p.id] = makeSeedForProfile(Boolean(p.universeId));
            }
          }
          return next;
        });
        // Définir une fiche active par défaut si besoin
        setActiveProfileId((prevId) => prevId ?? (mapped[0]?.id ?? null));
      } catch (e) {
        // silencieux
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ------------- DRAG & DROP (avec ton hook) -------------
  // On ajoute data-attrs sur les cartes: data-id et data-tabcourant
  // On détecte l'onglet sous la souris au "mouseup" et on migre.
  useGhostDragAndDrop({
    dragSelector: ".Inv-card",
    cancelSelector: "[data-nodrag]", // évite que le bouton "→" déclenche un drag
    delayMs: 200,
    minDistance: 6,
    onMouseUpCallback: ({ draggedElement, event }) => {
      if (!draggedElement) return;

      // a) quel item ?
      const draggedId = draggedElement.getAttribute("data-id");
      const draggedFromTab = draggedElement.getAttribute("data-tab");
      if (!draggedId || !draggedFromTab) return;

      // b) où a-t-on lâché ? (sur quel onglet)
      const el = document.elementFromPoint(event.clientX, event.clientY);
      const tabBtn = el && el.closest && el.closest(".Inv-tab");
      const targetTab = tabBtn ? tabBtn.getAttribute("data-tab") : null;

      if (!targetTab || (targetTab !== "personal" && targetTab !== "universe")) {
        // pas lâché sur un onglet → ne rien faire
        return;
      }

      if (draggedFromTab === targetTab) return; // rien à faire

      // c) détermination du lot à déplacer : sélection multiple si présente, sinon l'item seul
      const selectedIdsInFromTab = [...selected]
        .filter((k) => k.startsWith(`${activeProfileId}:${draggedFromTab}:`))
        .map((k) => k.split(":")[2]);

      const idsToMove = selectedIdsInFromTab.length ? selectedIdsInFromTab : [draggedId];

      migrate(idsToMove, draggedFromTab, targetTab);
    },
  });

  return (
    <div className="Inv-container">
      <header className="Inv-header">
        <h2 className="Inv-title">Inventaire</h2>
      </header>

      <div className="Inv-layout">
        <aside className="Inv-sidebar" aria-label="Fiches de l'utilisateur">
          {profiles.map((p) => {
            const displayName = p.name || `Fiche ${p.id}`;
            const active = String(p.id) === String(activeProfileId);
            return (
              <div key={p.id} className={`Inv-sideRow ${active ? "active" : ""}`}> 
                <span
                  className="Inv-sideLabelOutside"
                  style={{ background: p.color, color: getReadableTextColor(p.color), borderColor: p.color }}
                >
                  <span className="Inv-sideName">{displayName}</span>
                </span>
                <button
                  type="button"
                  className={`Inv-sideItem`}
                  onClick={() => switchProfile(p.id)}
                  title={displayName}
                  data-nodrag
                >
                  <span className="Inv-sideThumb" aria-hidden>
                    <img src={p.image || ""} alt="" />
                  </span>
                </button>
              </div>
            );
          })}
        </aside>

        <main className="Inv-main">
          <div className="Inv-toolbar">
        <input
          className="Inv-search"
          placeholder="Rechercher un objet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="Inv-actions">
          <button className="Inv-btn ghost" onClick={selectAll} title="Tout sélectionner">
            Tout sélectionner
          </button>
          <button className="Inv-btn ghost" onClick={clearSelection} title="Effacer la sélection">
            Effacer
          </button>

          <button className="Inv-btn primary" onClick={migrateToOther} title="Vers inventaire univers" disabled={!hasUniverseTab}>
            Migrer vers Univers →
          </button>
          <button className="Inv-btn primary" onClick={migrateToOther} title="Vers inventaire personnel">
            ← Migrer vers Personnel
          </button>
        </div>
      </div>

          <div className="Inv-meta">
            <span>
              {filtered.length} / {currentList.length} objets
            </span>
            <span>
          sélectionnés : { [...selected].filter((k) => k.startsWith(`${activeProfileId}:`)).length }
            </span>
          </div>

          {/* Grid */}
          <div className="Inv-grid">
            <AnimatePresence>
          {filtered.map((item) => (
                <motion.button
                  type="button"
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className={`Inv-card ${isSelected(item.id, item.origin) ? "selected" : ""}`}
                  onClick={() => toggleSelect(item.id, item.origin)}
                  title={item.name}
                  data-id={item.id}
                  data-tab={item.origin || 'personal'}
                >
                  <span
                    className="Inv-card-bg"
                    style={{ background: item.color }}
                    aria-hidden
                  />
                  <span className="Inv-icon" aria-hidden>{item.icon}</span>
                  <span className="Inv-name">{item.name}</span>

              {item.origin === 'universe' && (
                <span className="Inv-tag-universe" aria-label="Item d'univers">Univers</span>
              )}

                  <div className="Inv-hover" data-nodrag>
                    <button
                      type="button"
                      className="Inv-mini-btn"
                      data-nodrag
                      onClick={(e) => { e.stopPropagation(); migrateOne(item); }}
                    >
                      {activeTab === "personal" ? "→ Univ" : "→ Perso"}
                    </button>
                  </div>

                  <span className="Inv-check" aria-hidden>
                    {isSelected(item.id) ? "✓" : ""}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
