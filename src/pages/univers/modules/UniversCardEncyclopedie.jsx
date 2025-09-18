import React, { useEffect, useMemo, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import "./UniversCardEncyclopedie.css";
import { BackLocation } from "@components";
import { useParams, useNavigate } from "react-router-dom";

// Page-level article representing the Encyclopédie itself
const encyclopediaArticle = {
  id: 0,
  name: "Encyclopédie",
  description:
    "Explorez les créatures, objets, artefacts, lieux, magies et peuples de l'univers Golstrem.",
  text:
    "<p>Bienvenue dans l'Encyclopédie de Golstrem. Retrouvez ci-dessous les articles principaux et parcourez les catégories pour explorer le savoir de cet univers.</p>",
  image: null,
  links: {},
};

// Extra links for the encyclopedie module (example of provided extra)
const moduleExtra = {
  link: {
    Kobolt: "encyclopedie/10",
    Dragon: "encyclopedie/11",
    Squelette: "https://fr.wikipedia.org/wiki/Squelette",
  },
};

// Rich mock articles with full fields
const mockArticles = [
  {
    id: 1,
    name: "Créature Henel",
    type: "Créature",
    image:
      "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg",
    description: "Les créatures qui font plouf",
    text:
      "<p>Les créatures aquatiques peuplent mers et lacs. Elles sont souvent dotées d'<strong>adaptations</strong> étonnantes.</p><ul><li>Nageoires développées</li><li>Peau écailleuse</li><li>Respiration aquatique</li></ul>",
    links: { ...moduleExtra.link },
  },
  {
    id: 2,
    name: "Créature Zheneos",
    type: "Créature",
    image:
      "https://i.pinimg.com/736x/a0/d7/5e/a0d75e3d2996d50512120a96abfab703.jpg",
    description: "Les créatures qui font PFFFU",
    text:
      "<p>Imprévisibles et dangereuses, les créatures ardentes maîtrisent le feu. Approchez avec prudence.</p>",
    links: { Dragon: "encyclopedie/11" },
  },
  {
    id: 3,
    name: "Créature Bite",
    type: "Créature",
    image:
      "https://i.pinimg.com/736x/db/24/d2/db24d2ad5a35495908885db0bd638703.jpg",
    description: "Les créatures qui font Bzzzzz",
    text: "",
    links: { Squelette: "https://fr.wikipedia.org/wiki/Squelette" },
  },
  {
    id: 5,
    name: "Objet beshrel",
    type: "Objet",
    image:
      "https://i.pinimg.com/736x/09/91/e1/0991e1cb418d4f841ae6339aee793526.jpg",
    description: "Objets magiques rares et anciens",
    text:
      "<p>Forgés par des mages oubliés, ces objets confèrent des <em>pouvoirs uniques</em>.</p>",
    links: { Kobolt: "encyclopedie/10" },
  },
  {
    id: 6,
    name: "Arme du cul",
    type: "Objet",
    image:
      "https://i.pinimg.com/736x/59/e4/1f/59e41f37ec6b7764658345f791801dc3.jpg",
    description: "Armes puissantes des anciens héros",
    text: "",
    links: { Dragon: "encyclopedie/11" },
  },
  {
    id: 7,
    name: "Artefact Drazael",
    type: "Artefact",
    image:
      "https://i.pinimg.com/736x/bc/c7/f4/bcc7f4ceb293732d70383f31afb7eb0f.jpg",
    description: "Objets mystiques mystérieux",
    text:
      "<p>On raconte que certains artefacts renferment des <strong>esprits</strong> millénaires.</p>",
    links: { Squelette: "https://fr.wikipedia.org/wiki/Squelette" },
  },
  {
    id: 8,
    name: "Potion magique résurection",
    type: "Objet",
    image:
      "https://i.pinimg.com/1200x/e7/26/6a/e7266a28eaccf3d24ace89b5094f18e3.jpg",
    description: "Potions aux pouvoirs variés",
    text:
      "<p>Des mixtures alchimiques aux effets parfois <em>imprévisibles</em>.</p>",
    links: {},
  },
  {
    id: 12,
    name: "Dragon Hez",
    type: "Créature",
    image:
      "https://i.pinimg.com/1200x/0c/73/49/0c7349fbb721936ea8d6ac3c5f037d4a.jpg",
    description: "Créature légendaire volante",
    text:
      "<p>Les dragons célestes dominent les cieux et veillent sur des trésors immenses.</p>",
    links: { Kobolt: "encyclopedie/10" },
  },
  {
    id: 14,
    name: "Épée sacrée dieu zhen",
    type: "Objet",
    image:
      "https://i.pinimg.com/736x/59/e4/1f/59e41f37ec6b7764658345f791801dc3.jpg",
    description: "Arme des héros oubliés",
    text:
      "<p>Transmise de génération en génération, elle ne révèle sa puissance qu'aux dignes.</p>",
    links: {},
  },
  {
    id: 15,
    name: "Bouclier ancien anti zhen",
    type: "Artefact",
    image:
      "https://i.pinimg.com/736x/bc/c7/f4/bcc7f4ceb293732d70383f31afb7eb0f.jpg",
    description: "Protection légendaire",
    text: "",
    links: { Dragon: "encyclopedie/11" },
  },
];

// Category-level articles (containers for other articles)
const mockCategoryArticles = [
  {
    id: 100,
    name: "Bestiaire",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/8d/6e/7e/8d6e7ec2b6a7a6a2cf2199d9213d3a67.jpg",
    description: "Collection des créatures : bêtes sauvages, esprits et dragons.",
    text: "",
    links: {
      "Dragon céleste": { href: "encyclopedie/12", description: "Seigneur des cieux, figure majeure du bestiaire." },
      "Créature Henel": { href: "encyclopedie/1", description: "Créature emblématique d'Henel, aquatique et adaptative." },
    },
    groupTypes: ["Créature"],
  },
  {
    id: 101,
    name: "Relique",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/bc/c7/f4/bcc7f4ceb293732d70383f31afb7eb0f.jpg",
    description: "Artefacts anciens et objets sacrés, porteurs d'histoires et de pouvoirs.",
    text: "",
    links: {
      "Bouclier ancien": { href: "encyclopedie/15", description: "Une protection légendaire, forgée par d'anciens maîtres." },
      "Artefact Drazael": { href: "encyclopedie/7", description: "Artefact mystique lié à la lignée de Drazael." },
    },
    groupTypes: ["Artefact"],
  },
  {
    id: 102,
    name: "Objet",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/59/e4/1f/59e41f37ec6b7764658345f791801dc3.jpg",
    description: "Objets remarquables : équipements, outils et trésors du quotidien.",
    text: "",
    links: {
      "Épée sacrée": { href: "encyclopedie/14", description: "Lame consacrée, héritage des héros de jadis." },
      "Potion magique résurection": { href: "encyclopedie/8", description: "Élixir rare aux propriétés de renaissance." },
    },
    groupTypes: ["Objet"],
  },
  {
    id: 103,
    name: "Lieux",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/09/91/e1/0991e1cb418d4f841ae6339aee793526.jpg",
    description: "Régions, cités et sanctuaires marquants de l'univers.",
    text: "",
    links: { "Dragon Hez": { href: "encyclopedie/12", description: "Lieu associé aux vols des Dragons Hez." } },
    groupTypes: ["Lieu"],
  },
  {
    id: 104,
    name: "Magie",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/a0/d7/5e/a0d75e3d2996d50512120a96abfab703.jpg",
    description: "Écoles, rituels et phénomènes arcaniques façonnant Golstrem.",
    text: "",
    links: { "Potion magique": { href: "encyclopedie/8", description: "Mixtures et arcanes alchimiques." } },
    groupTypes: ["Magie"],
  },
  {
    id: 105,
    name: "Peuples",
    type: "Catégorie",
    image:
      "https://i.pinimg.com/736x/db/24/d2/db24d2ad5a35495908885db0bd638703.jpg",
    description: "Civilisations, clans et cultures qui peuplent l'univers.",
    text: "",
    links: { "Créature Henel": { href: "encyclopedie/1", description: "Êtres liés aux traditions d'Henel." } },
    groupTypes: ["Peuple"],
  },
];

const breakpointColumnsObj = {
  default: 5, // 5 colonnes max
  1600: 5,
  1300: 4,
  1000: 3,
  700: 2,
  500: 1,
};

const TYPES = ["Tous", "Créature", "Objet", "Artefact", "Lieu"];

// Category groups map to underlying article types
const CATEGORY_GROUPS = [
  { label: "Bestiaire", types: ["Créature"] },
  { label: "Relique", types: ["Artefact"] },
  { label: "Objet", types: ["Objet"] },
  { label: "Lieux", types: ["Lieu"] },
];

const UniversCardEncyclopedie = () => {
  const { id: universId, encyId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState(null);
  const [viewMode, setViewMode] = useState("category"); // default category
  const [selectedCategory, setSelectedCategory] = useState(null); // one of CATEGORY_GROUPS labels

  // Ensure we have an encyclopedie id in URL; default to page article id=0
  useEffect(() => {
    if (universId && encyId === undefined) {
      navigate(`/univers/${universId}/encyclopedie/0`, { replace: true });
    }
  }, [universId, encyId, navigate]);

  const filteredItems = useMemo(
    () =>
      mockArticles.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (viewMode === "all") {
          // Always show all (respecting type filter), even if URL has a category encyId
          return filter === "Tous" || item.type === filter;
        }
        if (viewMode === "category") {
          if (!selectedCategory) return true;
          const group = CATEGORY_GROUPS.find((g) => g.label === selectedCategory);
          if (!group) return true;
          return group.types.includes(item.type);
        }
        return true;
      }),
    [filter, search, viewMode, selectedCategory]
  );

  const categoryContentItems = useMemo(() => {
    const category = mockCategoryArticles.find((c) => String(c.id) === String(encyId));
    if (!category) return [];
    const linkEntries = Object.entries(category.links || {});
    const parsed = linkEntries
      .map(([label, val]) => {
        const href = typeof val === "string" ? val : val?.href;
        const description = typeof val === "object" && val ? val.description : undefined;
        if (!href) return null;
        const idStr = String(href).replace(/^\/?encyclopedie\//, "");
        const idNum = Number(idStr);
        if (Number.isNaN(idNum)) return null;
        return { id: idNum, description };
      })
      .filter(Boolean);
    const byId = new Map(mockArticles.map((a) => [a.id, a]));
    const items = parsed
      .map((p) => ({ item: byId.get(p.id), linkDesc: p.description }))
      .filter((p) => Boolean(p.item));
    const q = search.toLowerCase();
    return items.filter((p) => p.item.name.toLowerCase().includes(q));
  }, [encyId, search]);

  return (
    <div className="UniEncy-container">
      <BackLocation />
      <h2 className="UniEncy-title">{encyclopediaArticle.name}</h2>
      <p className="UniEncy-intro">{encyclopediaArticle.description}</p>
      {encyclopediaArticle.text && (
        <div
          className="UniEncy-article-html"
          style={{ maxWidth: 1000, margin: "0 auto 12px" }}
          dangerouslySetInnerHTML={{ __html: encyclopediaArticle.text }}
        />
      )}
      {encyId && Number(encyId) > 0 && Number(encyId) < 100 && (
        <div className="UniEncy-back">
          <button
            type="button"
            className="UniEncy-back-btn"
            onClick={() => {
              setViewMode("all");
              navigate(`/univers/${universId}/encyclopedie/0`);
            }}
          >
            Voir tous les articles
          </button>
        </div>
      )}

      <div className="UniEncy-controls">
        <div className="UniEncy-mode">
          <button
            type="button"
            className={`UniEncy-mode-btn ${viewMode === "all" ? "active" : ""}`}
            onClick={() => { setViewMode("all"); setSelectedCategory(null); }}
          >
            Voir tout
          </button>
          <button
            type="button"
            className={`UniEncy-mode-btn ${viewMode === "category" ? "active" : ""}`}
            onClick={() => {
              setViewMode("category");
              setFilter("Tous");
              setSelectedCategory(null);
              if (universId) {
                navigate(`/univers/${universId}/encyclopedie/0`);
              }
            }}
          >
            Par catégorie
          </button>
        </div>
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
        {(viewMode === "category"
          ? (encyId && Number(encyId) >= 100 ? categoryContentItems : mockCategoryArticles)
          : filteredItems).map((data, idx) => {
            const isCategoryList = viewMode === "category" && (!encyId || Number(encyId) < 100);
            const isInsideCategory = viewMode === "category" && encyId && Number(encyId) >= 100;
            const item = isInsideCategory ? data.item : data;
            const linkDesc = isInsideCategory ? data.linkDesc : undefined;
            return (
          <motion.a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (viewMode === "category") {
                if (isInsideCategory) {
                  // Inside a category: open preview modal on article click
                  setOpenArticle(item);
                } else if (isCategoryList) {
                  // From category list: navigate into that category id
                  navigate(`/univers/${universId}/encyclopedie/${item.id}`);
                  setSelectedCategory(null);
                }
              } else {
                setOpenArticle(item);
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
              {openArticle.text ? (
                <div
                  className="UniEncy-article-html"
                  dangerouslySetInnerHTML={{ __html: openArticle.text }}
                />
              ) : (
                <div className="UniEncy-article-empty">
                  <p>Aucun texte pour cet article.</p>
                </div>
              )}

              <div className="UniEncy-modal-actions">
                <a
                  className="UniEncy-go-btn"
                  href={`/univers/${universId}/encyclopedie/${openArticle.id}`}
                >
                  Allez sur la page
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversCardEncyclopedie;
