import React, { useState, useEffect } from "react";
import "./MenuFiche.css";
import { useHorizontalScroll, useGhostDragAndDrop, ApiFiche } from "@service";
import {
  SearchBar,
  FicheCardMenu,
  FicheCreateCharacterModal,
  FicheDeleteCharacterModal,
  FicheModifCharacterModal,
} from "@components";
import { FaFilter } from "react-icons/fa";

// ⬇️ Handlers purs (aucun appel API)
import useFicheHandlers from "@service/handler/useFicheHandler";

const MenuFiche = () => {
  const scrollRef = useHorizontalScroll();
  const [search, setSearch] = useState("");
  const [characterList, setCharacterList] = useState([]);

  // Handlers purs
  const {
    handleCreateFiche,
    handleEditFiche,
    handleDeleteFiche,
    handleMoveFiche,
  } = useFicheHandlers();

  // Création
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFicheId, setSelectedFicheId] = useState(null);

  // Modification
  const [editing, setEditing] = useState(null);

  // ✅ Drag & drop sur desktop uniquement
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
        const draggedId = characterList.findIndex(item => Number(item.id) === Number(draggedIndex));
        const targetId = characterList.findIndex(item => Number(item.id) === Number(targetIndex));

        const payload = {type:"owner", targetId:localStorage.getItem("id"), pos:characterList[targetId].pos}

        ApiFiche.moveFiche(characterList[draggedId].id, payload)

        let updated = [...characterList]

        const oldPos = updated[draggedId].pos;
        const newPos = updated[targetId].pos;

        for (const i in updated) {
          if (Number(i) === Number(draggedId)) {
            updated[i].pos = newPos;
          } else if (oldPos < newPos) {
            if (updated[i].pos > oldPos && updated[i].pos <= newPos) {
              updated[i].pos -= 1;
            }
          } else if (oldPos > newPos) {
            if (updated[i].pos >= newPos && updated[i].pos < oldPos) {
              updated[i].pos += 1;
            }
          }
        }
        updated = updated.sort((a, b) => a.pos - b.pos);
        console.log(updated)


        setCharacterList(updated);
      },
    });
  }

  useEffect(() => {
    const fetchFiches = async () => {
      const id = localStorage.getItem("id");
      if (!id) return;
      try {
        const result = await ApiFiche.getFiches("owner", id);
        if (Array.isArray(result?.data)) {
          setCharacterList(result.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des fiches :", err);
      }
    };
    fetchFiches();
  }, []);

  const handleFilterClick = () => {
    console.log("Filtre cliqué !");
  };

  // Ouverture suppression
  const askDelete = (ficheId) => {
    setSelectedFicheId(ficheId);
    setShowDeleteModal(true);
  };

  // Après suppression (callback de la modal) → handler pur
  const handleDeleted = (deletedId) => {
    setCharacterList((prev) => handleDeleteFiche(prev, deletedId));
    setShowDeleteModal(false);
    setSelectedFicheId(null);
  };

  // Après création (callback de la modal) → handler pur
  const handleCreated = (created) => {
    setCharacterList((prev) => handleCreateFiche(prev, created));
  };

  // Après modification (callback de la modal) → handler pur
  const handleUpdated = (updated) => {
    // On passe l’objet renvoyé (contient id + champs modifiés), le handler gère le merge propre
    setCharacterList((prev) => handleEditFiche(prev, updated));
    setEditing(null);
  };

  return (
    <div className="fiche-page menu-fichePage">
      {/* ===== PC header ===== */}
      <div className="menu-header">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      {/* ===== Mobile header ===== */}
      <div className="menu-header-mobil">
        <div className="menu-header-content">
          <button className="filter-button" onClick={handleFilterClick} title="Filtrer">
            <FaFilter size={16} />
          </button>
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      {/* ===== Characters list ===== */}
      <div className="character-selection" ref={scrollRef}>
        {/* Carte pour créer un nouveau personnage */}
        <div className="character-card create-card" onClick={() => setShowCreateModal(true)}>
          <span className="plus-sign">NEW</span>
        </div>

        {/* Cartes des personnages */}
        {characterList
          .filter((char) => (char?.name || "").toLowerCase().includes(search.toLowerCase()))
          .map((char, index) => (
            <div
              key={char.id ?? index}
              data-index={char.id}
              className="character-card"
              style={{ backgroundColor: char.color }} // ⬅️ color (pas bgColor)
            >
              <FicheCardMenu
                triggerProps={{ 'data-nodrag': true }}
                onEdit={() => setEditing(char)}
                onDuplicate={() => console.log("Dupliquer", char)}
                onDelete={() => askDelete(char.id)}
              />
              {char.isNew && <div className="card-new">NEW</div>}
              <div className="character-img" style={{ backgroundImage: `url(${char.image})` }} />
              <div className="character-name">{char.name}</div>
            </div>
          ))}
      </div>

      {/* ===== Modale création ===== */}
      {showCreateModal && (
        <FicheCreateCharacterModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreated}
        />
      )}

      {/* ===== Modale modification ===== */}
      {editing && (
        <FicheModifCharacterModal
          fiche={editing}
          onClose={() => setEditing(null)}
          onUpdate={handleUpdated}
        />
      )}

      {/* ===== Modale suppression ===== */}
      {showDeleteModal && selectedFicheId != null && (
        <FicheDeleteCharacterModal
          ficheId={selectedFicheId}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedFicheId(null);
          }}
          onDelete={handleDeleted}
        />
      )}
    </div>
  );
};

export default MenuFiche;
