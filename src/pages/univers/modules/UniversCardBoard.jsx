import React, { useState, useEffect, useMemo } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardBoard.css";
import { BackLocation, BaseModal, ModalGeneric, Pagination, SearchBar } from "@components";
import { useTranslation } from "react-i18next";
import { ApiUnivers, PurifyHtml } from "@service";
import { useParams } from "react-router-dom";

const TYPE_COLORS = {
  quest: "#3498db",
  event: "#2ecc71",
  opening: "#f7d038"
};

const STATUS_COLORS = {
  waitingPlayer: "#e67e22",
  inProgress: "#3498db",
  done: "#95a5a6",
  waiting: "#f39c12",
  soon: "#9b59b6"
};

const UniversCardBoard = () => {
  const { t } = useTranslation('univers');
  const { id: universId } = useParams();

  // Filtres basés sur des clés internes; libellés via i18n
  // Sélection unique pour type et statut
  const [filterType, setFilterType] = useState("all"); // all | quest | event | opening
  const [filterStatus, setFilterStatus] = useState("all"); // all | waitingPlayer | inProgress | done | waiting | soon
  const [filterDate, setFilterDate] = useState("all"); // all | new | soon

  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // État issu de l'API
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  // Mapping statut API <-> clés internes UI
  const statusIntToKey = useMemo(() => ({
    0: "waitingPlayer",
    1: "waiting",
    2: "soon",
    3: "inProgress",
    4: "done",
  }), []);
  const statusKeyToInt = useMemo(() => ({
    waitingPlayer: 0,
    waiting: 1,
    soon: 2,
    inProgress: 3,
    done: 4,
  }), []);
  // Mapping statut UI -> libellé API attendu pour filtrage serveur
  const statusKeyToApiName = useMemo(() => ({
    waitingPlayer: 'pendingPlayer',
    waiting: 'pending',
    soon: 'soon',
    inProgress: 'progress',
    done: 'end',
  }), []);

  // Helpers mapping Types
  const typeApiToKey = (apiType) => apiType === 'open' ? 'opening' : apiType; // quest|event|open -> quest|event|opening
  const typeKeyToApi = (key) => key === 'opening' ? 'open' : key; // opening -> open

  // Helper: formatage vers YYYY-MM-DD HH:MM:SS à partir de diverses entrées (DD/MM/YYYY, YYYY-MM-DD, YYYY-MM-DDTHH:MM, etc.)
  const formatToSqlDateTime = (input) => {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim().replace('T', ' ');
    if (!trimmed) return null;
    // DD/MM/YYYY[ HH:MM]
    const dmy = trimmed.match(/^([0-3]?\d)\/([0-1]?\d)\/(\d{4})(?:\s+([0-2]?\d):([0-5]?\d))?$/);
    if (dmy) {
      const dd = String(dmy[1]).padStart(2, '0');
      const mm = String(dmy[2]).padStart(2, '0');
      const yyyy = dmy[3];
      const HH = String(dmy[4] ?? '00').padStart(2, '0');
      const MM = String(dmy[5] ?? '00').padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
    }
    // YYYY-MM-DD[ HH:MM]
    const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+([0-2]?\d):([0-5]?\d))?$/);
    if (ymd) {
      const yyyy = ymd[1];
      const mm = ymd[2];
      const dd = ymd[3];
      const HH = String(ymd[4] ?? '00').padStart(2, '0');
      const MM = String(ymd[5] ?? '00').padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
    }
    // Tentative générique Date()
    const dt = new Date(trimmed);
    if (!isNaN(dt.getTime())) {
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const HH = String(dt.getHours()).padStart(2, '0');
      const MM = String(dt.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:00`;
    }
    return null;
  };

  // Helper: convertir une date SQL/ISO en valeur pour input type="datetime-local" (YYYY-MM-DDTHH:MM)
  const toDatetimeLocal = (input) => {
    if (!input) return '';
    if (typeof input !== 'string') {
      const d = new Date(input);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const MM = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
    }
    // SQL like: YYYY-MM-DD HH:MM[:SS]
    const m1 = input.match(/^(\d{4})-(\d{2})-(\d{2})[ T]([0-2]?\d):([0-5]?\d)(?::\d{2})?/);
    if (m1) {
      const yyyy = m1[1];
      const mm = m1[2];
      const dd = m1[3];
      const HH = String(m1[4]).padStart(2, '0');
      const MM = String(m1[5]).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
    }
    // Fallback via Date parsing
    const d = new Date(input);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
  };

  // Helpers mapping libellés <-> clés pour les selects (utiliser les options des modales)
  const typeLabels = t('board.modal.typeOptions', { returnObjects: true }); // ["Quête", "Événement", "Ouverture"]
  const statusLabels = t('board.modal.statusOptions', { returnObjects: true }); // 5 labels dans l'ordre attendu
  const typeKeyOrder = ["quest", "event", "opening"];
  const statusKeyOrder = ["waitingPlayer", "inProgress", "done", "waiting", "soon"];
  const getTypeKeyFromLabel = (label) => {
    const idx = Array.isArray(typeLabels) ? typeLabels.indexOf(label) : -1;
    return typeKeyOrder[idx] ?? "quest";
  };
  const getStatusKeyFromLabel = (label) => {
    const idx = Array.isArray(statusLabels) ? statusLabels.indexOf(label) : -1;
    return statusKeyOrder[idx] ?? "waiting";
  };

  // Charger les quests depuis l'API (avec pagination, recherche et filtres côté serveur)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!universId) return;
      setIsLoading(true);
      setError("");
      try {
        const filterParams = {
          ...(filterType !== 'all' ? { type: typeKeyToApi(filterType) } : {}),
          ...(filterStatus !== 'all' ? { status: statusKeyToInt[filterStatus] } : {}),
          ...(filterDate !== 'all' ? { date: filterDate } : {}),
        };
        const params = {
          p: page,
          limit: 15,
          ...(search ? { search: search.trim() } : {}),
          ...(Object.keys(filterParams).length ? { filter: filterParams } : {}),
        };
        const { data } = await ApiUnivers.getQuests(universId, params);
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const mapped = list.map((q) => ({
          id: q.id,
          typeKey: typeApiToKey(q.type),
          title: q.name,
          description: q.description || "",
          statusKey: statusIntToKey[Number(q.status)] ?? 'waiting',
          date: q.beginAt || null,
          endAt: q.endAt || null,
          image: q.image || "",
        }));
        if (mounted) {
          setItems(mapped);
          // Utiliser le format officiel pagination renvoyé par l'API
          if (data && typeof data.pagination === 'object') {
            const total = Number(data.pagination.total) || 0;
            const limit = Number(data.pagination.limit) || 4;
            const pagesFromApi = Number(data.pagination.pages);
            const pages = Number.isFinite(pagesFromApi) && pagesFromApi > 0 ? pagesFromApi : Math.max(1, Math.ceil(total / limit));
            setTotalPages(pages);
          } else {
            setTotalPages(1);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError('loadError');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [universId, page, search, filterType, filterStatus, filterDate]);

  // Revenir à la page 0 et nettoyer l'affichage quand les filtres/recherche changent
  useEffect(() => {
    if (page !== 0) setPage(0);
    setItems([]);
    setIsLoading(true);
  }, [filterType, filterStatus, filterDate, search]);

  const now = new Date();

  // Filtrage côté serveur: on affiche directement les items renvoyés

  const breakpointColumnsObj = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="UniBo-container">
      <BackLocation />
      <h2 className="UniBo-title">{t('board.title')}</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(0); }}
          onClear={() => { setSearch(""); setPage(0); }}
        />
      </div>

      <div className="UniBo-filters">
        <div className="UniBo-filter-group">
          <span className="spanC">{t('board.filters.type')}</span>
          {["all", "quest", "event", "opening"].map(key => (
            <button
              key={key}
              className={`UniBo-filter-btn ${filterType===key?"active":""}`}
              onClick={() => setFilterType(key)}
            >
              {t(`board.filters.typeOptions.${key}`)}
            </button>
          ))}
        </div>

        <div className="UniBo-filter-group">
          <span className="spanC">{t('board.filters.status')}</span>
          {["all", "waitingPlayer", "inProgress", "done", "waiting", "soon"].map(key => (
            <button
              key={key}
              className={`UniBo-filter-btn ${filterStatus===key?"active":""}`}
              onClick={() => setFilterStatus(key)}
            >
              {t(`board.filters.statusOptions.${key}`)}
            </button>
          ))}
        </div>

        <div className="UniBo-filter-group">
          <span className="spanC">{t('board.filters.date')}</span>
          {["all", "new", "soon"].map(key => (
            <button
              key={key}
              className={`UniBo-filter-btn ${filterDate===key?"active":""}`}
              onClick={() => setFilterDate(key)}
            >
              {t(`board.filters.dateOptions.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="UniBo-loading">{t('common:loading') || 'Chargement...'}</div>
      ) : (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="UniBo-masonry-grid"
        columnClassName="UniBo-masonry-grid_column"
      >
        {items.map(item => {
          const typeLabel = t(`board.filters.typeOptions.${item.typeKey}`);
          const statusLabel = item.statusKey ? t(`board.filters.statusOptions.${item.statusKey}`) : null;
          return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="UniBo-card" onClick={() => setSelectedItem(item)} style={{cursor:'pointer'}}>
              <div className="UniBo-card-image-wrapper">
                <img src={item.image} alt={item.title} className="UniBo-card-image"/>
                <div className="UniBo-card-overlay">
                  <p dangerouslySetInnerHTML={{ __html: PurifyHtml(item.description) }} />
                </div>
              </div>
              <div className="UniBo-card-content">
                <h3 className="UniBo-card-title">{item.title}</h3>
                <div className="UniBo-card-badges">
                  <motion.span
                    key={item.typeKey + item.id + filterType}
                    className="UniBo-card-type"
                    style={{backgroundColor: TYPE_COLORS[item.typeKey]}}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {typeLabel}
                  </motion.span>

                  {statusLabel && (
                    <motion.span
                      key={item.statusKey + item.id + filterStatus}
                      className="UniBo-card-status"
                      style={{backgroundColor: STATUS_COLORS[item.statusKey]}}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {statusLabel}
                    </motion.span>
                  )}

                  {item.date && (
                    <span className="UniBo-card-date">
                      {(t('board.beginAtLabel') || "Début de l'évènement")}: {new Date(item.date).toLocaleString()}
                    </span>
                  )}
                  {item.endAt && (
                    <span className="UniBo-card-date">
                      {(t('board.endAtLabel') || "Fin de l'évènement")}: {new Date(item.endAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )})}
      </Masonry>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* Bouton flottant + */}
      <button
        className="UniBo-fab"
        aria-label={t('board.fab.aria')}
        title={t('board.fab.title')}
        onClick={() => setShowCreateModal(true)}
      >
        +
      </button>

      {/* Modal d'aperçu */}
      {selectedItem && (
        <BaseModal onClose={() => setSelectedItem(null)} className="uni-preview-modal">
          <div className="uni-preview-content">
            <img src={selectedItem.image} alt={selectedItem.title} className="uni-preview-image" />
            <div className="uni-preview-body">
              <h3 className="uni-preview-title">{selectedItem.title}</h3>
              <div className="uni-preview-badges">
                <span className="uni-preview-type" style={{backgroundColor: TYPE_COLORS[selectedItem.typeKey]}}>{t(`board.filters.typeOptions.${selectedItem.typeKey}`)}</span>
                {selectedItem.statusKey && (
                  <span className="uni-preview-status" style={{backgroundColor: STATUS_COLORS[selectedItem.statusKey]}}>{t(`board.filters.statusOptions.${selectedItem.statusKey}`)}</span>
                )}
                {selectedItem.date && (
                  <span className="uni-preview-date">{(t('board.beginAtLabel') || "Début de l'évènement")}: {new Date(selectedItem.date).toLocaleString()}</span>
                )}
                {selectedItem.endAt && (
                  <span className="uni-preview-date">{(t('board.endAtLabel') || "Fin de l'évènement")}: {new Date(selectedItem.endAt).toLocaleString()}</span>
                )}
              </div>
              <p className="uni-preview-description" dangerouslySetInnerHTML={{ __html: PurifyHtml(selectedItem.description) }} />
              <div className="uni-preview-actions tm-modal-buttons" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="cf-btn-success" onClick={() => setShowEditModal(true)}>
                  {t('board.modal.editAction') || 'Modifier'}
                </button>
                <button className="cf-btn-danger" onClick={() => setShowDeleteModal(true)}>
                  {t('board.modal.deleteAction') || 'Supprimer'}
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
          name="eventCreate"
          title={t('board.modal.createTitle')}
          fields={{
            type: {
              type: "select",
              value: t('board.modal.typeOptions', { returnObjects: true }),
              label: `${t('board.modal.fields.type')} `,
              key: "unibo-type",
            },
            title: {
              type: "inputText",
              label: `${t('board.modal.fields.title')} `,
              key: "unibo-title",
            },
            description: {
              type: "textarea",
              label: t('board.modal.fields.description'),
              key: "unibo-description",
            },
            status: {
              type: "select",
              value: t('board.modal.statusOptions', { returnObjects: true }),
              label: `${t('board.modal.fields.status')}`,
              key: "unibo-status",
            },
            date: {
              type: "inputDateTime",
              label: "Commence le (optionnel)",
              key: "unibo-date",
            },
            endDate: {
              type: "inputDateTime",
              label: "Date de fin (optionnel):",
              key: "unibo-endDate",
            },

            image: {
              type: "inputUrl",
              label: t('board.modal.fields.image'),
              key: "unibo-image",
            },
          }}
          textButtonValidate={t('board.modal.submit')}
          handleSubmit={async (values) => {
            try {
              const typeKey = getTypeKeyFromLabel(values.type);
              const statusKey = getStatusKeyFromLabel(values.status);
              const payload = {
                type: typeKeyToApi(typeKey),
                status: statusKeyToInt[statusKey] ?? 1,
                name: values.title,
                image: values.image,
                description: values.description,
                beginAt: formatToSqlDateTime(values.date),
                endAt: formatToSqlDateTime(values.endDate),
              };
              await ApiUnivers.createQuest(universId, payload);
              // Recharger avec les mêmes filtres côté serveur
              const reloadFilter = {
                ...(filterType !== 'all' ? { type: typeKeyToApi(filterType) } : {}),
                ...(filterStatus !== 'all' ? { status: statusKeyToApiName[filterStatus] } : {}),
                ...(filterDate !== 'all' ? { date: filterDate } : {}),
              };
              const { data } = await ApiUnivers.getQuests(universId, { p: 0, limit: 4, ...(search ? { search: search.trim() } : {}), ...(Object.keys(reloadFilter).length ? { filter: reloadFilter } : {}) });
              const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
              setItems(list.map((q) => ({
                id: q.id,
                typeKey: typeApiToKey(q.type),
                title: q.name,
                description: q.description || "",
                statusKey: statusIntToKey[Number(q.status)] ?? 'waiting',
                date: q.beginAt || null,
                endAt: q.endAt || null,
                image: q.image || "",
              })));
            } finally {
              setShowCreateModal(false);
            }
          }}
          isOpen
        />
      )}

      {/* Modal d'édition (identique à la création, préremplie) */}
      {showEditModal && selectedItem && (
        <ModalGeneric
          onClose={() => setShowEditModal(false)}
          noMemory
          name="eventEdit"
          title={t('board.modal.editTitle')}
          initialData={{
            type: typeLabels[typeKeyOrder.indexOf(selectedItem.typeKey)] ?? typeLabels[0],
            title: selectedItem.title,
            description: selectedItem.description,
            status: statusLabels[statusKeyOrder.indexOf(selectedItem.statusKey)] ?? statusLabels[0],
            date: toDatetimeLocal(selectedItem.date),
            endDate: toDatetimeLocal(selectedItem.endAt),
            image: selectedItem.image,
          }}
          fields={{
            type: {
              type: "select",
              value: t('board.modal.typeOptions', { returnObjects: true }),
              label: `${t('board.modal.fields.type')} `,
              key: "unibo-type",
            },
            title: {
              type: "inputText",
              label: `${t('board.modal.fields.title')} `,
              key: "unibo-title",
            },
            description: {
              type: "textarea",
              label: t('board.modal.fields.description'),
              key: "unibo-description",
            },
            status: {
              type: "select",
              value: t('board.modal.statusOptions', { returnObjects: true }),
              label: `${t('board.modal.fields.status')}`,
              key: "unibo-status",
            },
            date: {
              type: "inputDateTime",
              label: "Commence le (optionnel)",
              key: "unibo-date",
            },
            endDate: {
              type: "inputDateTime",
              label: "date de fin (optionnel):",
              key: "unibo-endDate",
            },

            image: {
              type: "inputUrl",
              label: t('board.modal.fields.image'),
              key: "unibo-image",
            },
          }}
          textButtonValidate={t('board.modal.update')}
          handleSubmit={async (values) => {
            try {
              const typeKey = getTypeKeyFromLabel(values.type);
              const statusKey = getStatusKeyFromLabel(values.status);
              const payload = {
                type: typeKeyToApi(typeKey),
                status: statusKeyToInt[statusKey] ?? 1,
                name: values.title,
                image: values.image,
                description: values.description,
                beginAt: formatToSqlDateTime(values.date),
                endAt: formatToSqlDateTime(values.endDate),
              };
              await ApiUnivers.updateQuest(universId, selectedItem.id, payload);
              setItems(prev => prev.map(it => it.id === selectedItem.id ? {
                ...it,
                typeKey,
                title: values.title || it.title,
                description: values.description || it.description,
                statusKey,
                date: values.date || it.date,
                endAt: values.endDate || it.endAt,
                image: values.image || it.image,
              } : it));
            } finally {
              setShowEditModal(false);
              setSelectedItem(null);
            }
          }}
          isOpen
        />
      )}

      {/* Modal de suppression (confirmation) */}
      {showDeleteModal && selectedItem && (
        <ModalGeneric
          onClose={() => setShowDeleteModal(false)}
          noMemory
          name="eventDelete"
          title={t('board.modal.deleteTitle')}
          fields={{
            confirm: {
              type: "confirmation",
              label: t('board.modal.deleteConfirmLabel'),
              message: t('board.modal.deleteConfirmMessage'),
            }
          }}
          textButtonValidate={t('board.modal.deleteSubmit')}
          handleSubmit={async (values) => {
            if (!values.confirm) return; // sécurité
            try {
              await ApiUnivers.deleteQuest(universId, selectedItem.id);
              setItems(prev => prev.filter(it => it.id !== selectedItem.id));
            } finally {
              setShowDeleteModal(false);
              setSelectedItem(null);
            }
          }}
          isOpen
        />
      )}
    </div>
  );
};

export default UniversCardBoard;
