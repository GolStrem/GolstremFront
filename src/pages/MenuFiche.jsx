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
import { useParams, useLocation, useNavigate } from "react-router-dom";

// ⬇️ Handlers purs (aucun appel API)
import useFicheHandlers from "@service/handler/useFicheHandler";

const MenuFiche = () => {
  const scrollRef = useHorizontalScroll();
  const [search, setSearch] = useState("");
  const [characterList, setCharacterList] = useState([]);
  const navigate = useNavigate();
  
  // Récupération des paramètres d'URL
  const { type, id } = useParams();
  const location = useLocation();
  
  // Déterminer si on est en mode lecture seule (URL avec paramètres)
  const isReadOnly = location.pathname !== "/fiches";
  
  // Déterminer le type et l'ID à utiliser
  const getFicheParams = () => {
    if (location.pathname === "/fiches") {
      // Mode normal : utiliser "owner" et l'ID du localStorage
      return {
        type: "owner",
        id: localStorage.getItem("id")
      };
    } else {
      // Mode avec paramètres : utiliser les paramètres de l'URL
      return {
        type: type || "owner",
        id: id || localStorage.getItem("id")
      };
    }
  };

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

  // ✅ Drag & drop sur desktop uniquement - désactivé en mode lecture seule
  if (!/Mobi|Android/i.test(navigator.userAgent) && !isReadOnly) {
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

        const ficheParams = getFicheParams();
        const payload = {type: ficheParams.type, targetId: ficheParams.id, pos:characterList[targetId].pos}

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

        setCharacterList(updated);
      },
    });
  }

  useEffect(() => {
    const fetchFiches = async () => {
      const ficheParams = getFicheParams();
      if (!ficheParams.id) return;
      
      try {
        const result = await ApiFiche.getFiches(ficheParams.type, ficheParams.id);
        if (Array.isArray(result?.data)) {
          setCharacterList(result.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des fiches :", err);
      }
    };
    fetchFiches();
  }, [type, id, location.pathname]); // Recharger quand les paramètres changent

  const handleFilterClick = () => {
    console.log("Filtre cliqué !");
  };

  // Ouverture suppression - désactivée en mode lecture seule
  const askDelete = (ficheId) => {
    if (isReadOnly) return;
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
    // On passe l'objet renvoyé (contient id + champs modifiés), le handler gère le merge propre
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
        {/* Carte pour créer un nouveau personnage - masquée en mode lecture seule */}
        {!isReadOnly && (
          <div className="character-card create-card" onClick={() => setShowCreateModal(true)}>
            <span className="plus-sign">NEW</span>
          </div>
        )}

        {/* Cartes des personnages */}
        {characterList
          .filter((char) => (char?.name || "").toLowerCase().includes(search.toLowerCase()))
          .map((char, index) => (
            <div
              key={char.id ?? index}
              data-index={char.id}
              className={`character-card ${isReadOnly ? 'read-only' : ''}`}
              style={{ backgroundColor: char.color }} // ⬅️ color (pas bgColor)
              onClick={() =>navigate("/ficheNew")}
            >
              {/* Menu contextuel - désactivé en mode lecture seule */}
              {!isReadOnly && (
                <FicheCardMenu
                  triggerProps={{ 'data-nodrag': true }}
                  onEdit={() => setEditing(char)}
                  onDuplicate={() => console.log("Dupliquer", char)}
                  onDelete={() => askDelete(char.id)}
                />
              )}
              {char.isNew && <div className="card-new">NEW</div>}
              <div className="character-img" style={{ backgroundImage: `url(${char.image})` }} />
              <div className="character-name">{char.name}</div>
            </div>
          ))}
      </div>

      {/* ===== Modale création ===== */}
      {showCreateModal && !isReadOnly && (
        <FicheCreateCharacterModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreated}
        />
      )}

      {/* ===== Modale modification ===== */}
      {editing && !isReadOnly && (
        <FicheModifCharacterModal
          fiche={editing}
          onClose={() => setEditing(null)}
          onUpdate={handleUpdated}
        />
      )}

      {/* ===== Modale suppression ===== */}
      {showDeleteModal && selectedFicheId != null && !isReadOnly && (
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
