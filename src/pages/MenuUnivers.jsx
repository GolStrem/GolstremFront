import React, { useState, useEffect, useMemo } from "react";
import "./MenuFiche.css";
import { SearchBar } from "@components";
import { FaFilter, FaStar } from "react-icons/fa";
import { ffimg, forum, jeux, plateau, discordimg } from "@assets";
import "./MenuUnivers.css";

const TAGS = ["rp-francais", "fantastiques", "discord", "anglais", "jeu de table", "WoW", "ffxiv"];

const MenuUnivers = () => {
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState([]);            // Préparé pour l'API
  const [selectedTag, setSelectedTag] = useState(""); // filtre simple par tag
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("univers_favs") || "[]"); }
    catch { return []; }
  });



  // 🔹 Simule les univers où l'user a une fiche attachée
  const [myUniverseIds] = useState([1, 5, 9]); // <-- à remplacer par API plus tard

  const handleFilterClick = () => {
    console.log("Filtre cliqué !");
  };

  // ====== Chargement des cartes (préparé pour API) ======
  useEffect(() => {
    let isMounted = true;



    // TODO: remplace ceci par ton appel API (ex: ApiUnivers.list())
    const mockData = [
      { id: 1, title: "Final Fantasy XIV", img: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 2, title: "RP sur table",      img: plateau, tags: ["rp-francais", "jeu de table"] },
      { id: 3, title: "World of Warcraft", img: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 4, title: "Conan exile", img: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 5, title: "Discord",            img: discordimg, tags: ["discord", "anglais"] },
      { id: 6, title: "Forum",              img: forum, tags: ["rp-francais"] },
      { id: 7, title: "Jeux",               img: jeux, tags: ["fantastiques"] },
      { id: 8, title: "Astrem",            img: discordimg, tags: ["discord", "anglais"] },
      { id: 9, title: "Golstrem",            img: discordimg, tags: ["discord", "anglais"] },
      { id: 10, title: "Academie xxx",            img: discordimg, tags: ["discord", "anglais"] },
      { id: 11, title: "Exemple 1",               img: jeux, tags: ["fantastiques"] },
      { id: 12, title: "Exemple 2",               img: jeux, tags: ["fantastiques"] },
      { id: 13, title: "Exemple 3",               img: jeux, tags: ["fantastiques"] },
      { id: 14, title: "Exemple 4", img: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 15, title: "Exemple 6",            img: discordimg, tags: ["discord", "anglais"] },
      { id: 16, title: "Exemple 5",               img: jeux, tags: ["fantastiques"] },
      { id: 17, title: "Exemple 7",               img: jeux, tags: ["fantastiques"] },
      { id: 18, title: "Exemple 8",               img: jeux, tags: ["fantastiques"] },
      { id: 19, title: "Exemple 9",          img: jeux, tags: ["fantastiques", "anglais"] },
    ];

    (async () => {
      // const resp = await ApiUnivers.list();
      // const payload = resp.data;
      const payload = mockData; // <- à enlever quand l’API est prête
      if (isMounted) setCards(payload);
    })();

    return () => { isMounted = false; };
  }, []);

  // Persistance des favoris
  useEffect(() => {
    localStorage.setItem("univers_favs", JSON.stringify(favs));
  }, [favs]);

  const toggleFav = (id) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // 🔹 “Mes univers” (cartes dont l'id est dans myUniverseIds)
  const myUniversCards = useMemo(() => {
    return cards.filter(c => myUniverseIds.includes(c.id));
  }, [cards, myUniverseIds]);

  // Filtrage par recherche + tag sélectionné (favoris en haut)
  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = cards.filter((c) => {
      const okQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q));
      const okTag = !selectedTag || (c.tags || []).includes(selectedTag);
      return okQuery && okTag;
    });

    return list.sort((a, b) => {
      const aFav = favs.includes(a.id);
      const bFav = favs.includes(b.id);
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  }, [cards, search, selectedTag, favs]);

  return (
    <div className="univers-page">
      {/* ===== Headers ===== */}
      <div className="menu-header">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      <div className="menu-header-mobil">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      {/* ===== Titre centré ===== */}
      <h1 className="univers-title">UNIVERS</h1>

      {/* ===== Tags ===== */}
      <div className="univers-tags" role="toolbar" aria-label="Filtres par tags">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`univers-tag ${selectedTag === tag ? "is-active" : ""}`}
            onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* ===== Mes univers ===== */}
      {myUniversCards.length > 0 && (
        <>
          <h2 className="univers-subtitle">Mes univers</h2>
          <section className="univers-grid myuni" aria-label="Mes univers">
            {myUniversCards.map((card) => (
              <article key={`my-${card.id}`} className="univers-card">
                <button
                  className={`fav-btn ${favs.includes(card.id) ? "is-fav" : ""}`}
                  aria-label={favs.includes(card.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  onClick={() => toggleFav(card.id)}
                  title="Favori"
                >
                  <FaStar size={16} />
                </button>

                <div
                  className="univers-card-bg"
                  style={{ backgroundImage: `url(${card.img})` }}
                  role="img"
                  aria-label={card.title}
                />
                <div className="univers-card-label">{card.title}</div>
              </article>
            ))}
          </section>
        </>
      )}

      <div className="barre"></div>


      {/* ===== Grille (toutes) ===== */}
      <section className="univers-grid" aria-label="Liste des univers">
        {filteredCards.map((card) => (
          <article key={card.id} className="univers-card">
                          <button
                className={`fav-btn ${favs.includes(card.id) ? "is-fav" : ""}`}
                aria-label={favs.includes(card.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                onClick={() => toggleFav(card.id)}
                title="Favori"
              >
                <FaStar size={16} />
              </button>

            <div
              className="univers-card-bg"
              style={{ backgroundImage: `url(${card.img})` }}
              role="img"
              aria-label={card.title}
            />
            <div className="univers-card-label">{card.title}</div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default MenuUnivers;
