// UniversCardEtablissement.jsx
import React, { useEffect, useMemo, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEtablissement.css";
import { BackLocation, BaseModal, ModalGeneric, Pagination, SearchBar } from "@components";
import { useTranslation } from "react-i18next";
// import { ApiUnivers } from "@service"; // <-- à réactiver quand l'API sera prête
import { PurifyHtml } from "@service";
import { useParams } from "react-router-dom";

/* =========================================================
   Données brutes (mock) + utilitaires
   ========================================================= */
const TYPE_COLORS = {
  establishment: "#f7d038",
  housing: "#2ecc71",
  outside: "#8e44ad",
  other: "#9b59b6",
};

const STATUS_COLORS = {
  open: "#2ecc71",
  closed: "#95a5a6",
  soon: "#f39c12",
};

// Mapping status UI<->INT (si ton futur backend utilise des entiers)
const statusKeyToInt = {
  open: 1,
  closed: 2,
  soon: 3,
};
const statusIntToKey = {
  1: "open",
  2: "closed",
  3: "soon",
};

// Helpers dates (identiques à ta page Board)
const formatToSqlDateTime = (input) => {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().replace("T", " ");
  if (!trimmed) return null;

  const dmy = trimmed.match(
    /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})(?:\s+([0-2]?\d):([0-5]?\d))?$/
  );
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    const HH = String(dmy[4] ?? "00").padStart(2, "0");
    const MM = String(dmy[5] ?? "00").padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
  }
  const ymd = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+([0-2]?\d):([0-5]?\d))?$/
  );
  if (ymd) {
    const yyyy = ymd[1];
    const mm = ymd[2];
    const dd = ymd[3];
    const HH = String(ymd[4] ?? "00").padStart(2, "0");
    const MM = String(ymd[5] ?? "00").padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
  }
  const dt = new Date(trimmed);
  if (!isNaN(dt.getTime())) {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const HH = String(dt.getHours()).padStart(2, "0");
    const MM = String(dt.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
  }
  return null;
};

const toDatetimeLocal = (input) => {
  if (!input) return "";
  if (typeof input !== "string") {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
  }
  const m1 = input.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T]([0-2]?\d):([0-5]?\d)(?::\d{2})?/
  );
  if (m1) {
    const yyyy = m1[1];
    const mm = m1[2];
    const dd = m1[3];
    const HH = String(m1[4]).padStart(2, "0");
    const MM = String(m1[5]).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
};

const parseSqlishToDate = (s) => {
  if (!s) return null;
  if (typeof s !== "string") return new Date(s);
  const normalized = s.includes(" ") ? s.replace(" ", "T") : s;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

const formatHuman = (
  input,
  locale = "fr-FR",
  opts = { dateStyle: "short", timeStyle: "short" }
) => {
  const d = typeof input === "string" ? parseSqlishToDate(input) : new Date(input);
  return d ? new Intl.DateTimeFormat(locale, opts).format(d) : "";
};

// Génération d’un dataset brut (images libres Unsplash)
const IMG = [
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1200&auto=format&fit=crop",
];
const TYPES = ["establishment", "housing", "outside", "other"];
const LOCS = ["Quartier du Port", "Vieille Ville", "Place du Marché", "Faubourg Nord"];

const toSql = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const HH = String(dt.getHours()).padStart(2, "0");
  const MM = String(dt.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeItem = (i) => {
  const now = new Date();
  const addDays = (n) => toSql(new Date(now.getTime() + n * 86400000));
  const type = TYPES[i % TYPES.length];
  const status = ((i + 1) % 3) + 1; // 1..3 (open, closed, soon)
  const openIn = rand(-15, 15);
  const closeIn = openIn + rand(1, 20);
  return {
    id: String(i + 1),
    type, // "shop"|"inn"|"guild"|"other"
    status, // int 1..4
    name: `Établissement #${i + 1}`,
    description: `Description de l'établissement #${i + 1}. <br/>Contenu <em>mock</em> de démonstration.`,
    image: IMG[i % IMG.length],
    location: LOCS[i % LOCS.length],
    openAt: addDays(openIn),
    closeAt: addDays(closeIn),
    createdAt: addDays(rand(-20, 0)),
  };
};

// “Base de données” en mémoire (brute)
const RAW_DB = Array.from({ length: 28 }, (_, i) => makeItem(i));

// Filtres + pagination en brut
const applyFilters = (data, params = {}) => {
  const { search, filter } = params || {};
  let arr = [...data];

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    arr = arr.filter(
      (it) =>
        (it.name || "").toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q)
    );
  }
  if (filter && typeof filter === "object") {
    if (filter.type) arr = arr.filter((it) => it.type === filter.type);
    if (filter.status) arr = arr.filter((it) => Number(it.status) === Number(filter.status));
    if (filter.date === "new") {
      const now = Date.now();
      const fourteen = 14 * 86400000;
      arr = arr.filter((it) => {
        const d = parseSqlishToDate(it.createdAt);
        return d && now - d.getTime() <= fourteen;
      });
    } else if (filter.date === "soon") {
      const now = Date.now();
      const horizon = 10 * 86400000;
      arr = arr.filter((it) => {
        const d = parseSqlishToDate(it.openAt);
        return d && d.getTime() >= now && d.getTime() - now <= horizon;
      });
    }
  }

  // tri par openAt (à venir en premier)
  arr.sort((a, b) => {
    const da = parseSqlishToDate(a.openAt)?.getTime() ?? 0;
    const db = parseSqlishToDate(b.openAt)?.getTime() ?? 0;
    return db - da;
  });

  return arr;
};

