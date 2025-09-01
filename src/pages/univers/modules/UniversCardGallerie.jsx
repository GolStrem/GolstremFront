import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { dossier }from "@assets"; // ajuste si ton alias exporte différemment
import "./UniversCardGallerie.css";
import { BackLocation } from "@components/index";
import { useNavigatePage } from "@service";

const DEFAULT_IMAGES = [
  "https://i.pinimg.com/736x/e0/db/db/e0dbdb2927e1b15fa28b4245da1e425f.jpg",
    "https://i.pinimg.com/736x/e0/db/db/e0dbdb2927e1b15fa28b4245da1e425f.jpg",
  "https://i.pinimg.com/736x/e0/db/db/e0dbdb2927e1b15fa28b4245da1e425f.jpg",

  "https://i.pinimg.com/1200x/88/1e/7e/881e7edfb44d95af1ca9ff72455c3152.jpg",
  "https://i.pinimg.com/1200x/3b/4f/b2/3b4fb215d37f317b19b6c3bbe1fb45ab.jpg",
  "https://i.pinimg.com/736x/95/d7/b3/95d7b3c4be244556a893484556dd6a1f.jpg",
  "https://i.pinimg.com/736x/0b/65/c9/0b65c9b4e68b043afe1e8650612d7729.jpg",
  "https://i.pinimg.com/1200x/cd/e9/fb/cde9fb533e796a92f05b282e2d73f186.jpg",
  "https://i.pinimg.com/736x/95/d7/b3/95d7b3c4be244556a893484556dd6a1f.jpg",
  "https://i.pinimg.com/736x/95/d7/b3/95d7b3c4be244556a893484556dd6a1f.jpg",
  "https://i.pinimg.com/1200x/49/a5/fb/49a5fbf5e163b86e21626b2db4bb4e57.jpg",
  "https://i.pinimg.com/1200x/88/1e/7e/881e7edfb44d95af1ca9ff72455c3152.jpg",
  "https://i.pinimg.com/736x/95/d7/b3/95d7b3c4be244556a893484556dd6a1f.jpg",
  "https://i.pinimg.com/736x/95/d7/b3/95d7b3c4be244556a893484556dd6a1f.jpg",
  "https://i.pinimg.com/736x/9c/2b/2a/9c2b2a9785103abcb2a15772a700ca3d.jpg",
];

const breakpoints = {
  default: 5,
  1600: 4,
  1200: 3,
  800: 2,
  480: 1,
};

