import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardBoard.css";
import { BackLocation, BaseModal, ModalGeneric } from "@components";
import { useTranslation } from "react-i18next";

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

  // Filtres basés sur des clés internes; libellés via i18n
  const [filterType, setFilterType] = useState("all"); // all | quest | event | opening
  const [filterStatus, setFilterStatus] = useState("all"); // all | waitingPlayer | inProgress | done | waiting | soon
  const [filterDate, setFilterDate] = useState("all"); // all | new | soon

  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Données exemple enrichies avec des clés internes
  const ITEMS_DATA = [
    { id: 1, typeKey: 'quest',   title: "Quête magique", description: "Résoudre l’énigme du vieux mage.", statusKey: 'waitingPlayer', date: null, image: "https://i.pinimg.com/736x/50/43/61/504361f450ac78d5cfcb3ce09a365d22.jpg" },
    { id: 2, typeKey: 'event',   title: "Festival annuel", description: "Célébration dans le village central.", statusKey: 'soon', date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },
    { id: 3, typeKey: 'opening', title: "Nouveau café", description: "Ouverture d’un café artisanal.", statusKey: 'soon', date: "2025-09-20 10:00", image: "https://i.pinimg.com/736x/53/83/d4/5383d4dd98bd9439d458969b81af0a6e.jpg" },
    { id: 4, typeKey: 'quest',   title: "Chasse au trésor", description: "Trouver les gemmes cachées.", statusKey: 'inProgress', date: null, image: "https://i.pinimg.com/736x/57/38/b8/5738b8c8e930e00dd44ed4370183c3bd.jpg" },
    { id: 5, typeKey: 'event',   title: "Concert en ville", description: "Performance des musiciens locaux.", statusKey: 'done', date: "2025-09-10 20:00", image: "https://i.pinimg.com/736x/27/38/e9/2738e97cc2938e9b26d8cb34401e8e8c.jpg" },
    { id: 6, typeKey: 'opening', title: "Nouvelle bibliothèque", description: "Bibliothèque ouverte au public.", statusKey: 'inProgress', date: "2025-09-15 09:00", image: "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg" },
    { id: 7, typeKey: 'event',   title: "Concert en ville", description: "Performance des musiciens locaux.", statusKey: 'done', date: "2025-09-10 20:00", image: "https://i.pinimg.com/736x/27/38/e9/2738e97cc2938e9b26d8cb34401e8e8c.jpg" },
    { id: 8, typeKey: 'opening', title: "Nouvelle bibliothèque", description: "Bibliothèque ouverte au public.", statusKey: 'inProgress', date: "2025-09-15 09:00", image: "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg" },
    { id: 9, typeKey: 'event',   title: "Festival annuel", description: "Célébration dans le village central.", statusKey: 'soon', date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },
    { id: 10, typeKey: 'event',  title: "Festival annuel", description: "Célébration dans le village central.", statusKey: 'soon', date: "2025-10-05 18:00", image: "https://i.pinimg.com/736x/6f/5b/ad/6f5bad23afe5a1b66e838bcc4bf35925.jpg" },
  ];

  // État simulant la réponse API
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simule une requête API pour précharger les données
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        setItems(ITEMS_DATA);
        setIsLoading(false);
      }
    }, 600);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const now = new Date();

  const filteredItems = items.filter(item => {
    const matchType = filterType === "all" || item.typeKey === filterType;
    const matchStatus = filterStatus === "all" || item.statusKey === filterStatus;

    let matchDate = true;
    if(filterDate === "new") {
      matchDate = !item.date || new Date(item.date) <= now;
    } else if(filterDate === "soon") {
      matchDate = item.date && new Date(item.date) > now;
    }

    return matchType && matchStatus && matchDate;
  });

  const breakpointColumnsObj = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="UniBo-container">
      <BackLocation />
      <h2 className="UniBo-title">{t('board.title')}</h2>

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
        {filteredItems.map(item => {
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
                  <p>{item.description}</p>
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

                  {item.date && <span className="UniBo-card-date">{new Date(item.date).toLocaleString()}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )})}
      </Masonry>
      )}

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
                  <span className="uni-preview-date">{new Date(selectedItem.date).toLocaleString()}</span>
                )}
              </div>
              <p className="uni-preview-description">{selectedItem.description}</p>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <ModalGeneric
          onClose={() => setShowCreateModal(false)}
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
              type: "inputText",
              label: t('board.modal.fields.date'),
              key: "unibo-date",
              placeholder: t('board.modal.fields.datePlaceholder')
            },
            image: {
              type: "inputUrl",
              label: t('board.modal.fields.image'),
              key: "unibo-image",
            },
          }}
          textButtonValidate={t('board.modal.submit')}
          handleSubmit={(values) => { console.log("Nouvel événement créé:", values); setShowCreateModal(false); }}
          isOpen
        />
      )}
    </div>
  );
};

export default UniversCardBoard;
