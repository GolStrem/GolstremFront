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

  const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
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
    async function load() {
      if (!universId || encyId === undefined) return;
      setLoading(true);
      setError(null);
      try {
        if (encyId === "all") {
          // Clear any residual children from previous detail view
          setCurrentBook(null);
          setCurrentArticleLinks([]);
          const { data } = await ApiUnivers.getBooks(universId, {
            nameBook: search || undefined,
          });
          let items = (Array.isArray(data) ? data : []).map(b => ({
            id: b.id,
            name: b.name,
            description: b.description,
            type: b.type,
            image: b.image,
            externalLink: b.externalLink || null,
          }));

          if (viewMode === 'category') {
            // La liste n'inclut pas toujours le type → charger les détails pour filtrer correctement
            const detailed = await Promise.all(
              items.map(async (it) => {
                try {
                  const { data: d } = await ApiUnivers.getBookDetail(universId, it.id);
                  return {
                    ...it,
                    type: d?.type ?? it.type,
                  };
                } catch (_) {
                  return it;
                }
              })
            );
            items = detailed.filter((it) => {
              const t = String(it.type || '').toLowerCase();
              return t === 'catégorie' || t === 'categorie' || t === 'category';
            });
          }

          setCurrentArticleLinks(items);
          setCurrentBook(null);
        } else {
          const { data } = await ApiUnivers.getBookDetail(universId, encyId);
          setCurrentBook(data || null);
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
            };
          });

          // Fallback: if API does not include children in `link`, attempt to infer via idLink
          if ((!items || items.length === 0) && data?.id) {
            try {
              const { data: list } = await ApiUnivers.getBooks(universId, {});
              const listArr = Array.isArray(list) ? list : [];
              const detailed = await Promise.all(
                listArr.map(async (b) => {
                  try {
                    const { data: bd } = await ApiUnivers.getBookDetail(universId, b.id);
                    return bd;
                  } catch {
                    return null;
                  }
                })
              );
              const children = detailed.filter(Boolean).filter((bd) => String(bd.idLink) === String(data.id));
              items = children.map((bd) => ({
                id: bd.id,
                name: bd.name,
                description: bd.description,
                type: bd.type,
                image: bd.image,
              }));
            } catch (_) {
              // ignore
            }
          }

          setCurrentArticleLinks(items);
        }
      } catch (e) {
        setError('Erreur lors du chargement de l\'encyclopédie');
        setCurrentArticleLinks([]);
        setCurrentBook(null);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [universId, encyId, search, viewMode]);

  const currentArticle = currentBook || null;

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

  return (
    <div className="UniEncy-container">
      <div className="UniEncy-header">
      <BackLocation />
        <div className="UniEncy-mode">
          <button
            type="button"
            className={`UniEncy-mode-btn ${encyId === 'all' && viewMode === "all" ? "active" : ""}`}
            onClick={() => {
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
              setViewMode("category");
              setFilter("Tous");
              if (universId) {
                navigate(`/univers/${universId}/encyclopedie/all`);
              }
            }}
          >
            Par catégorie
          </button>
          <button
            type="button"
            className="UniEncy-mode-btn"
            onClick={() => setOpenCreate(true)}
          >
            Créer
          </button>
          {currentBook && (
            <>
              <button
                type="button"
                className="UniEncy-mode-btn"
                onClick={() => setOpenEdit(true)}
              >
                Éditer
              </button>
              <button
                type="button"
                className="UniEncy-mode-btn"
                onClick={async () => {
                  if (!universId || !currentBook?.id) return;
                  if (!window.confirm("Supprimer ce livre ?")) return;
                  try {
                    await ApiUnivers.deleteBook(universId, currentBook.id);
                    navigate(`/univers/${universId}/encyclopedie/all`);
                  } catch(e) {
                    alert("Suppression impossible");
                  }
                }}
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
      


      
      <h2 className="UniEncy-title">{currentArticle?.name || "Encyclopédie"}</h2>
      
      {/* Layout image à gauche, texte à droite */}
      {currentArticle && (
        <div className="UniEncy-article-layout">
          {currentArticle.image && <div className="UniEncy-decoration-top-left"></div>}
          {currentArticle.image && (
            <div className="UniEncy-article-image-container" ref={imageRef}>
              <img 
                src={currentArticle.image} 
                alt={currentArticle.name}
                className="UniEncy-article-image"
              />
            </div>
          )}
          
                <div
                  className={`UniEncy-article-html ${!currentArticle.image ? 'no-image' : ''}`}
                  dangerouslySetInnerHTML={{ __html:   `<div class=\"UniEncy-article-html-content\"> ${PurifyHtml(currentArticle.texte)}</div>` }}
                />
          
          {currentArticle.image && <div className="UniEncy-decoration-bottom-right"></div>}
        </div>
        
      )}
      
      {error && (
        <div className="UniEncy-article-empty" style={{ maxWidth: 1000, margin: "0 auto 12px" }}>
          <p>{error}</p>
        </div>
      )}

      {currentArticle?.image && <div className="UniEncy-content-separator"></div>}

      {encyId === "all" && !openArticle && (
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
          <motion.a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              
              setOpenArticle(item);
            }}
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
          </motion.a>
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
              {(openArticle.texte || openArticle.text) ? (
                <div
                  className="UniEncy-article-html"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p> ${PurifyHtml(openArticle.texte || openArticle.text || '')}</p>` 
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
          title="Créer un livre"
          isOpen
          onClose={() => setOpenCreate(false)}
          initialData={{
            // Préselectionne le type selon le contexte
            type: currentBook?.name ? toTitleCase(currentBook.name) : (viewMode === 'category' ? 'Catégorie' : ''),
          }}
          handleSubmit={async (values) => {
            const payload = {
              name: values.name || "",
              description: values.description || "",
              texte: values.texte || "",
              type: values.type || "encyclopédie",
              image: values.image || "",
              public: values.public === 'oui' ? 0 : 1,
              // If user is currently on a book detail, link new book to it
              idLink: currentBook?.id ?? null,
              link: [],
              connectArticle: currentBook?.id ?? null,
              externalLink: null,
            };
            const { data: created } = await ApiUnivers.createBook(universId, payload);
            setOpenCreate(false);
            if (encyId === "all") {
              // Refresh list view
              const { data } = await ApiUnivers.getBooks(universId, { nameBook: search || undefined });
              const items = (Array.isArray(data) ? data : []).map(b => ({
                id: b.id,
                name: b.name,
                description: b.description,
                type: b.type,
                image: b.image,
                externalLink: b.externalLink || null,
              }));
              setCurrentArticleLinks(items);
            } else if (currentBook?.id) {
              // Stay on current book detail and refresh its children links
              const { data } = await ApiUnivers.getBookDetail(universId, currentBook.id);
              setCurrentBook(data || null);
              const items = (data?.link || []).map(link => {
                const isExternal = typeof link.location === 'string' && link.location.startsWith('http');
                return {
                  id: link.id,
                  name: link.name,
                  description: link.description,
                  type: link.type,
                  image: link.image,
                  externalLink: isExternal ? link.location : null,
                  _linkDesc: link.description,
                };
              });
              setCurrentArticleLinks(items);
            }
          }}
          fields={{
            articleActuel: { type: "html", label: "", value: `Article actuel: <strong>${currentBook?.name || (viewMode === 'category' ? 'Catégorie' : 'Voir tout')}</strong>` },
            name: { type: "inputText", label: "name" },
            description: { type: "textarea", label: "description" },
            texte: { type: "textarea", label: "texte" },
            image: { type: "inputUrl", label: "image" },
            type: { type: "select", label: "type", value: ["Catégorie","Créature","Objet","Artefact","Lieu","Magie","Peuple","encyclopédie"], another: true },
            public: { type: "select", label: "recuperable pour les autres univers ?", value: ["oui", "non"] },
          }}
          textButtonValidate="save"
        />
      )}

      {openEdit && currentBook && (
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
            public: Number(currentBook.public) === 0 ? 'oui' : 'non',
            idLink: currentBook.idLink ?? '',
          }}
          handleSubmit={async (values) => {
            const payload = {
              name: values.name,
              description: values.description,
              texte: values.texte,
              type: values.type,
              image: values.image,
              public: values.public === 'oui' ? 0 : 1,
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
            public: { type: "select", label: "recuperable pour les autres univers ?", value: ["oui", "non"] },
            idLink: { type: "inputText", label: "idLink" },
            // idLink intentionally omitted in create modal; it is auto-derived if on a book detail
          }}
          textButtonValidate="save"
        />
      )}
    </div>
  );
};

export default UniversCardEncyclopedie;