const UniversCardGallerie = ({
  title = "Gallerie Golstrem",
  images = DEFAULT_IMAGES,
  folders = [{ label: "Mes dossiers" }, { label: "SOIREE XXX" }],
  bg, // optionnel: url de fond si tu veux un wallpaper derrière
  onOpenFolder,
  onAddClick,
  onDeleteImages, // nouvelle prop pour gérer la suppression
  onDeleteFolders, // nouvelle prop pour gérer la suppression des dossiers
}) => {
  const navigatePage = useNavigatePage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(new Set());
  const [selectedFoldersForDeletion, setSelectedFoldersForDeletion] = useState(new Set());

  // Fonction pour ouvrir l'aperçu d'une image
  const handleImageClick = (imageSrc, imageIndex) => {
    if (!deleteMode) {
      setSelectedImage({ src: imageSrc, index: imageIndex });
    }
  };

  // Fonction pour fermer l'aperçu
  const closePreview = () => {
    setSelectedImage(null);
  };

  // Gestion de la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        closePreview();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // Activer/désactiver le mode suppression
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedForDeletion(new Set());
    setSelectedFoldersForDeletion(new Set());
  };

  // Gérer la sélection d'une image pour suppression
  const handleImageSelection = (imageIndex) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(imageIndex)) {
      newSelection.delete(imageIndex);
    } else {
      newSelection.add(imageIndex);
    }
    setSelectedForDeletion(newSelection);
  };

  // Gérer la sélection d'un dossier pour suppression
  const handleFolderSelection = (folderIndex) => {
    const newSelection = new Set(selectedFoldersForDeletion);
    if (newSelection.has(folderIndex)) {
      newSelection.delete(folderIndex);
    } else {
      newSelection.add(folderIndex);
    }
    setSelectedFoldersForDeletion(newSelection);
  };

  // Supprimer les images et dossiers sélectionnés
  const handleDeleteSelected = () => {
    let hasDeletions = false;
    
    // Supprimer les images sélectionnées
    if (selectedForDeletion.size > 0) {
      const selectedIndices = Array.from(selectedForDeletion).sort((a, b) => b - a);
      if (onDeleteImages) {
        onDeleteImages(selectedIndices);
      }
      hasDeletions = true;
    }
    
    // Supprimer les dossiers sélectionnés
    if (selectedFoldersForDeletion.size > 0) {
      const selectedFolderIndices = Array.from(selectedFoldersForDeletion).sort((a, b) => b - a);
      if (onDeleteFolders) {
        onDeleteFolders(selectedFolderIndices);
      }
      hasDeletions = true;
    }
    
    // Réinitialiser le mode suppression seulement si des éléments ont été supprimés
    if (hasDeletions) {
      setDeleteMode(false);
      setSelectedForDeletion(new Set());
      setSelectedFoldersForDeletion(new Set());
    }
  };

  // Annuler le mode suppression
  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedForDeletion(new Set());
    setSelectedFoldersForDeletion(new Set());
  };

  // Calculer le total des éléments sélectionnés
  const totalSelected = selectedForDeletion.size + selectedFoldersForDeletion.size;

  return (
    <div
      className="uni-gallerie"
      style={bg ? { ["--uni-bg"]: `url(${bg})` } : undefined}
    >
      <BackLocation />
      <header className="uni-gal-header">
        <h1>{title}</h1>
      </header>

      <div className="uni-folders">
        {folders.map((f, i) => (
          <div key={i} className={`uni-folder-container ${deleteMode ? 'delete-mode' : ''}`}>
            {deleteMode && (
              <div className="uni-folder-checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedFoldersForDeletion.has(i)}
                  onChange={() => handleFolderSelection(i)}
                  className="uni-delete-checkbox"
                />
              </div>
            )}
            <button
              className="uni-folder"
              type="button"
              onClick={() => onOpenFolder?.(f)}
              title={f.label}
              disabled={deleteMode}
            >
              <img src={dossier} alt="" aria-hidden="true" />
              <span>{f.label}</span>
            </button>
          </div>
        ))}
      </div>

      <Masonry
        breakpointCols={breakpoints}
        className="uni-masonry"
        columnClassName="uni-masonry_column"
      >
        {images.map((src, idx) => (
          <div 
            className={`uni-card ${deleteMode ? 'delete-mode' : ''}`}
            key={src + idx}
            onClick={() => handleImageClick(src, idx)}
            style={{ cursor: deleteMode ? 'default' : 'pointer' }}
          >
            {deleteMode && (
              <div className="uni-checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedForDeletion.has(idx)}
                  onChange={() => handleImageSelection(idx)}
                  className="uni-delete-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <img
              src={src}
              alt={`Galerie image ${idx + 1}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </Masonry>

      <div className="uni-fab-container">
        <button
          className="uni-fab uni-fab-delete"
          type="button"
          title="Supprimer des éléments"
          onClick={toggleDeleteMode}
          aria-label="Supprimer"
        >
          🗑️
        </button>
        
        <button
          className="uni-fab"
          type="button"
          title="Ajouter des images"
          onClick={onAddClick}
          aria-label="Ajouter"
        >
          +
        </button>
      </div>

      {/* Barre d'actions pour le mode suppression */}
      {deleteMode && (
        <div className="uni-delete-actions">
          <span className="uni-selection-count">
            {totalSelected} élément(s) sélectionné(s)
            {selectedForDeletion.size > 0 && ` (${selectedForDeletion.size} image${selectedForDeletion.size > 1 ? 's' : ''}`}
            {selectedFoldersForDeletion.size > 0 && `, ${selectedFoldersForDeletion.size} dossier${selectedFoldersForDeletion.size > 1 ? 's' : ''}`}
            {selectedForDeletion.size > 0 && selectedFoldersForDeletion.size > 0 && ')'}
          </span>
          <div className="uni-delete-buttons">
            <button
              className="uni-btn-cancel"
              onClick={cancelDeleteMode}
            >
              Annuler
            </button>
            <button
              className="uni-btn-delete"
              onClick={handleDeleteSelected}
              disabled={totalSelected === 0}
            >
              Supprimer ({totalSelected})
            </button>
          </div>
        </div>
      )}

      {/* Modal d'aperçu d'image */}
      {selectedImage && (
        <div className="uni-pr-modal" onClick={closePreview}>
          <div className="uni-pr-content" onClick={(e) => e.stopPropagation()}>
            {/* Croix de fermeture */}
            <button 
              className="uni-pr-close"
              onClick={(e) => {
                e.stopPropagation();
                closePreview();
              }}
              aria-label="Fermer l'aperçu"
            >
              ×
            </button>
            
            <img
              src={selectedImage.src}
              alt={`Image ${selectedImage.index + 1}`}
              className="uni-pr-image"
            />
            
            {/* Flèche gauche */}
            {selectedImage.index > 0 && (
              <button 
                className="uni-pr-arrow uni-pr-left"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({ 
                    src: images[selectedImage.index - 1], 
                    index: selectedImage.index - 1 
                  });
                }}
              >
                ‹
              </button>
            )}
            
            {/* Flèche droite */}
            {selectedImage.index < images.length - 1 && (
              <button 
                className="uni-pr-arrow uni-pr-right"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({ 
                    src: images[selectedImage.index + 1], 
                    index: selectedImage.index + 1 
                  });
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversCardGallerie;
