import React, { useEffect, useMemo, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEncyclopedie.css";
import { BackLocation, ModalGeneric } from "@components";
import { useNavigatePage, PurifyHtml, ApiUnivers } from "@service";
import { useParams } from "react-router-dom";

// Data now loaded from API

const breakpointColumnsObj = {
  default: 5, // 5 colonnes max
  1600: 5,
  1300: 4,
  1000: 3,
  700: 2,
  500: 1,
};

const TYPES = ["Tous", "Créature", "Objet", "Artefact", "Lieu", "Magie", "Peuple"];

const UniversCardEncyclopedie = () => {
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

  const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
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
        if (encyId === "all") {
          // Clear any residual children from previous detail view
          setCurrentBook(null);
          let items = [];
          if (viewMode === 'category') {
            const { data } = await ApiUnivers.getBooks(universId, { type: 'Categorie' });
            items = (Array.isArray(data) ? data : []).map(b => ({
              id: b.id,
              name: b.name,
              description: b.description,
              type: b.type,
              image: b.image,
              externalLink: b.externalLink || null,
            }));
          } else {
            const { data } = await ApiUnivers.getBooks(universId, {
              nameBook: search || undefined,
            });
            items = (Array.isArray(data) ? data : []).map(b => ({
              id: b.id,
              name: b.name,
              description: b.description,
              type: b.type,
              image: b.image,
              externalLink: b.externalLink || null,
              _isLink: !!b.idLink, // Marquer si c'est un bookLink (a un idLink)
              _idLink: b.idLink, // Garder l'idLink pour la suppression
            }));
        }

          if (loadSequenceRef.current === currentSeq) {
            setCurrentArticleLinks(items);
            setCurrentBook(null);
          }
        } else {
          const { data } = await ApiUnivers.getBookDetail(universId, encyId);
          if (loadSequenceRef.current === currentSeq) {
            setCurrentBook(data || null);
          }
          let items = (data?.link || []).map(link => {
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
          });

          if (loadSequenceRef.current === currentSeq) {
            setCurrentArticleLinks(items);
          }
        }
      } catch (e) {
        setError('Erreur lors du chargement de l\'encyclopédie');
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
  }, [universId, encyId, search, viewMode]);

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
        console.log('Univers avec books publics data:', data); // Debug
        const universItems = Array.isArray(data) ? data : [];
        console.log('Univers items:', universItems); // Debug
        
        // Filtrer les univers qui ont au moins un book public
        const withPublic = universItems.map(u => ({ id: u.idUnivers, name: u.name }));
        
        console.log('Univers avec books publics:', withPublic); // Debug
        setModalUniversList(withPublic);
      } finally {
        setModalUniversLoading(false);
      }
    }
    loadUniversForModal();
    return () => { mounted = false; };
  }, [openCreate, universId]);

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
                Voir tout
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
                Par catégorie
              </button>
            </div>
            <div className="UniEncy-mode-rowtwo">
              <button
                type="button"
                className="UniEncy-mode-btn"
              onClick={() => setOpenCreate(true)}
              >
                Créer
              </button>
              {currentBook && String(currentBook.id) === encyId && (
                <>
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
                    Éditer
                  </button>
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
                    Supprimer
                  </button>
                </>
              )}
            </div>
            </div>
          </div>
      </div>
      


      
      <h2 className="UniEncy-title">{currentArticle?.name || "Encyclopédie"}</h2>
      
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

      {encyId === "all" && (
        <div className="UniEncy-controls">
          <input
            type="text"
            placeholder="Rechercher..."
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
                title="Supprimer ce lien"
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
                  <p>Aucun texte pour cet article.</p>
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
                  {openArticle.externalLink ? 'Voir le lien externe' : 'Allez sur la page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openCreate && (
        <ModalGeneric
          name="ency-create"
          title="Créer / Chercher / Externe"
          isOpen
          onClose={() => setOpenCreate(false)}
          initialData={{
            action: 'Créer un article',
            type: currentBook?.name ? toTitleCase(currentBook.name) : (viewMode === 'category' ? 'Catégorie' : ''),
            selectedUniversSearchId: '',
            selectedPublicBookId: '',
          }}
          onValuesChange={(vals) => {
            // Mémoriser le nom de l'univers sélectionné
            if (vals.action === 'Chercher un article existant') {
              const selectedName = vals.selectedUniversSearchId || "";
              setModalSelectedUniversName(selectedName);
            } else {
              setModalSelectedUniversName("");
            }
            // Charger les livres publics quand un univers est sélectionné
            if (vals.action === 'Chercher un article existant' && vals.selectedUniversSearchId) {
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
                    console.log('Tous les books de notre univers actuel:', data); // Debug
                    const items = Array.isArray(data) ? data : [];
                    setModalPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
                  } else {
                    // Pour les autres univers, utiliser searchInUnivers pour les publics
                    const { data } = await ApiUnivers.getBooks(universId, {searchInUnivers: uni.id});
                    if (!mounted) return;
                    console.log('Books publics pour univers', uni.name, ':', data); // Debug
                    const items = Array.isArray(data) ? data : [];
                    setModalPublicBooks(items.map(b => ({ id: b.id, name: b.name })));
                  }
                } catch (err) {
                  console.log('Erreur lors du chargement des books:', err); // Debug
                  setModalPublicBooks([]);
                } finally {
                  setModalBooksLoading(false);
                }
              })();
              return () => { mounted = false; };
            } else if (vals.action !== 'Chercher un article existant') {
              setModalPublicBooks([]);
            }
          }}
          handleSubmit={async (values) => {
            if (values.action === 'Créer un article') {
              const payload = {
                name: values.name || "",
                description: values.description || "",
                texte: values.texte || "",
                type: values.type || "encyclopédie",
                image: values.image || "",
                public: values.public === 'oui' ? 1 : 0,
                idLink: null,
                link: [],
                connectArticle: currentBook?.id ?? null,
                externalLink: null,
              };
              await ApiUnivers.createBook(universId, payload);
              setOpenCreate(false);
              if (encyId === 'all') {
                const { data } = await ApiUnivers.getBooks(universId, { nameBook: search || undefined });
                const items = (Array.isArray(data) ? data : []).map(b => ({ id: b.id, name: b.name, description: b.description, type: b.type, image: b.image, externalLink: b.externalLink || null }));
                setCurrentArticleLinks(items);
              } else if (currentBook?.id) {
                const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
                setCurrentBook(data || null);
                const items = (data?.link || []).map(link => {
                  const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
                  return { id: link.id, name: link.name, description: link.description, type: link.type, image: link.image, externalLink: isExternal ? link.location : null, _linkDesc: link.description, _isLink: true };
                });
                setCurrentArticleLinks(items);
              }
            } else if (values.action === 'Chercher un article existant') {
              console.log('Action: Chercher un article existant', values); // Debug
              if (values.selectedPublicBookId) {
                console.log('selectedPublicBookId:', values.selectedPublicBookId); // Debug
                console.log('modalPublicBooks:', modalPublicBooks); // Debug
                // Trouver l'ID du livre sélectionné (par nom)
                const selectedBook = modalPublicBooks.find(b => b.name === values.selectedPublicBookId);
                console.log('selectedBook trouvé:', selectedBook); // Debug
                if (selectedBook) {
                  console.log('Tentative d\'ajout du lien avec:', { universId, bookId: selectedBook.id, payload: { idBook: selectedBook.id } }); // Debug
                  // Ajouter le book comme lien dans l'univers actuel
                  try {
                    const result = await ApiUnivers.addBookLink(universId, currentBook.id, { idBook: selectedBook.id });
                    console.log('Résultat de l\'ajout:', result); // Debug
                    setOpenCreate(false);
                    // Rafraîchir la liste des articles
                    if (encyId === 'all') {
                      const { data } = await ApiUnivers.getBooks(universId, { nameBook: search || undefined });
                      const items = (Array.isArray(data) ? data : []).map(b => ({ id: b.id, name: b.name, description: b.description, type: b.type, image: b.image, externalLink: b.externalLink || null }));
                      setCurrentArticleLinks(items);
                    } else if (currentBook?.id) {
                      const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
                      setCurrentBook(data || null);
                      const items = (data?.link || []).map(link => {
                        const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
                        return { id: link.id, name: link.name, description: link.description, type: link.type, image: link.image, externalLink: isExternal ? link.location : null, _linkDesc: link.description, _isLink: true };
                      });
                      setCurrentArticleLinks(items);
                    }
                  } catch (error) {
                    console.error('Erreur lors de l\'ajout du lien:', error);
                  }
                } else {
                  console.log('Aucun book trouvé avec le nom:', values.selectedPublicBookId); // Debug
                }
              } else {
                console.log('Aucun selectedPublicBookId'); // Debug
              }
            } else if (values.action === 'Rajouter un article externe du site') {
              if (values.name && values.link) {
                const payload = {
                  name: values.name || "",
                  description: values.description || "",
                  texte: values.texte || "",
                  type: values.type || "encyclopédie",
                  image: values.image || "",
                  public: values.public === 'oui' ? 1 : 0,
                  idLink: null,
                  link: [],
                  connectArticle: currentBook?.id ?? null,
                  externalLink: values.link,
                };
                await ApiUnivers.createBook(universId, payload);
                setOpenCreate(false);
                if (encyId === 'all') {
                  const { data } = await ApiUnivers.getBooks(universId, { nameBook: search || undefined });
                  const items = (Array.isArray(data) ? data : []).map(b => ({ id: b.id, name: b.name, description: b.description, type: b.type, image: b.image, externalLink: b.externalLink || null }));
                  setCurrentArticleLinks(items);
                } else if (currentBook?.id) {
                  const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
                  setCurrentBook(data || null);
                  const items = (data?.link || []).map(link => {
                    const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
                    return { id: link.id, name: link.name, description: link.description, type: link.type, image: link.image, externalLink: isExternal ? link.location : null, _linkDesc: link.description, _isLink: true };
                  });
                  setCurrentArticleLinks(items);
                }
              }
            }
          }}
          fields={{
            articleActuel: { type: "html", label: "", value: `Article actuel: <strong>${currentBook?.name || (viewMode === 'category' ? 'Catégorie' : 'Voir tout')}</strong>` },
            action: {
              type: 'selectSwitch',
              label: 'Action',
              value: ['Créer un article', 'Chercher un article existant', 'Rajouter un article externe du site'],
              default: 'Créer un article',
              cases: {
                'Créer un article': {
                  name: { type: "inputText", label: "name" },
                  description: { type: "textarea", label: "description" },
                  texte: { type: "textarea", label: "texte" },
                  image: { type: "inputUrl", label: "image" },
                  type: { type: "select", label: "type", value: ["Catégorie","Créature","Objet","Artefact","Lieu","Magie","Peuple","encyclopédie"], another: true },
                  public: { type: "select", label: "recuperable pour les autres univers ?", value: ["non", "oui"] },
                },
                'Chercher un article existant': {
                  selectedUniversSearchId: { 
                    type: 'select', 
                    label: 'Univers', 
                    value: modalUniversList.map(u => u.name)
                  },
                  selectedPublicBookId: { 
                    type: 'select', 
                    label: 'Article public', 
                    value: (modalPublicBooks.length > 0 ? modalPublicBooks.map(b => b.name) : ['pas d\'article disponible pour cet univers'])
                  }
                },
                'Rajouter un article externe du site': {
                  name: { type: 'inputText', label: 'Nom' },
                  description: { type: "textarea", label: "description" },
                  image: { type: 'inputUrl', label: 'Image URL' },
                  link: { type: 'inputText', label: 'Lien externe (https://...)' },
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
          title="Éditer le livre"
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
            name: { type: "inputText", label: "name" },
            description: { type: "textarea", label: "description" },
            texte: { type: "textarea", label: "texte" },
            image: { type: "inputUrl", label: "image" },
            type: { type: "select", label: "type", value: ["Catégorie","Créature","Objet","Artefact","Lieu","Magie","Peuple","encyclopédie"], another: true },
            public: { type: "select", label: "recuperable pour les autres univers ?", value: ["non", "oui"] },
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
          title="Supprimer le lien"
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
              if (encyId === 'all') {
                const { data } = await ApiUnivers.getBooks(universId, { nameBook: search || undefined });
                const items = (Array.isArray(data) ? data : []).map(b => ({ 
                  id: b.id, 
                  name: b.name, 
                  description: b.description, 
                  type: b.type, 
                  image: b.image, 
                  externalLink: b.externalLink || null,
                  _isLink: !!b.idLink,
                  _idLink: b.idLink
                }));
                setCurrentArticleLinks(items);
              } else if (currentBook?.id) {
                const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
                setCurrentBook(data || null);
                const items = (data?.link || []).map(link => {
                  const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
                  return { id: link.id, name: link.name, description: link.description, type: link.type, image: link.image, externalLink: isExternal ? link.location : null, _linkDesc: link.description, _isLink: true };
                });
                setCurrentArticleLinks(items);
              }
            } catch (error) {
              console.error('Erreur lors de la suppression du lien:', error);
              alert('Erreur lors de la suppression du lien');
            }
          }}
          fields={{
            confirmation: { 
              type: "html", 
              label: "", 
              value: `Êtes-vous sûr de vouloir supprimer le lien vers "<strong>${bookToDelete.name}</strong>" ?` 
            },
          }}
          textButtonValidate="Supprimer"
        />
      )}

      {/* Modal de suppression de book */}
      {openDeleteBook && currentBook && String(currentBook.id) === encyId && (
        <ModalGeneric
          name="delete-book"
          title="Supprimer le livre"
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
              value: `Êtes-vous sûr de vouloir supprimer le livre "<strong>${currentBook.name}</strong>" ?<br><br><em>Cette action est irréversible.</em>` 
            },
          }}
          textButtonValidate="Supprimer"
        />
      )}
    </div>
  );
};

export default UniversCardEncyclopedie;
