// UniversCardEtablissement.jsx
import React, { useEffect, useMemo, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEtablissement.css";
import { BackLocation, BaseModal, ModalGeneric, Pagination, SearchBar } from "@components";
import { useTranslation } from "react-i18next";
import { ApiUnivers, PurifyHtml } from "@service";
import { useParams } from "react-router-dom";

/* =========================================================
   Constantes + utilitaires
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

const formatHourLabel = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return "";
  const [h, m] = hhmm.split(":");
  if (m === "00") return `${h}h`;
  return `${h}h${m}`;
};

// Options d'heures à pas de 30 minutes ("HH:MM")
const HALF_HOUR_OPTIONS = (() => {
  const out = [];
  for (let h = 0; h < 24; h += 1) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

// Déduire un statut simple (open/closed/soon) à partir des plages horaires HH:MM
const computeStatusFromHourRanges = (ranges, soonThresholdMinutes = 120) => {
  if (!Array.isArray(ranges) || ranges.length === 0) return undefined;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (hhmm) => {
    if (typeof hhmm !== "string") return NaN;
    const [h, m] = hhmm.split(":").map((x) => Number(x));
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
  };

  let nextOpeningIn = Infinity;
  for (const r of ranges) {
    if (!Array.isArray(r) || r.length !== 2) continue;
    const s = toMinutes(r[0]);
    const e = toMinutes(r[1]);
    if (Number.isNaN(s) || Number.isNaN(e)) continue;
    if (s <= nowMinutes && nowMinutes < e) return "open";
    if (s > nowMinutes) nextOpeningIn = Math.min(nextOpeningIn, s - nowMinutes);
  }
  if (nextOpeningIn <= soonThresholdMinutes) return "soon";
  return "closed";
};

// Helpers de pagination locale (fallback si l'API ne renvoie pas d'info)
const computePages = (total, limit) => Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 15)));

/* =========================================================
   Composant
   ========================================================= */
const UniversCardEtablissement = () => {
  const { t } = useTranslation("univers");
  const { id: universId } = useParams();

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
  // Invalidation pour forcer un rechargement serveur
  const [reloadTick, setReloadTick] = useState(0);

  // Ranges dynamiques (création/édition)
  const [createRangeCount, setCreateRangeCount] = useState(1);
  const [editRangeCount, setEditRangeCount] = useState(0);

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
    // 1) Si déjà une clé valide
    if (typeof label === "string" && typeKeyOrder.includes(label)) return label;
    // 2) Si c'est un libellé i18n
    const idxLabel = Array.isArray(typeLabels) ? typeLabels.indexOf(label) : -1;
    if (idxLabel >= 0) return typeKeyOrder[idxLabel] ?? "other";
    // 3) Si c'est un index numérique ("0".."3" ou 0..3)
    const n = Number(label);
    if (!Number.isNaN(n) && n >= 0 && n < typeKeyOrder.length) return typeKeyOrder[n];
    return "other";
  };
  const getStatusKeyFromLabel = (label) => {
    if (typeof label === "string" && statusKeyOrder.includes(label)) return label;
    const idxLabel = Array.isArray(statusLabels) ? statusLabels.indexOf(label) : -1;
    if (idxLabel >= 0) return statusKeyOrder[idxLabel] ?? "open";
    const n = Number(label);
    if (!Number.isNaN(n) && n >= 0 && n < statusKeyOrder.length) return statusKeyOrder[n];
    return "open";
  };

  // Chargement via API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = {
          p: page,
          limit: 15,
          ...(filterStatus !== "all" ? { status: filterStatus } : {}),
          ...(filterType !== "all" ? { type: filterType } : {}),
          ...(search ? { search: search.trim(), q: search.trim() } : {}),
        };
        const response = await ApiUnivers.getPlaces(universId, params);
        const payload = response?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const pages = payload?.pagination?.pages
          || computePages(payload?.pagination?.total ?? list.length, params.limit);

        const mapped = list.map((e) => {
          const rawStatus = e.status ?? e.state;
          let statusKey = typeof rawStatus === "number"
            ? (statusIntToKey[Number(rawStatus)] ?? undefined)
            : (rawStatus || undefined);
          const hourRanges = Array.isArray(e.hour)
            ? e.hour
                .filter((r) => Array.isArray(r) && r.length === 2 && typeof r[0] === "string" && typeof r[1] === "string")
                .map((r) => [r[0], r[1]])
            : [];
          const typeKey =
            typeof e.type === "number"
              ? (typeKeyOrder[e.type] || "other")
              : (e.type || "other");
          // Si un filtre status est actif côté UI, on garantit la cohérence d'affichage
          const requestedStatus = filterStatus !== "all" ? filterStatus : undefined;
          const derivedStatus = statusKey || requestedStatus || computeStatusFromHourRanges(hourRanges);
          return {
            id: e.id ?? e._id ?? String(Math.random()),
            typeKey,
            title: e.name || "",
            description: e.description || "",
            statusKey: derivedStatus,
            hourRanges,
            image: e.image || "",
            location: e.location || "",
          };
        });

        if (mounted) {
          setItems(mapped);
          setTotalPages(Number(pages || 1));
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
  }, [page, search, filterType, filterStatus, reloadTick]);

  // Reset page + spinner sur changement filtres/recherche
  useEffect(() => {
    if (page !== 0) setPage(0);
  }, [filterType, filterStatus, search]); // eslint-disable-line

  const breakpointColumnsObj = useMemo(() => ({ default: 3, 1100: 2, 700: 1 }), []);

  const reloadCurrent = () => setPage(0);

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

                    {Array.isArray(item.hourRanges) && item.hourRanges.length > 0 && (
                      <div className="UniEt-card-hours">
                        {item.hourRanges.map((r, idx) => (
                          <span key={`${item.id}-hr-${idx}`} className="UniEt-card-date">🕒 {formatHourLabel(r[0])} à {formatHourLabel(r[1])}</span>
                        ))}
                      </div>
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
                <></>
                )}
              {Array.isArray(selectedItem.hourRanges) && selectedItem.hourRanges.length > 0 && (
                <div className="uniet-preview-hours">
                  {selectedItem.hourRanges.map((r, idx) => (
                    <span key={`preview-hr-${idx}`} className="uniet-preview-date">🕒 {formatHourLabel(r[0])} à {formatHourLabel(r[1])}</span>
                  ))}
                </div>
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
            // statut retiré: calculé automatiquement via les horaires
            location: {
              type: "inputText",
              label: t("establishment.modal.fields.location"),
              key: "uniet-location",
            },
            ...(Array.from({ length: createRangeCount }).reduce((acc, _, i) => ({
              ...acc,
              [`range_${i}`]: {
                type: "timeRange",
                startKey: `rangeStart_${i}`,
                endKey: `rangeEnd_${i}`,
                options: HALF_HOUR_OPTIONS,
                startLabel: t("establishment.modal.fields.start"),
                endLabel: t("establishment.modal.fields.end"),
              },
            }), {})),
            addRange: {
              type: "button",
              text: "+",
              label: "",
              className: "cf-btn-success",
              onClick: () => setCreateRangeCount((c) => c + 1),
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
            const ranges = [];
            const startRegex = /^rangeStart_(\d+)$/;
            Object.keys(values).forEach((k) => {
              const m = k.match(startRegex);
              if (m) {
                const idx = m[1];
                const s = values[`rangeStart_${idx}`];
                const e = values[`rangeEnd_${idx}`];
                if (s && e && s < e) ranges.push([s, e]);
              }
            });
            const payload = {
              name: values.title,
              type: typeKey,
              description: values.description,
              image: values.image,
              public: 1,
              ...(ranges.length ? { date: ranges } : { date: [] }),
            };
            await ApiUnivers.createPlace(universId, payload);
            // Réinitialise sur la première page et force un rechargement
            setPage(0);
            setReloadTick((v) => v + 1);
            setShowCreateModal(false);
            setCreateRangeCount(1);
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
            // status retiré: calculé automatiquement via les horaires
            location: selectedItem.location,
            ...(Array.isArray(selectedItem.hourRanges)
              ? selectedItem.hourRanges.reduce((acc, r, i) => ({
                  ...acc,
                  [`rangeStart_${i}`]: r?.[0],
                  [`rangeEnd_${i}`]: r?.[1],
                }), {})
              : {}),
            image: selectedItem.image,
          }}
          onValuesChange={(vals) => {
            // Ajuste dynamiquement le nombre de paires pour couvrir toutes les clés initialisées
            const starts = Object.keys(vals).filter((k) => /^rangeStart_\d+$/.test(k));
            const maxIdx = starts.reduce((m, k) => Math.max(m, Number(k.split('_')[1]) || 0), -1);
            const desired = Math.max(maxIdx + 1, Array.isArray(selectedItem.hourRanges) ? selectedItem.hourRanges.length : 0, 1);
            if (desired !== (editRangeCount || 0)) setEditRangeCount(desired);
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
            // statut retiré: calculé automatiquement via les horaires
            location: {
              type: "inputText",
              label: t("establishment.modal.fields.location"),
              key: "uniet-location",
            },
            ...(Array.from({ length: Math.max(editRangeCount || 0, Array.isArray(selectedItem.hourRanges) ? selectedItem.hourRanges.length : 0, 1) }).reduce((acc, _, i) => ({
              ...acc,
              [`range_${i}`]: {
                type: "timeRange",
                startKey: `rangeStart_${i}`,
                endKey: `rangeEnd_${i}`,
                options: HALF_HOUR_OPTIONS,
                startLabel: t("establishment.modal.fields.start"),
                endLabel: t("establishment.modal.fields.end"),
              },
            }), {})),
            addRange: {
              type: "button",
              text: "+",
              label: "",
              className: "cf-btn-success",
              onClick: () => setEditRangeCount((c) => (c && c > 0 ? c + 1 : Math.max((Array.isArray(selectedItem.hourRanges) ? selectedItem.hourRanges.length : 0), 1) + 1)),
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
            const ranges = [];
            const startRegex = /^rangeStart_(\d+)$/;
            Object.keys(values).forEach((k) => {
              const m = k.match(startRegex);
              if (m) {
                const idx = m[1];
                const s = values[`rangeStart_${idx}`];
                const e = values[`rangeEnd_${idx}`];
                if (s && e && s < e) ranges.push([s, e]);
              }
            });
            const payload = {
              name: values.title,
              type: typeKey,
              description: values.description,
              image: values.image,
              public: 1,
              ...(ranges.length ? { date: ranges } : { date: [] }),
            };
            await ApiUnivers.updatePlace(universId, selectedItem.id, payload);
            setShowEditModal(false);
            setSelectedItem(null);
            setReloadTick((v) => v + 1);
            setEditRangeCount(0);
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
            await ApiUnivers.deletePlace(universId, selectedItem.id);
            // Rafraîchit depuis le serveur pour refléter la suppression
            setReloadTick((v) => v + 1);
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