const paginate = (arr, p = 0, limit = 15) => {
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = p * limit;
  const slice = arr.slice(start, start + limit);
  return { data: slice, pagination: { total, limit, page: p, pages } };
};

/* =========================================================
   Composant
   ========================================================= */
const UniversCardEtablissement = () => {
  const { t } = useTranslation("univers");
  const { id: universId } = useParams(); // non utilisé ici, mais conservé pour la future API

  // Filtres (sélection unique)
  const [filterType, setFilterType] = useState("all"); // all | establishment | housing | outside | other
  const [filterStatus, setFilterStatus] = useState("all"); // all | open | closed | soon

  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // État affiché (issu du “serveur” local brut)
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  // i18n selects
  const typeLabels = useMemo(
    () => t("establishment.modal.typeOptions", { returnObjects: true }) || [],
    [t]
  ); // ["Boutique","Auberge","Guilde","Autre"]
  const statusLabels = useMemo(
    () => t("establishment.modal.statusOptions", { returnObjects: true }) || [],
    [t]
  ); // ["Ouvert","Fermé","Bientôt"]

  const typeKeyOrder = ["establishment", "housing", "outside", "other"];
  const statusKeyOrder = ["open", "closed", "soon"];

  const getTypeKeyFromLabel = (label) => {
    const idx = Array.isArray(typeLabels) ? typeLabels.indexOf(label) : -1;
    return typeKeyOrder[idx] ?? "other";
  };
  const getStatusKeyFromLabel = (label) => {
    const idx = Array.isArray(statusLabels) ? statusLabels.indexOf(label) : -1;
    return statusKeyOrder[idx] ?? "open";
  };

  // Chargement “brut” : on simule un appel serveur en appliquant filtres + pagination
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const filterParams = {
          ...(filterType !== "all" ? { type: filterType } : {}),
          ...(filterStatus !== "all" ? { status: statusKeyToInt[filterStatus] } : {}),
        };
        const params = {
          p: page,
          limit: 15,
          ...(search ? { search: search.trim() } : {}),
          ...(Object.keys(filterParams).length ? { filter: filterParams } : {}),
        };

        // “serveur” local
        const filtered = applyFilters(RAW_DB, params);
        const res = paginate(filtered, Number(params.p || 0), Number(params.limit || 15));

        const mapped = res.data.map((e) => ({
          id: e.id,
          typeKey: e.type,
          title: e.name,
          description: e.description || "",
          statusKey: statusIntToKey[Number(e.status)] ?? "open",
          openAt: e.openAt || null,
          closeAt: e.closeAt || null,
          image: e.image || "",
          location: e.location || "",
        }));

        if (mounted) {
          setItems(mapped);
          setTotalPages(res.pagination.pages);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError("loadError");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, filterType, filterStatus]);

  // Reset page + spinner sur changement filtres/recherche
  useEffect(() => {
    if (page !== 0) setPage(0);
  }, [filterType, filterStatus, search]); // eslint-disable-line

  const breakpointColumnsObj = useMemo(() => ({ default: 3, 1100: 2, 700: 1 }), []);

  // CRUD “brut” (on modifie RAW_DB puis on recharge la vue courante)
  const reloadCurrent = () => {
    const filterParams = {
      ...(filterType !== "all" ? { type: filterType } : {}),
      ...(filterStatus !== "all" ? { status: statusKeyToInt[filterStatus] } : {}),
    };
    const params = {
      p: 0,
      limit: 15,
      ...(search ? { search: search.trim() } : {}),
      ...(Object.keys(filterParams).length ? { filter: filterParams } : {}),
    };
    const filtered = applyFilters(RAW_DB, params);
    const res = paginate(filtered, Number(params.p || 0), Number(params.limit || 15));
    const mapped = res.data.map((e) => ({
      id: e.id,
      typeKey: e.type,
      title: e.name,
      description: e.description || "",
      statusKey: statusIntToKey[Number(e.status)] ?? "open",
      openAt: e.openAt || null,
      closeAt: e.closeAt || null,
      image: e.image || "",
      location: e.location || "",
    }));
    setItems(mapped);
    setTotalPages(res.pagination.pages);
    setPage(0);
  };

  const createLocal = (payload) => {
    const nextId = String(
      RAW_DB.length ? Math.max(...RAW_DB.map((x) => Number(x.id))) + 1 : 1
    );
    RAW_DB.unshift({
      id: nextId,
      type: payload.type ?? "other",
      status: Number(payload.status ?? 1),
      name: payload.name ?? "Sans nom",
      image: payload.image ?? "",
      description: payload.description ?? "",
      location: payload.location ?? "",
      openAt: payload.openAt ?? toSql(new Date()),
      closeAt:
        payload.closeAt ??
        toSql(new Date(Date.now() + 2 * 86400000)),
      createdAt: toSql(new Date()),
    });
  };

  const updateLocal = (id, payload) => {
    const idx = RAW_DB.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return;
    RAW_DB[idx] = {
      ...RAW_DB[idx],
      type: payload.type ?? RAW_DB[idx].type,
      status: Number(payload.status ?? RAW_DB[idx].status),
      name: payload.name ?? RAW_DB[idx].name,
      image: payload.image ?? RAW_DB[idx].image,
      description: payload.description ?? RAW_DB[idx].description,
      location: payload.location ?? RAW_DB[idx].location,
      openAt: payload.openAt ?? RAW_DB[idx].openAt,
      closeAt: payload.closeAt ?? RAW_DB[idx].closeAt,
    };
  };

  const deleteLocal = (id) => {
    const i = RAW_DB.findIndex((x) => String(x.id) === String(id));
    if (i !== -1) RAW_DB.splice(i, 1);
  };

  return (
    <div className="UniEt-container">
      <BackLocation />
      <h2 className="UniEt-title">{t("establishment.title")}</h2>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(0);
          }}
          onClear={() => {
            setSearch("");
            setPage(0);
          }}
        />
      </div>

      <div className="UniEt-filters">
        <div className="UniEt-filter-group">
          <span className="spanC">{t("establishment.filters.type")}</span>
          {["all", "establishment", "housing", "outside", "other"].map((key) => (
            <button
              key={key}
              type="button"
              className={`UniEt-filter-btn ${filterType === key ? "active" : ""}`}
              onClick={() => setFilterType(key)}
              aria-pressed={filterType === key}
            >
              {t(`establishment.filters.typeOptions.${key}`)}
            </button>
          ))}
        </div>

        <div className="UniEt-filter-group">
          <span className="spanC">{t("establishment.filters.status")}</span>
          {["all", "open", "closed", "soon"].map((key) => (
            <button
              key={key}
              type="button"
              className={`UniEt-filter-btn ${filterStatus === key ? "active" : ""}`}
              onClick={() => setFilterStatus(key)}
              aria-pressed={filterStatus === key}
            >
              {t(`establishment.filters.statusOptions.${key}`)}
            </button>
          ))}
        </div>

        {/* Date filter removed as requested */}
      </div>

      {isLoading ? (
        <div className="UniEt-loading">{t("common:loading") || "Chargement..."}</div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="UniEt-masonry-grid"
          columnClassName="UniEt-masonry-grid_column"
        >
          {items.map((item) => {
            const typeLabel = t(`establishment.filters.typeOptions.${item.typeKey}`);
            const statusLabel =
              item.statusKey && t(`establishment.filters.statusOptions.${item.statusKey}`);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="UniEt-card"
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="UniEt-card-image-wrapper">
                    <img src={item.image} alt={item.title} className="UniEt-card-image" />
                    <div className="UniEt-card-overlay">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: PurifyHtml(item.description),
                        }}
                      />
                    </div>
                  </div>

                  <div className="UniEt-card-content">
                    <h3 className="UniEt-card-title">{item.title}</h3>
                    {item.location && <div className="UniEt-card-location">📍 {item.location}</div>}

                    <div className="UniEt-card-badges">
                      <motion.span
                        key={item.typeKey + item.id + filterType}
                        className="UniEt-card-type"
                        style={{ backgroundColor: TYPE_COLORS[item.typeKey] }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        {typeLabel}
                      </motion.span>

                      {statusLabel && (
                        <motion.span
                          key={item.statusKey + item.id + filterStatus}
                          className="UniEt-card-status"
                          style={{ backgroundColor: STATUS_COLORS[item.statusKey] }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          {statusLabel}
                        </motion.span>
                      )}

                      {item.openAt && (
                        <span className="UniEt-card-date">
                          {(t("establishment.openAtLabel") || "Ouvre")} : {formatHuman(item.openAt)}
                        </span>
                      )}
                      {item.closeAt && (
                        <span className="UniEt-card-date">
                          {(t("establishment.closeAtLabel") || "Ferme")} : {formatHuman(item.closeAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </Masonry>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* FAB */}
      <button
        type="button"
        className="UniEt-fab"
        aria-label={t("establishment.fab.aria")}
        title={t("establishment.fab.title")}
        onClick={() => setShowCreateModal(true)}
      >
        +
      </button>

      {/* Modal Preview */}
      {selectedItem && (
        <BaseModal onClose={() => setSelectedItem(null)} className="uniet-preview-modal">
          <div className="uniet-preview-content">
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="uniet-preview-image"
            />
            <div className="uniet-preview-body">
              <h3 className="uniet-preview-title">{selectedItem.title}</h3>
              {selectedItem.location && (
                <div className="uniet-preview-location">📍 {selectedItem.location}</div>
              )}
              <div className="uniet-preview-badges">
                <span
                  className="uniet-preview-type"
                  style={{ backgroundColor: TYPE_COLORS[selectedItem.typeKey] }}
                >
                  {t(`establishment.filters.typeOptions.${selectedItem.typeKey}`)}
                </span>
                {selectedItem.statusKey && (
                  <span
                    className="uniet-preview-status"
                    style={{ backgroundColor: STATUS_COLORS[selectedItem.statusKey] }}
                  >
                    {t(`establishment.filters.statusOptions.${selectedItem.statusKey}`)}
                  </span>
                )}
                {selectedItem.openAt && (
                  <span className="uniet-preview-date">
                    {(t("establishment.openAtLabel") || "Ouvre")} : {formatHuman(selectedItem.openAt)}
                  </span>
                )}
                {selectedItem.closeAt && (
                  <span className="uniet-preview-date">
                    {(t("establishment.closeAtLabel") || "Ferme")} : {formatHuman(selectedItem.closeAt)}
                  </span>
                )}
              </div>
              <p
                className="uniet-preview-description"
                dangerouslySetInnerHTML={{ __html: PurifyHtml(selectedItem.description) }}
              />
              <div className="uniet-preview-actions tm-modal-buttons" style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button type="button" className="cf-btn-success" onClick={() => setShowEditModal(true)}>
                  {t("establishment.modal.editAction") || "Modifier"}
                </button>
                <button type="button" className="cf-btn-danger" onClick={() => setShowDeleteModal(true)}>
                  {t("establishment.modal.deleteAction") || "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <ModalGeneric
          onClose={() => setShowCreateModal(false)}
          noMemory
          name="establishmentCreate"
          title={t("establishment.modal.createTitle")}
          fields={{
            type: {
              type: "select",
              value: typeLabels,
              label: `${t("establishment.modal.fields.type")} `,
              key: "uniet-type",
            },
            title: {
              type: "inputText",
              label: `${t("establishment.modal.fields.title")} `,
              key: "uniet-title",
            },
            description: {
              type: "textarea",
              label: t("establishment.modal.fields.description"),
              key: "uniet-description",
            },
            status: {
              type: "select",
              value: statusLabels,
              label: `${t("establishment.modal.fields.status")} `,
              key: "uniet-status",
            },
            location: {
              type: "inputText",
              label: t("establishment.modal.fields.location"),
              key: "uniet-location",
            },
            openAt: {
              type: "inputDateTime",
              label: t("establishment.modal.fields.openAt"),
              key: "uniet-openAt",
            },
            closeAt: {
              type: "inputDateTime",
              label: t("establishment.modal.fields.closeAt"),
              key: "uniet-closeAt",
            },
            image: {
              type: "inputUrl",
              label: t("establishment.modal.fields.image"),
              key: "uniet-image",
            },
          }}
          textButtonValidate={t("establishment.modal.submit")}
          handleSubmit={async (values) => {
            const typeKey = getTypeKeyFromLabel(values.type);
            const statusKey = getStatusKeyFromLabel(values.status);
            const payload = {
              type: typeKey,
              status: statusKeyToInt[statusKey] ?? 1,
              name: values.title,
              image: values.image,
              description: values.description,
              location: values.location,
              openAt: formatToSqlDateTime(values.openAt),
              closeAt: formatToSqlDateTime(values.closeAt),
            };
            createLocal(payload);
            reloadCurrent();
            setShowCreateModal(false);
          }}
          isOpen
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedItem && (
        <ModalGeneric
          onClose={() => setShowEditModal(false)}
          noMemory
          name="establishmentEdit"
          title={t("establishment.modal.editTitle")}
          initialData={{
            type: typeLabels[typeKeyOrder.indexOf(selectedItem.typeKey)] ?? typeLabels[0],
            title: selectedItem.title,
            description: selectedItem.description,
            status: statusLabels[statusKeyOrder.indexOf(selectedItem.statusKey)] ?? statusLabels[0],
            location: selectedItem.location,
            openAt: toDatetimeLocal(selectedItem.openAt),
            closeAt: toDatetimeLocal(selectedItem.closeAt),
            image: selectedItem.image,
          }}
          fields={{
            type: {
              type: "select",
              value: typeLabels,
              label: `${t("establishment.modal.fields.type")} `,
              key: "uniet-type",
            },
            title: {
              type: "inputText",
              label: `${t("establishment.modal.fields.title")} `,
              key: "uniet-title",
            },
            description: {
              type: "textarea",
              label: t("establishment.modal.fields.description"),
              key: "uniet-description",
            },
            status: {
              type: "select",
              value: statusLabels,
              label: `${t("establishment.modal.fields.status")} `,
              key: "uniet-status",
            },
            location: {
              type: "inputText",
              label: t("establishment.modal.fields.location"),
              key: "uniet-location",
            },
            openAt: {
              type: "inputDateTime",
              label: t("establishment.modal.fields.openAt"),
              key: "uniet-openAt",
            },
            closeAt: {
              type: "inputDateTime",
              label: t("establishment.modal.fields.closeAt"),
              key: "uniet-closeAt",
            },
            image: {
              type: "inputUrl",
              label: t("establishment.modal.fields.image"),
              key: "uniet-image",
            },
          }}
          textButtonValidate={t("establishment.modal.update")}
          handleSubmit={async (values) => {
            const typeKey = getTypeKeyFromLabel(values.type);
            const statusKey = getStatusKeyFromLabel(values.status);
            const payload = {
              type: typeKey,
              status: statusKeyToInt[statusKey] ?? 1,
              name: values.title,
              image: values.image,
              description: values.description,
              location: values.location,
              openAt: formatToSqlDateTime(values.openAt),
              closeAt: formatToSqlDateTime(values.closeAt),
            };
            updateLocal(selectedItem.id, payload);
            // mise à jour rapide en front (évite un rechargement complet si tu préfères)
            setItems((prev) =>
              prev.map((it) =>
                it.id === selectedItem.id
                  ? {
                      ...it,
                      typeKey,
                      title: values.title || it.title,
                      description: values.description || it.description,
                      statusKey,
                      location: values.location ?? it.location,
                      openAt: payload.openAt ?? it.openAt,
                      closeAt: payload.closeAt ?? it.closeAt,
                      image: values.image || it.image,
                    }
                  : it
              )
            );
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          isOpen
        />
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedItem && (
        <ModalGeneric
          onClose={() => setShowDeleteModal(false)}
          noMemory
          name="establishmentDelete"
          title={t("establishment.modal.deleteTitle")}
          fields={{
            confirm: {
              type: "confirmation",
              label: t("establishment.modal.deleteConfirmLabel"),
              message: t("establishment.modal.deleteConfirmMessage"),
            },
          }}
          textButtonValidate={t("establishment.modal.deleteSubmit")}
          handleSubmit={async (values) => {
            if (!values.confirm) return;
            deleteLocal(selectedItem.id);
            setItems((prev) => prev.filter((it) => it.id !== selectedItem.id));
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          isOpen
        />
      )}
    </div>
  );
};

export default UniversCardEtablissement;
