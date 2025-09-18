import React, { useEffect, useMemo, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEncyclopedie.css";
import { BackLocation } from "@components";
import { useNavigatePage } from "@service";
import { useParams } from "react-router-dom";

// Données mockées adaptées à la logique de l'API
const mockArticles = [
  // Article principal Encyclopédie (id: 0)
  {
    id: 0,
    name: "Encyclopédie",
    type: "Catégorie",
    texte: "Toutes les encyclopédies",
    image: null,
    createdAt: "2025-09-18T02:09:35.000Z",
    link: [
      {
        id: 8,
        name: "Bestiaire",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les créatures",
        type: "Catégorie",
        location: "/encyclopedie/8"
      },
      {
        id: 18,
        name: "Relique",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les Relique",
        type: "Catégorie",
        location: "/encyclopedie/18"
      },
      {
        id: 28,
        name: "Objet",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les Objet",
        type: "Catégorie",
        location: "/encyclopedie/28"
      },
      {
        id: 38,
        name: "Lieux",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les Lieux",
        type: "Catégorie",
        location: "/encyclopedie/38"
      },
      {
        id: 48,
        name: "Magies",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les Magies",
        type: "Catégorie",
        location: "/encyclopedie/48"
      },
      {
        id: 58,
        name: "Peuple",
        image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
        description: "Liste les Peuple",
        type: "Catégorie",
        location: "/encyclopedie/58"
      }
    ]
  },
  {
    id: 8,
    name: "Bestiaire",
    type: "Catégorie",
    texte: "Liste les créatures dans toutes leur complexité",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: [
      {
        id: 7,
        name: "Gobelin",
        image: "https://i.pinimg.com/736x/1a/91/8a/1a918a21161ae97490128a749cfcec39.jpg",
        description: "Truc vert",
        type: "Créature",
        location: "/encyclopedie/7"
      },
      {
        id: 9,
        name: "Slime",
        image: "https://i.pinimg.com/1200x/d6/7f/f3/d67ff3058db565b279e5a3c2cee52a77.jpg",
        description: "Dragon quest",
        type: "Créature",
        location: "https://dragon-quest.org/wiki/Slime"
      }
    ]
  },
  {
    id: 18,
    name: "Relique",
    type: "Catégorie",
    texte: "Artefacts anciens et objets sacrés, porteurs d'histoires et de pouvoirs",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: [
      {
        id: 15,
        name: "Bouclier ancien",
        image: "https://i.pinimg.com/736x/bc/c7/f4/bcc7f4ceb293732d70383f31afb7eb0f.jpg",
        description: "Protection légendaire",
        type: "Artefact",
        location: "/encyclopedie/15"
      }
    ]
  },
  {
    id: 28,
    name: "Objet",
    type: "Catégorie",
    texte: "Objets remarquables : équipements, outils et trésors du quotidien",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: [
      {
        id: 14,
        name: "Épée sacrée",
        image: "https://i.pinimg.com/736x/59/e4/1f/59e41f37ec6b7764658345f791801dc3.jpg",
        description: "Arme des héros oubliés",
        type: "Objet",
        location: "/encyclopedie/14"
      },
      {
        id: 8,
        name: "Potion magique résurection",
        image: "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg",
        description: "Potions aux pouvoirs variés",
        type: "Objet",
        location: "/encyclopedie/8"
      }
    ]
  },
  // Catégorie Lieux (id: 38)
  {
    id: 38,
    name: "Lieux",
    type: "Catégorie",
    texte: "Régions, cités et sanctuaires marquants de l'univers",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: []
  },
  // Catégorie Magies (id: 48)
  {
    id: 48,
    name: "Magies",
    type: "Catégorie",
    texte: "Écoles, rituels et phénomènes arcaniques façonnant Golstrem",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: []
  },
  // Catégorie Peuple (id: 58)
  {
    id: 58,
    name: "Peuple",
    type: "Catégorie",
    texte: "Civilisations, clans et cultures qui peuplent l'univers",
    image: "https://i.pinimg.com/1200x/c3/99/fa/c399fa394d75c19001a2474332d71f1c.jpg",
    createdAt: "2025-09-18T02:09:35.000Z",
    link: []
  },
  // Articles individuels
  {
    id: 7,
    idUnivers: 62,
    name: "Gobelin",
    description: "Truc vert",
    type: "Créature",
    idLink: 7,
    externalLink: null,
    image: "https://i.pinimg.com/736x/1a/91/8a/1a918a21161ae97490128a749cfcec39.jpg",
    createdAt: "2025-09-18T02:11:56.000Z",
    public: 0,
    texte: "Les gobelins sont de petites créatures vertes, souvent malicieuses et agressives. Ils vivent en tribus dans les forêts sombres et les cavernes."
  },
  {
    id: 9,
    idUnivers: 62,
    name: "Slime",
    description: "Dragon quest",
    type: "Créature",
    idLink: 9,
    externalLink: "https://dragon-quest.org/wiki/Slime",
    image: "https://i.pinimg.com/1200x/d6/7f/f3/d67ff3058db565b279e5a3c2cee52a77.jpg",
    createdAt: "2025-09-18T02:11:56.000Z",
    public: 0,
    texte: "Les slimes sont des créatures gélatineuses de couleur bleue, souvent considérées comme les ennemis les plus faibles mais aussi les plus emblématiques de l'univers Dragon Quest."
  },
  {
    id: 14,
    idUnivers: 62,
    name: "Épée sacrée",
    description: "Arme des héros oubliés",
    type: "Objet",
    idLink: 14,
    externalLink: null,
    image: "https://i.pinimg.com/736x/59/e4/1f/59e41f37ec6b7764658345f791801dc3.jpg",
    createdAt: "2025-09-18T02:11:56.000Z",
    public: 0,
    texte: "Cette épée légendaire a été forgée par les anciens maîtres forgerons. Elle ne révèle sa véritable puissance qu'aux héros dignes de la porter."
  },
  {
    id: 15,
    idUnivers: 62,
    name: "Bouclier ancien",
    description: "Protection légendaire",
    type: "Artefact",
    idLink: 15,
    externalLink: null,
    image: "https://i.pinimg.com/736x/bc/c7/f4/bcc7f4ceb293732d70383f31afb7eb0f.jpg",
    createdAt: "2025-09-18T02:11:56.000Z",
    public: 0,
    texte: "Ce bouclier millénaire a protégé de nombreux héros au cours des siècles. Il est imprégné de magie ancienne et peut repousser les attaques les plus puissantes."
  }
];

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
  const [viewMode, setViewMode] = useState("category"); // default category
  const [currentArticleLinks, setCurrentArticleLinks] = useState([]);
  const [BaseEncyId, setBaseEncyId] = useState(0);
  const [articleHtmlHeight, setArticleHtmlHeight] = useState(400);
  const imageRef = useRef(null);

  // Ensure we have an encyclopedie id in URL; default to page article id=0

  // Récupérer à partir du module encyclopedie
  useEffect(() => {
    setBaseEncyId(0);
  }, []);

  useEffect(() => {
    if (universId && encyId === undefined) {
      navigate(`/univers/${universId}/encyclopedie/${BaseEncyId}`, { replace: true });
    }
  }, [universId, encyId, navigate]);

  function getAllArticles() {
    const links = mockArticles.map(article => {
      return {
        id: article.id,
        name: article.name,
        image: article.image,
        description: article.description,
        type: article.type,
        location: `/encyclopedie/${article.id}`
      };
    });
    return {
      id: undefined,
      name: "Tous les articles",
      image: null,
      description: null,
      type: "Catégorie",
      location: null,
      link: links
    };
  }
  function getArticlesById(id) {
    return mockArticles.find(article => String(article.id) === String(id));
  }

  // Récupérer l'article correspondant à l'encyId et construire les liens
  useEffect(() => {
    if (encyId !== undefined) {

      const article = encyId === "all" ? getAllArticles() : getArticlesById(encyId);
      console.log(article);
      if (article && article.link) {
        const links = article.link.map(link => {
          // Si c'est un lien externe
          if (link.location && link.location.startsWith('http')) {
            return {
              item: {
                id: link.id,
                name: link.name,
                description: link.description,
                type: link.type,
                image: link.image,
                externalLink: link.location
              },
              linkDesc: link.description
            };
          }
          
          // Sinon, chercher l'article correspondant
          const linkedArticle = mockArticles.find(a => a.id === link.id);
          if (linkedArticle) {
            return {
              item: linkedArticle,
              linkDesc: link.description
            };
          }
          return null;
        }).filter(Boolean);
        
        setCurrentArticleLinks(links);
      } else {
        setCurrentArticleLinks([]);
      }
    } else {
      setCurrentArticleLinks([]);
    }
  }, [encyId]);

  // Fonction pour obtenir l'article principal (Encyclopédie)
  const getMainArticle = () => {
    return mockArticles.find(article => article.id === BaseEncyId);
  };




  const mainArticle = getMainArticle();
  
  // Obtenir l'article actuel basé sur l'URL
  const currentArticle = mockArticles.find(article => String(article.id) === String(encyId));

  // Fonction pour calculer la hauteur de l'image et ajuster la hauteur du texte
  useEffect(() => {
    const updateArticleHtmlHeight = () => {
      if (imageRef.current) {
        const imageHeight = imageRef.current.offsetHeight;
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
            className={`UniEncy-mode-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => { setViewMode("all"); navigate(`/univers/${universId}/encyclopedie/all`) }}
          >
            Voir tout
          </button>
          <button
            type="button"
            className={`UniEncy-mode-btn ${viewMode === "category" ? "active" : ""}`}
            onClick={() => {
              setViewMode("category");
              setFilter("Tous");
              if (universId) {
                navigate(`/univers/${universId}/encyclopedie/${BaseEncyId}`);
              }
            }}
          >
            Par catégorie
          </button>
        </div>
      </div>
      


      
      <h2 className="UniEncy-title">{currentArticle?.name || mainArticle?.name || "Encyclopédie"}</h2>
      
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
          <div className={`UniEncy-article-html ${!currentArticle.image ? 'no-image' : ''}`}>
            {/* Afficher le texte selon le type d'article */}
            {currentArticle?.type === "Catégorie" ? (
              // Pour les catégories, afficher le texte dans la section HTML
              currentArticle?.texte && (
                <div
                  className="UniEncy-article-html-content"
                  style={currentArticle.image ? { height: `${articleHtmlHeight}px` } : {}}
                  dangerouslySetInnerHTML={{ __html: `<div class="UniEncy-article-html-content">${currentArticle.texte}</div>` }}
                />
              )
            ) : (
              // Pour les articles individuels, afficher le texte dans l'introduction
              <div className="UniEncy-article-html-content ">
                {currentArticle?.texte || currentArticle?.description || "Aucune description disponible."}
              </div>
            )}
          </div>
          {currentArticle.image && <div className="UniEncy-decoration-bottom-right"></div>}
        </div>
        
      )}
      
      {/* Fallback pour l'article principal */}
      {!currentArticle && mainArticle?.texte && (
        <div
          className="UniEncy-article-html"
          style={{ maxWidth: 1000, margin: "0 auto 12px" }}
          dangerouslySetInnerHTML={{ __html: `<div class="UniEncy-article-html-content">${mainArticle.texte}</div>` }}
        />
      )}

      {currentArticle?.image && <div className="UniEncy-content-separator"></div>}

      <div className="UniEncy-controls">
        {viewMode === "all" && (
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="UniEncy-search"
        />
        )}
        {viewMode === "all" ? (
        <div className="UniEncy-filters">
          {TYPES.map((type) => (
            <button
              key={type}
              className={`UniEncy-filter-btn ${filter === type ? "active" : ""}`}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
        ) : null}
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="UniEncy-masonry"
        columnClassName="UniEncy-column"
      >
        {(() => {
          // Logique d'affichage basée sur l'URL
          if (encyId !== undefined) {
            // Si on a un encyId, afficher les liens de cet article
            return currentArticleLinks;
          } else {
            // Sur la page principale : afficher seulement les catégories
            return mockArticles.filter(article => article.type === "Catégorie");
          }
        })().map((data, idx) => {
            // Déterminer le type d'affichage basé sur l'URL
            const isOnMainPage = !encyId;
            const isOnArticlePage = encyId !== undefined;
            const item = isOnArticlePage ? data.item : data;
            const linkDesc = isOnArticlePage ? data.linkDesc : undefined;
            return (
          <motion.a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              
              if (isOnArticlePage) {
                // Sur une page d'article : toujours ouvrir la modal
                setOpenArticle(item);
              } else {
                // Sur la page principale : 
                // - Si c'est une catégorie (type "Catégorie"), naviguer vers elle
                // - Sinon, ouvrir la modal
                if (item.type === "Catégorie") {
                  navigate(`/univers/${universId}/encyclopedie/${item.id}`);
                } else {
                  setOpenArticle(item);
                }
              }
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
              <p>{linkDesc || item.description}</p>
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
                  <p className="UniEncy-modal-desc">{openArticle.description}</p>
                </div>
              </div>
              <button className="UniEncy-modal-close" onClick={() => setOpenArticle(null)} aria-label="Fermer">×</button>
            </div>

            <div className="UniEncy-modal-body">
              {(openArticle.texte || openArticle.text) ? (
                <div
                  className="UniEncy-article-html"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p>${openArticle.texte || openArticle.text || ''}</p>` 
                  }}
                />
              ) : (
                <div className="UniEncy-article-empty">
                  <p>Aucun texte pour cet article.</p>
                </div>
              )}

              <div className="UniEncy-modal-actions">
                {openArticle.externalLink ? (
                  <a
                    className="UniEncy-go-btn"
                    href={openArticle.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir le lien externe
                  </a>
                ) : (

                  <button
                    type="button"
                    className="UniEncy-go-btn"
                    onClick={() => { navigate(`/univers/${universId}/encyclopedie/${openArticle.id}`);setOpenArticle(null) }}
                  >
                  Allez sur la page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversCardEncyclopedie;
