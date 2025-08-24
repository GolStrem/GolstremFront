import React, { useState, useEffect, useMemo } from "react";
import "./MenuFiche.css";
import { SearchBar, ModalGeneric } from "@components";
import { FaFilter, FaStar } from "react-icons/fa";
import { ffimg, forum, jeux, plateau, discordimg } from "@assets";
import "./MenuUnivers.css";

const TAGS = ["rp-francais", "fantastiques", "discord", "anglais", "jeu de table", "WoW", "ffxiv"];

const MenuUnivers = () => {
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState([]);            // Préparé pour l'API
  const [selectedTag, setSelectedTag] = useState(""); // filtre simple par tag
  const [isModalUniversOpen, setModalUniversOpen] = useState(false);
   const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);

  const handleModalViewUnivers = function(card) { 
    console.log(card)
    setTitle(card.name);
    const textHtml = `
    <div>
      <div class="univerOwner">
        <div class="nameOwner">${card.nameOwner} </div>
        <img src="${card.imageOwner}" class="imgOwner"/>
      </div>

      <div class= "descriUnivers">
        ${card.description}
      </div>
    </div>
    `

    const useField = {
      'imageUnivers':{
        type: "image",
        value: card.image
      },
      'descriptionUnivers':{
        type:"html",
        value: textHtml
      },
      'tagUnivers':{
        type:"tags",
        value: card.tags
      }

    }
    setFields(useField)
    setModalUniversOpen(true);
  }

  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("univers_favs") || "[]"); }
    catch { return []; }
  });


    const fieldsModale =   {
    'modules': {
      type: "checkBox",
      list: ["general", "character", "story", "power", "gallery"],
      label: "",
      key: "selectedModules"

    }
  }

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
      { id: 1, description: 'ptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite descriptionptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Final Fantasy XIV", image: ffimg, tags: ["ffxiv", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques"] },
      { id: 2, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "RP sur table",      image: plateau, tags: ["rp-francais", "jeu de table"] },
      { id: 3, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "World of Warcraft", image: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 4, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Conan exile", image: ffimg, tags: ["ffxiv", "fantastiques", "fantastiques", "fantastiques", "fantastiques", "fantastiques"] },
      { id: 5, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Discord",            image: discordimg, tags: ["discord", "anglais"] },
      { id: 6, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Forum",              image: forum, tags: ["rp-francais"] },
      { id: 7, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Jeux",               image: jeux, tags: ["fantastiques"] },
      { id: 8, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Astrem",            image: discordimg, tags: ["discord", "anglais"] },
      { id: 9, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Golstrem",            image: discordimg, tags: ["discord", "anglais"] },
      { id: 10, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Academie xxx",            image: discordimg, tags: ["discord", "anglais"] },
      { id: 11, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 1",               image: jeux, tags: ["fantastiques"] },
      { id: 12, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 2",               image: jeux, tags: ["fantastiques"] },
      { id: 13, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 3",               image: jeux, tags: ["fantastiques"] },
      { id: 14, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 4", image: ffimg, tags: ["ffxiv", "fantastiques"] },
      { id: 15, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 6",            image: discordimg, tags: ["discord", "anglais"] },
      { id: 16, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 5",               image: jeux, tags: ["fantastiques"] },
      { id: 17, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 7",               image: jeux, tags: ["fantastiques"] },
      { id: 18, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 8",               image: jeux, tags: ["fantastiques"] },
      { id: 19, description: 'ptite description',nameOwner: 'Zheneos',imageOwner: 'https://i.pinimg.com/736x/a7/b3/ba/a7b3baeb498e942c73b890770f96cac6.jpg', name: "Exemple 9",          image: jeux, tags: ["fantastiques", "anglais"] },
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
              <article
                key={`my-${card.id}`} 
                className="univers-card"
                onClick={() => handleModalViewUnivers(card)}
              >
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
                  style={{ backgroundImage: `url(${card.image})` }}
                  role="img"
                  aria-label={card.name}
                />
                <div className="univers-card-label">{card.name}</div>
              </article>
            ))}
          </section>
        </>
      )}

      <div className="barre"></div>


      {/* ===== Grille (toutes) ===== */}
      <section className="univers-grid" aria-label="Liste des univers">
        {filteredCards.map((card) => (
          <article 
            key={card.id} 
            className="univers-card"
            onClick={() => handleModalViewUnivers(card)}
          >
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
              style={{ backgroundImage: `url(${card.image})` }}
              role="img"
              aria-label={card.name}
            />
            <div className="univers-card-label">{card.name}</div>
          </article>
        ))}
      </section>
        <button className="univer-btn-view" onClick={handleModalViewUnivers}> choco </button>

      {isModalUniversOpen && (
        <ModalGeneric
          onClose={() => setModalUniversOpen(false)}
          handleSubmit={console.log}
          fields={fields}
          title={title}
          noButtonCancel={true}
          textButtonValidate="Visiter"
          name="previewUnivers"
        />
      )}
    </div>
  );
};

export default MenuUnivers;
