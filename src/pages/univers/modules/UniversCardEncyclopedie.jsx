import React, { useEffect, useMemo, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEncyclopedie.css";
import { BackLocation, ModalGeneric } from "@components";
import { useNavigatePage, PurifyHtml, ApiUnivers, DroitAccess } from "@service";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Data now loaded from API

const breakpointColumnsObj = {
  default: 5, // 5 colonnes max
  1600: 5,
  1300: 4,
  1000: 3,
  700: 2,
  500: 1,
};


const UniversCardEncyclopedie = () => {
  const { t } = useTranslation();
  const { id: universId, encyId } = useParams();
  const navigate = useNavigatePage();
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [currentArticleLinks, setCurrentArticleLinks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articleHtmlHeight, setArticleHtmlHeight] = useState(400);
  const imageRef = useRef(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const loadSequenceRef = useRef(0);
  const [droits, setDroits] = useState(null);
  // Création avancée: action et listes
  const [createAction, setCreateAction] = useState('create');
  const [universList, setUniversList] = useState([]);
  const [universListLoading, setUniversListLoading] = useState(false);
  const [selectedUniversSearchId, setSelectedUniversSearchId] = useState("");
  const [publicBooks, setPublicBooks] = useState([]);
  const [publicBooksLoading, setPublicBooksLoading] = useState(false);
  const [selectedPublicBookId, setSelectedPublicBookId] = useState("");
  const [extName, setExtName] = useState("");
  const [extImage, setExtImage] = useState("");
  const [extLink, setExtLink] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  // États pour les listes dynamiques dans la modale
  const [modalUniversList, setModalUniversList] = useState([]);
  const [modalPublicBooks, setModalPublicBooks] = useState([]);
  const [modalUniversLoading, setModalUniversLoading] = useState(false);
  const [modalBooksLoading, setModalBooksLoading] = useState(false);
  const [modalSelectedUniversName, setModalSelectedUniversName] = useState("");
  // Champs pour création interne
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createTexte, setCreateTexte] = useState("");
  const [createImage, setCreateImage] = useState("");
  const [createType, setCreateType] = useState("encyclopédie");
  const [createPublic, setCreatePublic] = useState("non");
  // Modal de suppression de bookLink
  const [openDeleteLink, setOpenDeleteLink] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  // Modal de suppression de book
  const [openDeleteBook, setOpenDeleteBook] = useState(false);
  // Nom de l'univers actuel pour la modale
  const [currentUniversName, setCurrentUniversName] = useState("");

  const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Fonction utilitaire pour mapper les données des livres
  const mapBookData = (book) => ({
    id: book.id,
    name: book.name,
    description: book.description,
    type: book.type,
    image: book.image,
    externalLink: book.externalLink || null,
    _isLink: !!book.idLink,
    _idLink: book.idLink,
  });

  // Fonction utilitaire pour mapper les données des liens
  const mapLinkData = (link) => {
    const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
    return {
      id: link.id,
      name: link.name,
      description: link.description,
      type: link.type,
      image: link.image,
      externalLink: isExternal ? link.location : null,
      _linkDesc: link.description,
      _isLink: true,
    };
  };

  // Fonction utilitaire pour charger et mettre à jour les données
  const loadAndUpdateData = async () => {
    if (encyId === 'all') {
      let items = [];
      if (viewMode === 'category') {
        const { data } = await ApiUnivers.getBooks(universId, { type: 'Categorie' });
        items = (Array.isArray(data) ? data : []).map(mapBookData);
      } else {
        const { data } = await ApiUnivers.getBooks(universId, {
          nameBook: search || undefined,
        });
        items = (Array.isArray(data) ? data : []).map(mapBookData);
      }
      setCurrentArticleLinks(items);
      setCurrentBook(null);
    } else {
      const { data } = await ApiUnivers.getBookDetail(universId, encyId);
      setCurrentBook(data || null);
      const items = (data?.link || []).map(mapLinkData);
      setCurrentArticleLinks(items);
    }
  };

  const hasNonEmptyHtml = (html) => {
    if (!html || typeof html !== 'string') return false;
    const sanitized = PurifyHtml(html);
    const text = sanitized
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return text.length > 0;
  };

  // Ensure we have an encyclopedie id in URL; default to page article id=0

  // Récupérer à partir du module encyclopedie et gérer la navigation
  useEffect(() => {
    if (universId && encyId === undefined) {
      navigate(`/univers/${universId}/encyclopedie/all`, { replace: true });
    }
  }, [universId, encyId, navigate]);

  // Récupérer l'article correspondant à l'encyId et construire les liens
  useEffect(() => {
    const controller = new AbortController();
    const currentSeq = ++loadSequenceRef.current;
    async function load() {
      if (!universId || encyId === undefined) return;
      setLoading(true);
      setError(null);
      try {
        await loadAndUpdateData();
      } catch (e) {
        setError(t('univers:encyclopedie.loadError', 'Erreur lors du chargement de l\'encyclopédie'));
        setCurrentArticleLinks([]);
        setCurrentBook(null);
      } finally {
        if (loadSequenceRef.current === currentSeq) {
          setLoading(false);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [universId, encyId, search, viewMode, t]);

  const currentArticle = currentBook || null;
  const noTextHasImage = !!(
    currentArticle && !hasNonEmptyHtml(currentArticle.texte) && currentArticle.image
  );

  // Fonction pour calculer la hauteur de l'image et ajuster la hauteur du texte
  useEffect(() => {
    const updateArticleHtmlHeight = () => {
      if (imageRef.current) {
        const imageHeight = imageRef.current.offsetHeight-20;
        setArticleHtmlHeight(imageHeight);
      }
    };

    // Observer pour détecter les changements de taille de l'image
    const resizeObserver = new ResizeObserver(updateArticleHtmlHeight);
    
    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
      updateArticleHtmlHeight(); // Calcul initial
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentArticle]);

  useEffect(() => {
    let mounted = true;
    async function loadUnivers() {
      if (!universId) return;
      try {
        const res = await ApiUnivers.getDetailUnivers(universId);
        if (!mounted) return;
        setDroits(res?.data?.droit ?? null);
      } catch (_) {
        if (!mounted) return;
        setDroits(null);
      }
    }
    loadUnivers();
    return () => { mounted = false; };
  }, [universId]);

  // Charger le texte complet pour l'aperçu si absent
  useEffect(() => {
    const controller = new AbortController();
    async function ensurePreviewText() {
      if (!openArticle || !universId) return;
      if (openArticle.texte || openArticle.text) return;
      if (!openArticle.id) return;
      try {
        const { data } = await ApiUnivers.getBookDetail(universId, openArticle.id);
        setOpenArticle(prev => prev && prev.id === openArticle.id ? { ...prev, texte: data?.texte || "" } : prev);
      } catch (_) {
        // ignore fetch errors for preview
      }
    }
    ensurePreviewText();
    return () => controller.abort();
  }, [openArticle, universId]);

  // Charger les univers pour la modale
  useEffect(() => {
    let mounted = true;
    async function loadUniversForModal() {
      if (!openCreate) return;
      try {
        setModalUniversLoading(true);
        // Utiliser la route qui retourne directement les univers avec leurs books publics
        const { data } = await ApiUnivers.getUniversWithPublicBooks(universId, {});
        if (!mounted) return;
        const universItems = Array.isArray(data) ? data : [];
        
        // Filtrer les univers qui ont au moins un book public
        const withPublic = universItems.map(u => ({ id: u.idUnivers, name: u.name }));
        
        // Trouver et définir le nom de l'univers actuel
        const currentUni = withPublic.find(u => String(u.id) === String(universId));
        if (currentUni) {
          setCurrentUniversName(currentUni.name);
        }
        
        setModalUniversList(withPublic);
      } finally {
        setModalUniversLoading(false);
      }
    }
    loadUniversForModal();
    return () => { mounted = false; };
  }, [openCreate, universId]);

  // Charger les books publics quand l'univers actuel est sélectionné dans la modale "Chercher"
  useEffect(() => {
    let mounted = true;
    async function loadCurrentUniversBooks() {
      if (!openCreate) return;
      if (modalUniversList.length === 0) return; // Attendre que la liste des univers soit chargée
      
      try {
        setModalBooksLoading(true);
        // Charger les books de l'univers actuel pour l'action "Chercher"
        const { data } = await ApiUnivers.getBooks(universId, {});
        if (!mounted) return;
        const items = Array.isArray(data) ? data : [];
        setModalPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
      } catch (err) {
        setModalPublicBooks([]);
      } finally {
        setModalBooksLoading(false);
      }
    }
    loadCurrentUniversBooks();
    return () => { mounted = false; };
  }, [openCreate, universId, modalUniversList]);

  // Initialiser le formulaire de création quand on ouvre ou bascule sur "create"
  useEffect(() => {
    if (!openCreate) return;
    if (createAction !== 'create') return;
    setCreateName("");
    setCreateDescription("");
    setCreateTexte("");
    setCreateImage("");
    setCreateType(currentBook?.name ? toTitleCase(currentBook.name) : (viewMode === 'category' ? 'Catégorie' : 'encyclopédie'));
    setCreatePublic("non");
  }, [openCreate, createAction, currentBook, viewMode]);

  // Charger les univers utilisateur quand createAction = 'search'
  useEffect(() => {
    let mounted = true;
    async function loadUnivers() {
      if (createAction !== 'search') return;
      try {
        setUniversListLoading(true);
        const { data } = await ApiUnivers.getUnivers({});
        if (!mounted) return;
        const items = Array.isArray(data) ? data : [];
        setUniversList(items.map(u => ({ id: u.id, name: u.name })));
      } finally {
        setUniversListLoading(false);
      }
    }
    loadUnivers();
    return () => { mounted = false; };
  }, [createAction]);

  function possibleAddLink() {
    return currentBook !== null;
  }

  // Charger livres publics quand univers sélectionné
  useEffect(() => {
    let mounted = true;
    async function loadPublicBooks() {
      if (createAction !== 'search') return;
      if (!selectedUniversSearchId) { setPublicBooks([]); return; }
      try {
        setPublicBooksLoading(true);
        const { data } = await ApiUnivers.getUniversWithPublicBooks(selectedUniversSearchId, {});
        if (!mounted) return;
        const items = Array.isArray(data) ? data : (Array.isArray(data?.books) ? data.books : []);
        setPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
      } finally {
        setPublicBooksLoading(false);
      }
    }
    loadPublicBooks();
    return () => { mounted = false; };
  }, [createAction, selectedUniversSearchId]);

  return (
    <div className="UniEncy-container">
      {noTextHasImage && (
        <div
          className="UniEncy-page-bg"
          style={{ backgroundImage: `url(${currentArticle.image})` }}
        />
      )}
      <div className="UniEncy-header">
      <BackLocation />
          <div className="UniEncy-mode">
            <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <div className="UniEncy-mode-row">
              <button
                type="button"
                className={`UniEncy-mode-btn ${encyId === 'all' && viewMode === "all" ? "active" : ""}`}
                onClick={() => {
                  if (encyId === 'all' && viewMode === 'all') return;
                  setViewMode("all");
                  setFilter("Tous");
                  setSearch("");
                  navigate(`/univers/${universId}/encyclopedie/all`)
                }}
              >
                {t('univers:encyclopedie.viewAll')}
              </button>
              <button
                type="button"
                className={`UniEncy-mode-btn ${encyId === 'all' && viewMode === "category" ? "active" : ""}`}
                onClick={() => {
                  if (encyId === 'all' && viewMode === 'category') return;
                  setViewMode("category");
                  setFilter("Tous");
                  setSearch("");
                  if (universId) {
                    navigate(`/univers/${universId}/encyclopedie/all`);
                  }
                }}
              >
                {t('univers:encyclopedie.byCategory')}
              </button>
            </div>
            <div className="UniEncy-mode-rowtwo">
            {DroitAccess.hasWriteAccess(droits) && (
              <button
                type="button"
                className="UniEncy-mode-btn"
              onClick={() => setOpenCreate(true)}
              >
                {t('common:create')}
              </button>
              )}
              {currentBook && String(currentBook.id) === encyId && (
                <>
                {DroitAccess.hasWriteAccess(droits) && (
                  <button
                    type="button"
                    className="UniEncy-mode-btn"
                    onClick={async () => {
                      // S'assurer que les données du book sont à jour
                      if (currentBook.id !== encyId) {
                        const { data } = await ApiUnivers.getBookDetail(universId, encyId);
                        setCurrentBook(data || null);
                      }
                      setOpenEdit(true);
                    }}
                  >
                    {t('common:edit')}
                  </button>
                  )}
                  {DroitAccess.hasWriteAccess(droits) && (
                  <button
                    type="button"
                    className="UniEncy-mode-btn"
                    onClick={async () => {
                      // S'assurer que les données du book sont à jour
                      if (currentBook.id !== encyId) {
                        const { data } = await ApiUnivers.getBookDetail(universId, encyId);
                        setCurrentBook(data || null);
                      }
                      setOpenDeleteBook(true);
                    }}
                  >
                    {t('common:delete')}
                  </button>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
      </div>
      


      
      <h2 className="UniEncy-title">{currentArticle?.name || t('univers:encyclopedie.titleDefault')}</h2>
      
      {/* Layout image à gauche, texte à droite */}
      {currentArticle && (
        <div className="UniEncy-article-layout">
          {currentArticle.image && !noTextHasImage && (
            <div className="UniEncy-decoration-top-left"></div>
          )}
          {currentArticle.image && !noTextHasImage && (
            <div className="UniEncy-article-image-container" ref={imageRef}>
              <img 
                src={currentArticle.image} 
                alt={currentArticle.name}
                className="UniEncy-article-image"
              />
            </div>
          )}
          
                {hasNonEmptyHtml(currentArticle.texte) && (
                  <div
                    className={`UniEncy-article-html ${!currentArticle.image ? 'no-image' : ''}`}
                    dangerouslySetInnerHTML={{ __html:   `<div class=\"UniEncy-article-html-content\"> ${PurifyHtml(currentArticle.texte)}</div>` }}
                  />
                )}
          
          {currentArticle.image && !noTextHasImage && (
            <div className="UniEncy-decoration-bottom-right"></div>
          )}
        </div>
        
      )}
      
      {error && (
        <div className="UniEncy-article-empty" style={{ maxWidth: 1000, margin: "0 auto 12px" }}>
          <p>{error}</p>
        </div>
      )}

      {currentArticle?.image && !noTextHasImage && (
        <div className="UniEncy-content-separator"></div>
      )}

      {encyId === "all" && viewMode === "all" && (
        <div className="UniEncy-controls">
          <input
            type="text"
            placeholder={t('univers:encyclopedie.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="UniEncy-search"
          />
          {/* Types non gérés côté API pour le moment */}
        </div>
      )}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="UniEncy-masonry"
        columnClassName="UniEncy-column"
      >
        {currentArticleLinks.map((item, idx) => {
            const linkDesc = item._linkDesc;
            return (
          <motion.div
            key={item.id}
            className="UniEncy-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ scale: 1.03 }}
          >
            <div
              className="UniEncy-card-image"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="UniEncy-card-content">
              <h3>{item.name}</h3>
              <div
                className="UniEncy-card-desc"
                dangerouslySetInnerHTML={{ __html: PurifyHtml(linkDesc || item.description || "") }}
              />
              <span className="UniEncy-card-type">{item.type}</span>
            </div>
            {/* Bouton de suppression pour les bookLinks */}
            {item._isLink && (
              <button
                className="UniEncy-card-delete"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBookToDelete(item);
                  setOpenDeleteLink(true);
                }}
                title={t('common:delete')}
              >
                ×
              </button>
            )}
            <div
              className="UniEncy-card-clickable"
              onClick={(e) => {
                e.preventDefault();
                setOpenArticle(item);
              }}
            />
          </motion.div>
        );
          })}
      </Masonry>

      {openArticle && (
        <div className="UniEncy-modal-backdrop" onClick={() => setOpenArticle(null)}>
          <div className="UniEncy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="UniEncy-modal-header">
              <div className="UniEncy-modal-title">
                <img className="UniEncy-modal-thumb" src={openArticle.image} alt={openArticle.name} />
                <div>
                  <h3>{openArticle.name}</h3>
                  <div
                    className="UniEncy-modal-desc"
                    dangerouslySetInnerHTML={{ __html: PurifyHtml(openArticle.description || "") }}
                  />
                </div>
              </div>
              <button className="UniEncy-modal-close" onClick={() => setOpenArticle(null)} aria-label="Fermer">×</button>
            </div>

            <div className="UniEncy-modal-body">
              {hasNonEmptyHtml(openArticle.texte || openArticle.text) ? (
                <div
                  className="UniEncy-article-html"
                  dangerouslySetInnerHTML={{ 
                    __html: `<div class=\"UniEncy-article-html-content\"> ${PurifyHtml(openArticle.texte || openArticle.text || '')}</div>` 
                  }}
                />
              ) : (
                <div className="UniEncy-article-empty">
                  <p>{t('univers:encyclopedie.noText')}</p>
                </div>
              )}

              <div className="UniEncy-modal-actions">
                <button
                  type="button"
                  className="UniEncy-go-btn"
                  onClick={() => {
                    if (openArticle.externalLink) {
                      window.open(openArticle.externalLink, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/univers/${universId}/encyclopedie/${openArticle.id}`);
                    }
                    setOpenArticle(null);
                  }}
                >
                  {openArticle.externalLink ? t('univers:encyclopedie.openExternal') : t('univers:encyclopedie.goToPage')}
                </button>
                
                {openArticle.externalLink && DroitAccess.hasWriteAccess(droits) && (
                  <button
                    type="button"
                    className="UniEncy-delete-btn"
                    onClick={async () => {
                      try {
                        await ApiUnivers.deleteBook(universId, openArticle.id);
                        setOpenArticle(null);
                        await loadAndUpdateData();
                      } catch (error) {
                        console.error('Erreur lors de la suppression du lien externe:', error);
                        alert('Erreur lors de la suppression du lien externe');
                      }
                    }}
                  >
                    {t('common:delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {openCreate && (
        <ModalGeneric
          name="ency-create"
          title={t('univers:encyclopedie.modals.create.title')}
          isOpen
          onClose={() => setOpenCreate(false)}
          initialData={{
            action: t('univers:encyclopedie.modals.create.actions.create'),
            type: currentBook?.name ? toTitleCase(currentBook.name) : (viewMode === 'category' ? 'Catégorie' : ''),
            selectedUniversSearchId: currentUniversName,
            selectedPublicBookId: '',
          }}
          onValuesChange={(vals) => {
            const actionSearch = t('univers:encyclopedie.modals.create.actions.search');
            // Mémoriser le nom de l'univers sélectionné
            if (vals.action === actionSearch) {
              const selectedName = vals.selectedUniversSearchId || "";
              setModalSelectedUniversName(selectedName);
            } else {
              setModalSelectedUniversName("");
            }
            // Charger les livres publics quand un univers est sélectionné
            if (vals.action === actionSearch && vals.selectedUniversSearchId) {
              const uni = modalUniversList.find(u => u.name === vals.selectedUniversSearchId);
              if (!uni) { 
                setModalPublicBooks([]); 
                return; 
              }
              // Recharger les books pour cet univers spécifique
              let mounted = true;
              (async () => {
                try {
                  setModalBooksLoading(true);
                  // Si c'est notre univers actuel, afficher tous les articles (publics et privés)
                  if (String(uni.id) === String(universId)) {
                    const { data } = await ApiUnivers.getBooks(universId, {});
                    if (!mounted) return;
                    const items = Array.isArray(data) ? data : [];
                    setModalPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
                  } else {
                    // Pour les autres univers, utiliser searchInUnivers pour les publics
                    const { data } = await ApiUnivers.getBooks(universId, {searchInUnivers: uni.id});
                    if (!mounted) return;
                    const items = Array.isArray(data) ? data : [];
                    setModalPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
                  }
                } catch (err) {
                  setModalPublicBooks([]);
                } finally {
                  setModalBooksLoading(false);
                }
              })();
              return () => { mounted = false; };
            } else if (vals.action !== actionSearch) {
              setModalPublicBooks([]);
            }
          }}
          handleSubmit={async (values) => {
            const actionCreate = t('univers:encyclopedie.modals.create.actions.create');
            const actionSearch = t('univers:encyclopedie.modals.create.actions.search');
            const actionExternal = t('univers:encyclopedie.modals.create.actions.addExternal');
            const yesLabel = t('univers:encyclopedie.modals.create.fields.yes');
            if (values.action === actionCreate) {
              const payload = {
                name: values.name || "",
                description: values.description || "",
                texte: values.texte || "",
                type: values.type || "encyclopédie",
                image: values.image || "",
                public: values.public === yesLabel ? 1 : 0,
                idLink: null,
                link: [],
                connectArticle: currentBook?.id ?? null,
                externalLink: null,
              };
              await ApiUnivers.createBook(universId, payload);
            } else if (values.action === actionSearch) {
              // Utiliser la sélection de l'utilisateur ou le premier article disponible par défaut
              const bookToSelect = values.selectedPublicBookId || (modalPublicBooks.length > 0 ? modalPublicBooks[0].name : null);
              if (bookToSelect) {
                // Trouver l'ID du livre sélectionné (par nom)
                const selectedBook = modalPublicBooks.find(b => b.name === bookToSelect);
                if (selectedBook) {
                  await ApiUnivers.addBookLink(universId, currentBook.id, { idBook: selectedBook.id });
                }
              }
            } else if (values.action === actionExternal) {
              if (values.name && values.link) {
                const payload = {
                  name: values.name || "",
                  description: values.description || "",
                  texte: values.texte || "",
                  type: values.type || "encyclopédie",
                  image: values.image || "",
                  public: values.public === yesLabel ? 1 : 0,
                  idLink: null,
                  link: [],
                  connectArticle: currentBook?.id ?? null,
                  externalLink: values.link,
                };
                await ApiUnivers.createBook(universId, payload);
              }
            }
            setOpenCreate(false);
            await loadAndUpdateData();
          }}
          fields={{
            articleActuel: { type: "html", label: "", value: `${t('univers:encyclopedie.modals.create.articleCurrent', { label: currentBook?.name || (viewMode === 'category' ? 'Catégorie' : t('univers:encyclopedie.viewAll')) })}` },
            action: {
              type: 'selectSwitch',
              label: t('univers:encyclopedie.modals.create.actionLabel'),
              value: [
                t('univers:encyclopedie.modals.create.actions.create'),
                t('univers:encyclopedie.modals.create.actions.search'),
                t('univers:encyclopedie.modals.create.actions.addExternal')
              ],
              default: t('univers:encyclopedie.modals.create.actions.create'),
              behavior: {
                [t('univers:encyclopedie.modals.create.actions.search')]: possibleAddLink
              },
              cases: {
                [t('univers:encyclopedie.modals.create.actions.create')]: {
                  name: { type: "inputText", label: t('common:nom') },
                  description: { type: "textarea", label: t('common:description') },
                  texte: { type: "textarea", label: t('common:description') },
                  image: { type: "inputUrl", label: t('common:imgUrl') },
                  type: { type: "select", label: t('univers:encyclopedie.modals.create.fields.type'), value: ["encyclopédie","Catégorie","Créature","Objet","Artefact","Lieu","Magie","Peuple"], another: true },
                  public: { type: "select", label: t('univers:encyclopedie.modals.create.fields.public'), value: [t('univers:encyclopedie.modals.create.fields.no'), t('univers:encyclopedie.modals.create.fields.yes')] },
                },
                [t('univers:encyclopedie.modals.create.actions.search')]: {
                  selectedUniversSearchId: { 
                    type: 'select', 
                    label: t('univers:encyclopedie.modals.create.fields.selectedUniversSearchId'), 
                    value: modalUniversList.map(u => u.name)
                  },
                  selectedPublicBookId: { 
                    type: 'select', 
                    label: t('univers:encyclopedie.modals.create.fields.selectedPublicBookId'), 
                    value: (modalPublicBooks.length > 0 ? modalPublicBooks.map(b => b.name) : [t('univers:encyclopedie.modals.create.noPublicArticles')])
                  }
                },
                [t('univers:encyclopedie.modals.create.actions.addExternal')]: {
                  name: { type: 'inputText', label: t('common:nom') },
                  description: { type: "textarea", label: t('common:description') },
                  image: { type: 'inputUrl', label: t('common:imgUrl') },
                  link: { type: 'inputText', label: t('univers:encyclopedie.modals.create.fields.link') },
                },
              }
            },
          }}
          textButtonValidate="save"
          noClose={true}
        />
      )}

      {openEdit && currentBook && String(currentBook.id) === encyId && (
        <ModalGeneric
          name="ency-edit"
          title={t('univers:encyclopedie.modals.edit.title')}
          isOpen
          onClose={() => setOpenEdit(false)}
          initialData={{
            name: currentBook.name,
            description: currentBook.description,
            texte: currentBook.texte,
            image: currentBook.image,
            type: toTitleCase(currentBook.type || ''),
            public: Number(currentBook.public) === 1 ? 'oui' : 'non',
            idLink: currentBook.idLink ?? '',
          }}
          handleSubmit={async (values) => {
            const payload = {
              name: values.name,
              description: values.description,
              texte: values.texte,
              type: values.type,
              image: values.image,
              public: values.public === 'oui' ? 1 : 0,
            };
            await ApiUnivers.updateBook(universId, currentBook.id, payload);
            setOpenEdit(false);
            const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
            setCurrentBook(data || null);
          }}
          fields={{
            name: { type: "inputText", label: t('common:nom') },
            description: { type: "textarea", label: t('common:description') },
            texte: { type: "textarea", label: t('common:description') },
            image: { type: "inputUrl", label: t('common:imgUrl') },
            type: { type: "select", label: t('univers:encyclopedie.modals.create.fields.type'), value: ["Catégorie","Créature","Objet","Artefact","Lieu","Magie","Peuple","encyclopédie"], another: true },
            public: { type: "select", label: t('univers:encyclopedie.modals.create.fields.public'), value: [t('univers:encyclopedie.modals.create.fields.no'), t('univers:encyclopedie.modals.create.fields.yes')] },
            idLink: { type: "inputText", label: "idLink" },
            // idLink intentionally omitted in create modal; it is auto-derived if on a book detail
          }}
          textButtonValidate="save"
          noMemory={true}
          noClose={true}
        />
      )}

      {/* Modal de suppression de bookLink */}
      {openDeleteLink && bookToDelete && (
        <ModalGeneric
          name="delete-link"
          title={t('univers:encyclopedie.modals.deleteLink.title')}
          isOpen
          onClose={() => {
            setOpenDeleteLink(false);
            setBookToDelete(null);
          }}
          handleSubmit={async () => {
            try {
              await ApiUnivers.removeBookLink(universId, currentBook.id, { idBook: bookToDelete.id });
              setOpenDeleteLink(false);
              setBookToDelete(null);
              // Rafraîchir la liste des articles
              await loadAndUpdateData();
            } catch (error) {
              console.error('Erreur lors de la suppression du lien:', error);
              alert('Erreur lors de la suppression du lien');
            }
          }}
          fields={{
            confirmation: { 
              type: "html", 
              label: "", 
              value: t('univers:encyclopedie.modals.deleteLink.confirm', { name: bookToDelete.name }) 
            },
          }}
          textButtonValidate={t('common:delete')}
        />
      )}

      {/* Modal de suppression de book */}
      {openDeleteBook && currentBook && String(currentBook.id) === encyId && (
        <ModalGeneric
          name="delete-book"
          title={t('univers:encyclopedie.modals.deleteBook.title')}
          isOpen
          onClose={() => setOpenDeleteBook(false)}
          handleSubmit={async () => {
            try {
              await ApiUnivers.deleteBook(universId, currentBook.id);
              setOpenDeleteBook(false);
              navigate(`/univers/${universId}/encyclopedie/all`);
            } catch (error) {
              console.error('Erreur lors de la suppression du livre:', error);
              alert('Suppression impossible');
            }
          }}
          fields={{
            confirmation: { 
              type: "html", 
              label: "", 
              value: t('univers:encyclopedie.modals.deleteBook.confirm', { name: currentBook.name }) 
            },
          }}
          textButtonValidate={t('common:delete')}
        />
      )}
    </div>
  );
};

export default UniversCardEncyclopedie;
