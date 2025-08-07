import React, { useState, useEffect } from "react";
import "./MenuFiche.css";
import { useHorizontalScroll, useGhostDragAndDrop, ApiFiche } from "@service";
import { SearchBar, FicheCardMenu, FicheCreateCharacterModal } from "@components";
import { FaFilter } from "react-icons/fa";



const MenuFiche = () => {
  const scrollRef = useHorizontalScroll();
  const [search, setSearch] = useState("");
  const [characterList, setCharacterList] = useState([]);
  const [showModal, setShowModal] = useState(false); // ✅ Ajout du state de la modale

  // ✅ Drag & drop sur desktop uniquement
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    useGhostDragAndDrop({
      dragSelector: ".character-card:not(.create-card)",
      onMouseUpCallback: ({ draggedElement, event }) => {
        const dropTarget = event.target.closest(".character-card");
        if (!dropTarget || dropTarget === draggedElement) return;

        const draggedIndex = Number(draggedElement.dataset.index);
        const targetIndex = Number(dropTarget.dataset.index);

        if (draggedIndex === -1 || targetIndex === -1) return;
        console.log(characterList[draggedIndex].id)

        const payload = {type:"owner", targetId:localStorage.getItem("id"), pos:targetIndex}

        ApiFiche.moveFiche(characterList[draggedIndex].id, payload)
        const updated = [...characterList];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setCharacterList(updated);
      },
    });
  }

  useEffect(() => {
    const fetchFiches = async () => {
      const id = localStorage.getItem("id");
      if (id) {
        try {
          const result = await ApiFiche.getFiches("owner", id);
          if (Array.isArray(result?.data)) {
            setCharacterList(result.data);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des fiches :", err);
        }
      }
    };

    fetchFiches();
  }, []);


  const handleFilterClick = () => {
    console.log("Filtre cliqué !");
  };

  return (
    <div className="fiche-page menu-fichePage">
      {/* ===== PC header ===== */}
      <div className="menu-header">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {/* ===== Mobile header ===== */}
      <div className="menu-header-mobil">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {/* ===== Characters list ===== */}
      <div className="character-selection" ref={scrollRef}>
        {/* Carte pour créer un nouveau personnage */}
        <div
          className="character-card create-card"
          onClick={() => setShowModal(true)}
        >
          <span className="plus-sign">NEW</span>
        </div>

        {/* Cartes des personnages */}
        {characterList
          .filter((char) => char.name.toLowerCase().includes(search.toLowerCase())).map((char, index) => (
            <div
              key={index}
              data-index={index}
              className="character-card"
              style={{ backgroundColor: char.bgColor }}
            >
              <FicheCardMenu
                onEdit={() => console.log("Modifier", char)}
                onDuplicate={() => console.log("Dupliquer", char)}
                onDelete={() => console.log("Supprimer", char)}
              />
              {char.isNew && <div className="card-new">NEW</div>}
              <div
                className="character-img"
                style={{ backgroundImage: `url(${char.image})` }}
              />
              <div className="character-name">{char.name}</div>
            </div>
          ))}
      </div>

      {/* ===== Modale de création de personnage ===== */}
      {showModal && (
        <FicheCreateCharacterModal
          onClose={() => setShowModal(false)}
          onCreate={(newChar) => setCharacterList((prev) => [...prev, newChar])}
        />
      )}
    </div>
  );
};

export default MenuFiche;
