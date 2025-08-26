import React, { useState, useEffect, useMemo } from "react";
import "./MenuFiche.css";
import { SearchBar, ModalGeneric, Pagination } from "@components";
import { FaFilter, FaStar } from "react-icons/fa";
import "./MenuUnivers.css";
import { ApiUnivers, ApiService } from "@service"
import { createUniversFilterFields, createUniversCreateFields } from "@components/general/fieldModal";

const listTag = ["Francais", "Fantastique", "Discord", "Anglais", "Jeu de table", "Word of Warcraft", "Final Fantasy XIV"];

const MenuUnivers = () => {
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState([]);            
  const [selectedTag, setSelectedTag] = useState(""); 
  const [isModalUniversOpen, setModalUniversOpen] = useState(false);
  const [isModalFiltreOpen, setModalFiltreOpen] = useState(false)
  const [isModalCreateUnivOpen, setModalCreateUnivOpen] = useState(false)
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  // État de loading initial

  const [param, setParam] = useState({limit: 30, p: 0});
  const [totalPages, setTotalPages] = useState(0); // si l'API renvoie totalPages, on le mettra à jour
  const [fieldsFilter, setFieldsFilter] = useState([]);
  const [createUnivers, setCreateUnivers] = useState([]);
  const [friendsMapping, setFriendsMapping] = useState({}); // Mapping nom -> id pour les amis
  const [tagsMapping, setTagsMapping] = useState({}); // Mapping nom -> id pour les tags
  const [myPage, setMypage] = useState(0);
  const [myTotalPage, setMyTotalPage] = useState(0);
  const [myCards, setMyCards] = useState([]);

  // ➜ Mémoire du filtre appliqué
  const [activeFilter, setActiveFilter] = useState({
    flags: [],               // ["Ami(e)s", "Favoris", "NSFW"]
    selectedTagFilter: "",   // string (tag choisi)
    scope: "Tous",           // "Tous" | "Henel" | ...
    orderBy: "Nouveau",      // "Nouveau" | "Popularité" | "Membres"
    orderDir: "Descendant",  // "Descendant" | "Ascendant"
  });


  const handlePage = (p) => {
    const page = Number(p);
    if (!Number.isNaN(page) && page >= 0 && page < totalPages) {
      setParam((prev) => ({ ...prev, p: page }));
    }
  };
    const myHandlePage = (p) => {
    const page = Number(p);
    if (!Number.isNaN(page) && page >= 0 && page < myTotalPage) {
      setMypage(page);
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

  // ⚙️ Définition des champs de filtre avec la nouvelle fonction
  // ✅ Valeurs initiales injectées dans la modale (sans modifier ModalGeneric)
  const initialFilterValues = {
    flags: activeFilter.flags,
    tagsUnivers: activeFilter.selectedTagFilter,
    sortScope: activeFilter.scope,
    orderBy: activeFilter.orderBy,
    orderDir: activeFilter.orderDir,
  };

  


  const handleSubmitFilter = (formValues) => {
    setActiveFilter({
      flags: formValues.flags ?? [],
      selectedTagFilter: formValues.tagsUnivers ?? "",
      scope: formValues.sortScope ?? "Tous",
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
        byFriend: formValues.sortScope !== "Tous" ? friendsMapping[formValues.sortScope] : null,
        byTag: formValues.tagsUnivers && formValues.tagsUnivers !== "" ? tagsMapping[formValues.tagsUnivers] : null
      }
    };
    setParam(useParam);
    setModalFiltreOpen(false);
  };

  const handleSubmitCreateUnivers = async (formValues) => {
  // Préparer le payload pour l'API
  const payload = {
    name: formValues.NomUnivers,
    description: formValues.descriptionUnivers,
    image: formValues.image || "", // ou null
    visibility: formValues.selectVisibily === "Public" ? "0" : "1",
    nfsw: formValues.flags?.includes("NSFW") ? "1" : "0",
    tags: formValues.selectedTagFilter || []
  };

  try {
    const response = await ApiUnivers.createUnivers(payload);
    console.log("Univers créé :", response.data);

    // Optionnel : fermer la modal et reset le formulaire
    setModalCreateUnivOpen(false);

    // Recharger la liste des univers
    setParam((prev) => ({ ...prev })); // force le useEffect à reload
  } catch (err) {
    console.error("Erreur création univers :", err.response?.data || err.message);
  }
};


  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("univers_favs") || "[]"); }
    catch { return []; }
  });


  // ====== Chargement initial de la page ======
  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
        const tags = await ApiUnivers.getTags();
        const listTag = tags.data.map(tag => tag.name);
        
        const friends = await ApiService.getFriends();
        const listFriend = friends.data.map(friend => friend.pseudo);
        
        // Création des mappings nom -> id
        const tagsMap = {};
        tags.data.forEach(tag => {
          tagsMap[tag.name] = tag.id;
        });
        
        const friendsMap = {};
        friends.data.forEach(friend => {
          friendsMap[friend.pseudo] = friend.id;
        });
        
        setTagsMapping(tagsMap);
        setFriendsMapping(friendsMap);
        setFieldsFilter(createUniversFilterFields(listTag, listFriend));
        setCreateUnivers(createUniversCreateFields(listTag));
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, []);

  // ====== Chargement des cartes lors des changements de paramètres ======
  useEffect(() => {
    // Ne pas recharger si c'est le chargement initial
    if (isLoading) return;
    
    let isMounted = true;
    (async () => {
      const resp = await ApiUnivers.getUnivers(param);

      if (isMounted) {
        setCards(resp.data.data);
        if (typeof resp.data.pagination.pages === "number") {
          setTotalPages(resp.data.pagination.pages);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [param, isLoading]);

  // Persistance des favoris
  useEffect(() => {
    localStorage.setItem("univers_favs", JSON.stringify(favs));
  }, [favs]);

// en haut de ton composant
const favCooldownRef = React.useRef(new Set());

  const toggleFav = async (id) => {
    // ✅ Vérifie si un cooldown est en cours pour cet univers
    if (favCooldownRef.current.has(id)) return;

    favCooldownRef.current.add(id);
    setTimeout(() => favCooldownRef.current.delete(id), 1500); // cooldown 2s

    const card = cards.find((c) => c.id === id);
    if (!card) return;

    const newHasStar = card.hasStar === 1 ? 0 : 1;

    // Mise à jour optimiste
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, hasStar: newHasStar } : c
      )
    );

    try {
      if (newHasStar === 1) {
        await ApiUnivers.addStar(id);
      } else {
        await ApiUnivers.removeStar(id);
      }
    } catch (err) {
      console.error("Erreur toggle fav:", err);

      // rollback si erreur
      setCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, hasStar: card.hasStar } : c
        )
      );
    }
  };


  useEffect(() => {
    // Ne pas recharger si c'est le chargement initial
    if (isLoading) return;
    
    let isMounted = true;
    (async () => {
      const resp = await ApiUnivers.getUnivers({p:myPage,limit:6,filter:{withMe: 1, nfsw: 1}});

      if (isMounted) {
        setMyCards(resp.data.data);
        if (typeof resp.data.pagination.pages === "number") {
          setMyTotalPage(resp.data.pagination.pages);
        }
      }
    })();
    return () => { isMounted = false; };

  }, [myPage, isLoading]);


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

    const handleSearch = (value) => {
    setSearch(value);  

    
    setParam((prev) => ({
      ...prev,
      search: value.trim(),
      p: 0, 
    }));
  };

  const handleTag = (value) => {
    setSelectedTag(value); // Met à jour le tag sélectionné localement

    setParam((prev) => ({
      ...prev,
      filter: {
        ...(prev.filter || {}),  // récupère l'ancien filtre s'il existe
        byTag: value ? tagsMapping[value.trim()] : null, // null si aucune sélection
      },
      p: 0, // retourne à la page 0
    }));
  };




  return (
    <div className="univers-page">
      {/* ===== Loading ===== */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des univers...</p>
        </div>
      )}

      {/* ===== Headers ===== */}
      <div className="menu-header">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleModalViewFilter} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={handleSearch} onClear={() => handleSearch("")} />
        </div>
      </div>

      <div className="menu-header-mobil">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleModalViewFilter} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={handleSearch} onClear={() => handleSearch("")} />
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
            onClick={() => handleTag(selectedTag === tag ? "" : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* ===== Mes univers ===== */}
      {myCards.length > 0 && (
        <>
          <h2 className="univers-subtitle">Mes univers</h2>
          <section className="univers-grid myuni" aria-label="Mes univers">
            {myCards.map((card) => (
              <article
                key={`my-${card.id}`} 
                className="univers-card"
                onClick={() => handleModalViewUnivers(card)}
              >
                <button
                  className={`fav-btn ${card.hasStar === 1 ? "is-fav" : ""}`}
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
           <Pagination  currentPage={myPage} totalPages={myTotalPage} onPageChange={myHandlePage} />
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
              className={`fav-btn ${card.hasStar === 1 ? "is-fav" : ""}`}
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
       <Pagination 
         currentPage={param.p}
         totalPages={totalPages}
         onPageChange={handlePage}
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
          initialData={initialFilterValues}
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
          handleSubmit={handleSubmitCreateUnivers}
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
