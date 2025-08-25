import React, { useState, useEffect, useMemo } from "react";
import "./MenuFiche.css";
import { SearchBar, ModalGeneric } from "@components";
import { FaFilter, FaStar } from "react-icons/fa";
import { ffimg, forum, jeux, plateau, discordimg } from "@assets";
import "./MenuUnivers.css";
import { ApiUnivers } from "@service"

const listTag = ["rp-francais", "fantastiques", "discord", "anglais", "jeu de table", "WoW", "ffxiv"];

const MenuUnivers = () => {
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState([]);            // Préparé pour l'API
  const [selectedTag, setSelectedTag] = useState(""); // filtre simple par tag
  const [isModalUniversOpen, setModalUniversOpen] = useState(false);
  const [isModalFiltreOpen, setModalFiltreOpen] = useState(false)
  const [isModalCreateUnivOpen, setModalCreateUnivOpen] = useState(false)
   const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);

  const [param, setParam] = useState({limit: 30, p: 0})

  const list = typeof listTag !== "undefined" ? listTag : TAGS;

  const handlePage = (p) => {
    setParam((prev) => ({
      ...prev,
      p: p
    }));
  };

  const handleModalViewUnivers = function(card) { 
    console.log(card)
    setTitle(card.name);
    const textHtml = `
    <div>
      <div class="univerOwner">
        <div class="nameOwner">${card.ownerPseudo} </div>
        <img src="${card.ownerImage}" class="imgOwner"/>
      </div>

      <div class= "descriUnivers">
        ${card.description}
      </div>
    </div>
    `
    const tags =card.tags.map(tag => {return tag.name})

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
        value: tags
      }

    }
    setFields(useField)
    setModalUniversOpen(true);
  }

  const handleModalViewFilter = () => {
    setModalFiltreOpen(true);
  };

  const handleModalViewCreateUniv =() => {
    setModalCreateUnivOpen(true);
  };

    const fieldsFilter = {
      flags: {
        type: "checkBox",
        list: ["Ami(e)s", "Favoris", "NSFW"],
        label: "",
        key: "flags",
      },

      // Filtrer par tag (ton select simple basé sur config.value)
      tagsUnivers: {
        type: "select",
        value: listTag,                // ex: ["rp-francais","fantastiques",...]
        label: "Filtrer par tag :",
        key: "selectedTagFilter",
      },

      // Ligne "Trier par : Amis"
      sortScope: {
        type: "select",
        value: [ "Tous","Henel", "Nanako", "Mon Cul"],
        label: "Filtrer par ami(e) :",
        key: "scope",
      },

      // Ligne "Trier par : Nouveau  Descendant"
      orderBy: {
        type: "select",
        value: ["Nouveau", "Popularité", "Membres"],
        label: "Trier par :",
        key: "orderBy",
      },
      orderDir: {
        type: "select",
        value: ["Descendant", "Ascendant"],
        label: "",
        key: "orderDir",
      },
    };

  const createUnivers = {

      NomUnivers: { 
        type: "inputText", 
        label: "Nom de l'Univers"
      },

      descriptionUnivers: { 
        type: "textarea", 
        label: "description de l'Univers:" 
      },

      image: { 
        type: "inputUrl", 
        label: "imgUrl" 
      },

      tagsUnivers: {
        type: "checkBox",
        list: listTag,                
        label: "Tags (10max) :",
        key: "selectedTagFilter",
      },
      
      selectVisibily: {
        type: "select",
        value: [ "Public","Priver"],
        label: "Visibilité :",
        key: "visibiltyUnivers",
      },

      flagsCreate: {
        type: "checkBox",
        list: ["NSFW"],
        label: "",
        key: "flags",
      },
    };

  const handleSubmitFilter = (formValues) => {
      // formValues est l’objet que ta ModalGeneric renverra
      // ex: { flags: ["Ami(e)s","NSFW"], selectedTagFilter: "rp-francais", scope: "Henel", orderBy: "Popularité", orderDir: "Ascendant" }

      const useParam = {
        limit: 5,
        p: 0,
        search: search || "",
        sort: formValues.orderBy === "Popularité" ? "stars" : "createdAt",
        order: formValues.orderDir === "Ascendant" ? "asc" : "desc",
        filter: {
          star: formValues.flags?.includes("Favoris") ? 1 : 0,
          nfsw: formValues.flags?.includes("NSFW") ? 1 : 0,
          withFriends: formValues.flags?.includes("Ami(e)s") ? 1 : 0,
          byFriend: formValues.scope !== "Tous" ? formValues.scope : null,
          byTag: formValues.selectedTagFilter || null
        }
      };

      console.log("✅ Param envoyé :", useParam, formValues);
      setParam(useParam);
      setModalFiltreOpen(false);
    };


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


    (async () => {

      const resp = await ApiUnivers.getUnivers(param);
      console.log(resp.data)
      
      // const payload = resp.data;
      if (isMounted) setCards(resp.data);
    })();

    return () => { isMounted = false; };
  }, [param.p]);

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
        c.name.toLowerCase().includes(q) ||
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
          <button className="filter-button" onClick={handleModalViewFilter} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      <div className="menu-header-mobil">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleModalViewFilter} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      {/* ===== Titre centré ===== */}
      <h1 className="univers-title">UNIVERS</h1>

      {/* ===== Tags ===== */}
      <div className="univers-tags" role="toolbar" aria-label="Filtres par tags">
        {listTag.map((tag) => (
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
                  onClick={(e) => {
                    e.stopPropagation();   
                    toggleFav(card.id);
                  }}
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
              onClick={(e) => {
                e.stopPropagation();   // ⛔ empêche le click d'atteindre <article>
                toggleFav(card.id);
              }}
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
      <button onClick={handleModalViewCreateUniv} title="CreateUniv" className="tmw-toggle univCreatebutton">+</button>
      <input
            type="text"
            value={param.p}
            onChange={(e) => handlePage(e.target.value)}
          />

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

      {isModalFiltreOpen && (
        <ModalGeneric
          onClose={() => setModalFiltreOpen(false)}
          handleSubmit={handleSubmitFilter}
          fields={fieldsFilter}
          title={"Filtre"}
          noButtonCancel={true}
          textButtonValidate="Rechercher"
          name="previewFilter"
        />
      )}

            {isModalCreateUnivOpen && (
        <ModalGeneric
          onClose={() => setModalCreateUnivOpen(false)}
          handleSubmit={console.log}
          fields={createUnivers}
          title={"Création d'univers"}
          noButtonCancel={false}
          textButtonValidate="Créer"
          name="CreateUnivers"
        />
        )}

            
    </div>
  );
};

export default MenuUnivers;
