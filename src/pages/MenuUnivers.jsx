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

  const [param, setParam] = useState({limit: 30, p: 0});
  const [totalPages, setTotalPages] = useState(12); // si l'API renvoie totalPages, on le mettra à jour

  // ➜ Mémoire du filtre appliqué
  const [activeFilter, setActiveFilter] = useState({
    flags: [],               // ["Ami(e)s", "Favoris", "NSFW"]
    selectedTagFilter: "",   // string (tag choisi)
    scope: "Tous",           // "Tous" | "Henel" | ...
    orderBy: "Nouveau",      // "Nouveau" | "Popularité" | "Membres"
    orderDir: "Descendant",  // "Descendant" | "Ascendant"
  });

  const list = typeof listTag !== "undefined" ? listTag : [];

  const handlePage = (p) => {
    const page = Number(p);
    if (!Number.isNaN(page) && page >= 0 && page < totalPages) {
      setParam((prev) => ({ ...prev, p: page }));
    }
  };

  const handleModalViewUnivers = function(card) { 
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
    // si card.tags = [{name:"xx"}], on mappe en strings
    const tags = (card.tags || []).map(tag => tag.name ?? tag);

    const useField = {
      imageUnivers:{ type: "image", value: card.image },
      descriptionUnivers:{ type:"html", value: textHtml },
      tagUnivers:{ type:"tags", value: tags }
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

  // ⚙️ Définition des champs de filtre (inchangé structurellement)
  //    On garde cet objet "statique" et on passe les valeurs via initialFilterValues
  const fieldsFilter = {
    flags: {
      type: "checkBox",
      list: ["Ami(e)s", "Favoris", "NSFW"],
      label: "",
      key: "flags",
    },
    tagsUnivers: {
      type: "select",
      value: ["", ...listTag], // Ajout d'une option vide en premier
      label: "Filtrer par tag :",
      key: "selectedTagFilter",
    },
    sortScope: {
      type: "select",
      value: [ "Tous","Henel", "Nanako", "Mon Cul"],
      label: "Filtrer par ami(e) :",
      key: "scope",
    },
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

  // ✅ Valeurs initiales injectées dans la modale (sans modifier ModalGeneric)
  const initialFilterValues = {
    flags: activeFilter.flags,
    selectedTagFilter: activeFilter.selectedTagFilter,
    scope: activeFilter.scope,
    orderBy: activeFilter.orderBy,
    orderDir: activeFilter.orderDir,
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
    // 🧠 Sauvegarde des valeurs pour réouverture
    setActiveFilter({
      flags: formValues.flags ?? [],
      selectedTagFilter: formValues.selectedTagFilter ?? "",
      scope: formValues.scope ?? "Tous",
      orderBy: formValues.orderBy ?? "Nouveau",
      orderDir: formValues.orderDir ?? "Descendant",
    });

    const useParam = {
      limit: 30,
      p: 0,
      ...(search ? { search } : {}),
      sort: formValues.orderBy === "Popularité" ? "stars" : "createdAt",
      order: formValues.orderDir === "Ascendant" ? "asc" : "desc",
      filter: {
        ...(formValues.flags?.includes("Favoris") ? { star: 1 } : {}),
        ...(formValues.flags?.includes("NSFW") ? { nfsw: 1 } : {}),
        ...(formValues.flags?.includes("Ami(e)s") ? { withFriends: 1 } : {}),
        byFriend: formValues.scope !== "Tous" ? formValues.scope : null,
        byTag: formValues.selectedTagFilter && formValues.selectedTagFilter !== "" ? formValues.selectedTagFilter : null
      }
    };
    setParam(useParam);
    setModalFiltreOpen(false);
  };

  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("univers_favs") || "[]"); }
    catch { return []; }
  });

  // 🔹 Simule les univers où l'user a une fiche attachée
  const [myUniverseIds] = useState([1, 5, 9]); // <-- à remplacer par API plus tard

  // ====== Chargement des cartes (préparé pour API) ======
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const resp = await ApiUnivers.getUnivers(param);
      // resp attendu : { data: [...], totalPages?: number }
      if (isMounted) {
        setCards(resp.data);
        if (typeof resp.totalPages === "number") {
          setTotalPages(resp.totalPages);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [param]);

  // Persistance des favoris
  useEffect(() => {
    localStorage.setItem("univers_favs", JSON.stringify(favs));
  }, [favs]);

  const toggleFav = (id) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // 🔹 “Mes univers”
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
        (c.tags || []).some((t) => (typeof t === "string" ? t : t?.name)?.toLowerCase().includes(q));
      const okTag = !selectedTag || selectedTag === "" || (c.tags || []).map(t => (typeof t === "string" ? t : t?.name)).includes(selectedTag);
      return okQuery && okTag;
    });

    return list.sort((a, b) => {
      const aFav = favs.includes(a.id);
      const bFav = favs.includes(b.id);
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  }, [cards, search, selectedTag, favs]);

  // 🔹 Génération des boutons de pagination (1 2 3 ... N)
  const renderPagination = () => {
    const currentPage = param.p;
    const pages = [];
    const maxToShow = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (end - start < maxToShow - 1) {
      if (start === 0) end = Math.min(totalPages - 1, start + (maxToShow - 1));
      else if (end === totalPages - 1) start = Math.max(0, end - (maxToShow - 1));
    }

    if (start > 0) {
      pages.push(<button key={0} onClick={() => handlePage(0)} className={currentPage === 0 ? "active" : ""}>1</button>);
      if (start > 1) pages.push(<span key="start-ellipsis">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} onClick={() => handlePage(i)} className={currentPage === i ? "active" : ""}>
          {i + 1}
        </button>
      );
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push(<span key="end-ellipsis">...</span>);
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePage(totalPages - 1)}
          className={currentPage === totalPages - 1 ? "active" : ""}
        >
          {totalPages}
        </button>
      );
    }

    return <div className="pagination">{pages}</div>;
  };



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
       {renderPagination()}

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
          initialFilterValues={initialFilterValues}
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
