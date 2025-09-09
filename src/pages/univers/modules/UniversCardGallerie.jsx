import React, { useState, useEffect, useMemo } from "react";
import Masonry from "react-masonry-css";
import { dossier }from "@assets"; // ajuste si ton alias exporte différemment
import "./UniversCardGallerie.css";
import { BackLocation, ModalGeneric } from "@components/index";
import { ApiUnivers, DroitAccess } from "@service";
import { useParams, useNavigate } from "react-router-dom";

const breakpoints = {
  default: 5,
  1600: 4,
  1200: 3,
  800: 2,
  480: 1,
};

const UniversCardGallerie = ({
  title = "Gallerie Golstrem",
 
  folders = [],
  bg, // optionnel: url de fond si tu veux un wallpaper derrière
  onOpenFolder,
  onAddClick,
  onDeleteImages, // nouvelle prop pour gérer la suppression
  onDeleteFolders, // nouvelle prop pour gérer la suppression des dossiers
  universId, // id de l'univers pour alimenter la liste des dossiers via API
}) => {
  const navigate = useNavigate();
  const { id: routeUniversId, folder: routeFolder } = useParams() || {};
  const effectiveUniversId = useMemo(() => universId || routeUniversId, [universId, routeUniversId]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(new Set());
  const [selectedFoldersForDeletion, setSelectedFoldersForDeletion] = useState(new Set());
  const [isAddImagesModalOpen, setIsAddImagesModalOpen] = useState(false);

  // Etat provenant de l'API
  const [apiFolders, setApiFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [apiImages, setApiImages] = useState([]);

  // Titre dynamique selon l'état
  const [universName, setUniversName] = useState("");
  const [currentFolderLabel, setCurrentFolderLabel] = useState("");
  const [droit, setDroit] = useState(null);
  const dynamicTitle = useMemo(() => {
    const base = universName || String(effectiveUniversId || "");
    if (!base) return title;
    return currentFolder ? `${base} - ${currentFolderLabel || currentFolder}` : `Gallerie ${base}`;
  }, [universName, effectiveUniversId, currentFolder, currentFolderLabel, title]);

  // Configuration des champs pour la modal d'ajout d'images
  const addImagesFields = useMemo(() => ({
    selectFolder: {
      type: "select",
      label: "Dossier de gallerie",
      value: apiFolders.map(f => f.label || f.value).filter(Boolean),
      currentFolder: currentFolder,
      another: true
    },
    inputUrl0: {
      type: "img+",
      label: " ",
    }
  }), [apiFolders, currentFolder]);
  // Charger la liste des dossiers depuis l'API
  useEffect(() => {
    const loadFolders = async () => {
      if (!effectiveUniversId) return;
      try {
        const res = await ApiUnivers.getFolderGallerie(effectiveUniversId);
        // Tolérant: accepte un tableau de chaînes, ou un tableau d'objets { name/label, count }
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length === 0) {
          list.push("general");
        }
        const normalized = list.map((item) => {
          if (typeof item === 'string') return { label: item, count: undefined, value: item };
          const name = item?.name || item?.label || item?.folder || "";
          const count = item?.count ?? item?.nbr;
          return { label: name, count, value: name };
        });
        setApiFolders(normalized);
      } catch (e) {
        console.error("Erreur chargement dossiers gallerie:", e);
        setApiFolders([]);
      }
    };
    loadFolders();
  }, [effectiveUniversId]);

  // Charger le nom de l'univers
  useEffect(() => {
    const loadUniversName = async () => {
      if (!effectiveUniversId) return;
      try {
        const res = await ApiUnivers.getDetailUnivers(effectiveUniversId);
        setDroit(res?.data?.droit);
        const name = res?.data?.name || String(effectiveUniversId);
        setUniversName(name);
      } catch {
        setUniversName(String(effectiveUniversId || ""));
      }
    };
    loadUniversName();
  }, [effectiveUniversId]);

  // Ouvrir un dossier: charger ses images
  const onOpenFolderInternal = async (folderObj) => {
    if (!effectiveUniversId || !folderObj?.value) return;
    try {
      const res = await ApiUnivers.getImageGallerieByFolder(effectiveUniversId, folderObj.value);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      // Tolérant: images soit strings, soit objets { id, url, image, src }
      const normalized = list
        .map((it) => {
          if (typeof it === 'string') return { id: undefined, url: it };
          const url = it?.url || it?.image || it?.src || "";
          const id = it?.id ?? it?.imageId ?? it?.galleryId;
          return { id, url };
        })
        .filter((it) => Boolean(it.url));
      setApiImages(normalized);
      setCurrentFolder(folderObj.value);
      setCurrentFolderLabel(folderObj.label || folderObj.value);
    } catch (e) {
      console.error("Erreur chargement images du dossier:", e);
      setApiImages([]);
      setCurrentFolder(folderObj.value);
      setCurrentFolderLabel(folderObj.label || folderObj.value);
    }
  };

  // Charger automatiquement un dossier si le paramètre d'URL :folder est présent
  useEffect(() => {
    if (routeFolder) {
      // Essayer de résoudre le label depuis la liste
      const match = (apiFolders || []).find((f) => f?.value === routeFolder || f?.label === routeFolder);
      if (match) {
        setCurrentFolderLabel(match.label || match.value);
        onOpenFolderInternal(match);
      } else {
        setCurrentFolderLabel(routeFolder);
        onOpenFolderInternal({ value: routeFolder, label: routeFolder });
      }
    }
  }, [routeFolder, apiFolders]);
  const displayedImages = Array.isArray(apiImages) ? apiImages : [];

  // Si on est sur /gallerie (pas de dossier), pas d'images et au moins un dossier, rediriger vers le premier dossier
  useEffect(() => {
    if (!routeFolder && effectiveUniversId && Array.isArray(apiFolders) && apiFolders.length > 0 && displayedImages.length === 0) {
      const first = apiFolders[0];
      const target = first?.value || first?.label;
      if (target) {
        navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(target)}`);
      }
    }
  }, [routeFolder, effectiveUniversId, apiFolders, displayedImages.length]);

  // Si on est dans un dossier vide, rediriger vers un autre dossier ou /gallerie
  useEffect(() => {
    if (routeFolder && effectiveUniversId && displayedImages.length === 0 && apiFolders.length > 0) {
      const currentFolderExists = apiFolders.some(f => f.value === routeFolder);
      if (!currentFolderExists) {
        // Le dossier courant n'existe plus, rediriger vers un autre
        const otherFolders = apiFolders.filter(f => f.value !== routeFolder);
        if (otherFolders.length > 0) {
          const target = otherFolders[0];
          navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(target.value)}`);
        } else {
          navigate(`/univers/${effectiveUniversId}/gallerie`);
        }
      }
    }
  }, [routeFolder, effectiveUniversId, displayedImages.length, apiFolders]);

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

  // Fonction pour ouvrir la modal d'ajout d'images
  const handleAddImagesClick = () => {
    setIsAddImagesModalOpen(true);
  };

  // Fonction pour gérer la soumission de la modal d'ajout d'images
  const handleAddImagesSubmit = async (formData) => {
    const newImages = [];
    Object.keys(formData).forEach(key => {
      if (key.startsWith('inputUrl') && formData[key] && formData[key].trim() !== '') {
        newImages.push(formData[key].trim());
      }
    });

    const folder = formData.galleryFolder || currentFolder || "general";
    if (!effectiveUniversId || newImages.length === 0) {
      setIsAddImagesModalOpen(false);
      return;
    }

    try {
      // Si un callback externe est fourni, le prioriser
      if (onAddClick && typeof onAddClick === 'function') {
        onAddClick(newImages, folder);
      } else {
        const imagesByFolder = {
          [formData.selectFolder]: newImages
        };
        await ApiUnivers.massCreateImageGallerie(effectiveUniversId, imagesByFolder);
        navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(formData.selectFolder)}`);
      }
    } catch (e) {
      console.error("Erreur lors de l'ajout d'images:", e);
    } finally {
      setIsAddImagesModalOpen(false);
      // Rafraîchir le dossier courant et la liste des dossiers
      if (formData.selectFolder) {
        onOpenFolderInternal({ value: formData.selectFolder });
      }
      try {
        const res = await ApiUnivers.getFolderGallerie(effectiveUniversId);
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const normalized = list.map((item) => {
          if (typeof item === 'string') return { label: item, count: undefined, value: item };
          const name = item?.name || item?.label || item?.folder || "";
          return { label: name, count: item?.count, value: name };
        });
        setApiFolders(normalized);
      } catch {}
    }
  };

  // Supprimer les images et dossiers sélectionnés
  const handleDeleteSelected = async () => {
    let hasDeletions = false;
    try {
      // Supprimer les images sélectionnées
      if (selectedForDeletion.size > 0 && effectiveUniversId) {
        const selectedIndices = Array.from(selectedForDeletion).sort((a, b) => b - a);
        const selectedImages = selectedIndices.map((i) => displayedImages[i]).filter(Boolean);

        // Récupérer tous les IDs des images sélectionnées
        const imageIds = selectedImages
          .map((im) => im?.id)
          .filter((id) => id != null);

        // Suppression massive par IDs
        if (imageIds.length > 0) {
          await ApiUnivers.massDeleteImageGallerie(effectiveUniversId, { listId: imageIds });
          hasDeletions = true;
        }
      }

      // Supprimer les dossiers sélectionnés
      if (selectedFoldersForDeletion.size > 0 && effectiveUniversId) {
        const selectedFolderIndices = Array.from(selectedFoldersForDeletion).sort((a, b) => b - a);
        const foldersList = (apiFolders.length > 0 ? apiFolders : folders);
        const names = selectedFolderIndices
          .map((idx) => foldersList[idx])
          .map((f) => f?.value || f?.label)
          .filter(Boolean);
        if (names.length > 0) {
          await Promise.all(names.map((name) => ApiUnivers.deleteImageGallerieByFolder(effectiveUniversId, name)));
          hasDeletions = true;
        }
      }

      // Rafraîchir l'état si suppression effectuée
      if (hasDeletions) {
        setDeleteMode(false);
        setSelectedForDeletion(new Set());
        setSelectedFoldersForDeletion(new Set());

        // Refresh dossiers
        try {
          const res = await ApiUnivers.getFolderGallerie(effectiveUniversId);
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (list.length === 0) {
            list.push("general");
          }
          const normalized = list.map((item) => {
            if (typeof item === 'string') return { label: item, count: undefined, value: item };
            const name = item?.name || item?.label || item?.folder || "";
            return { label: name, count: item?.count, value: name };
          });
          setApiFolders(normalized);
        } catch {}

        // Refresh images du dossier courant si toujours présent, sinon redirect vers un autre dossier ou /gallerie
        if (currentFolder) {
          try {
            await onOpenFolderInternal({ value: currentFolder });
          } catch {
            // en cas d'erreur, essayer de rediriger vers un autre dossier
            const remainingFolders = apiFolders.filter(f => f.value !== currentFolder);
            if (remainingFolders.length > 0) {
              const target = remainingFolders[0];
              if (effectiveUniversId) {
                navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(target.value)}`);
              }
            } else {
              setApiImages([]);
              if (effectiveUniversId) navigate(`/univers/${effectiveUniversId}/gallerie`);
            }
          }
        } else {
          setApiImages([]);
          if (effectiveUniversId) navigate(`/univers/${effectiveUniversId}/gallerie`);
        }
      }
    } catch (e) {
      console.error('Erreur lors de la suppression:', e);
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
        <h1>{dynamicTitle}</h1>
      </header>

      <div className="uni-folders">
        {(apiFolders.length > 0 ? apiFolders : folders).map((f, i) => (
          <div 
            key={i} 
            className={`uni-folder-container ${deleteMode ? 'delete-mode' : ''}`}
            onClick={() => {
              if (deleteMode) {
                handleFolderSelection(i);
              } else {
                if (onOpenFolder) {
                  onOpenFolder(f);
                  return;
                }
                const target = f.value || f.label;
                if (target && effectiveUniversId) {
                  navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(target)}`);
                } else {
                  onOpenFolderInternal(f);
                }
              }
            }}
            style={{ cursor: deleteMode ? 'pointer' : 'default' }}
          >
            {deleteMode && (
              <div className="uni-folder-checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedFoldersForDeletion.has(i)}
                  onChange={() => handleFolderSelection(i)}
                  className="uni-delete-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <button
              className="uni-folder"
              type="button"
              onClick={(e) => {
                if (deleteMode) {
                  // En mode suppression, ne pas empêcher l'événement de remonter à la div
                  return;
                }
                e.stopPropagation();
                if (onOpenFolder) {
                  onOpenFolder(f);
                  return;
                }
                const target = f.value || f.label;
                if (target && effectiveUniversId) {
                  navigate(`/univers/${effectiveUniversId}/gallerie/${encodeURIComponent(target)}`);
                } else {
                  onOpenFolderInternal(f);
                }
              }}
              title={f.label || f.value}
            >
              <img src={dossier} alt="" aria-hidden="true" />
              <span>{f.label || f.value}</span>
            </button>
          </div>
        ))}
      </div>

      <Masonry
        breakpointCols={breakpoints}
        className="uni-masonry"
        columnClassName="uni-masonry_column"
      >
        {displayedImages.map((imgObj, idx) => (
          <div 
            className={`uni-card ${deleteMode ? 'delete-mode' : ''}`}
            key={(imgObj.url || '') + idx}
            onClick={() => {
              if (deleteMode) {
                handleImageSelection(idx);
              } else {
                handleImageClick(imgObj.url, idx);
              }
            }}
            style={{ cursor: 'pointer' }}
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
              src={imgObj.url}
              alt={`Galerie image ${idx + 1}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </Masonry>

      <div className="uni-fab-container">
        {DroitAccess.isOwner(droit) && (
          <button
          className="uni-fab uni-fab-delete"
          type="button"
          title="Supprimer des éléments"
          onClick={toggleDeleteMode}
          aria-label="Supprimer"
        >
          🗑️
        </button>
        )}
        {DroitAccess.hasWriteAccess(droit) && (
          <button
          className="uni-fab"
          type="button"
          title="Ajouter des images"
          onClick={handleAddImagesClick}
          aria-label="Ajouter"
        >
          +
        </button>
        )}
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
              type="button"
            >
              Annuler
            </button>
            <button
              className="uni-btn-delete"
              onClick={handleDeleteSelected}
              disabled={totalSelected === 0}
              type="button"
            >
              Supprimer ({totalSelected})
            </button>
          </div>
        </div>
      )}

      {/* Modal d'aperçu d'image */}
      {selectedImage && (
        <div className="uni-pr-modal" onClick={closePreview}>
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
          
          {/* Flèche gauche */}
          {selectedImage.index > 0 && (
            <button 
              className="uni-pr-arrow uni-pr-left"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage({
                  src: displayedImages[selectedImage.index - 1].url,
                  index: selectedImage.index - 1
                });
              }}
            >
              ‹
            </button>
          )}
          
          {/* Flèche droite */}
          {selectedImage.index < displayedImages.length - 1 && (
            <button 
              className="uni-pr-arrow uni-pr-right"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage({
                  src: displayedImages[selectedImage.index + 1].url,
                  index: selectedImage.index + 1
                });
              }}
            >
              ›
            </button>
          )}
          
          <div className="uni-pr-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={`Image ${selectedImage.index + 1}`}
              className="uni-pr-image"
            />
          </div>
        </div>
      )}

      {/* Modal d'ajout d'images */}
      {isAddImagesModalOpen && (
        <ModalGeneric
          onClose={() => setIsAddImagesModalOpen(false)}
          handleSubmit={handleAddImagesSubmit}
          initialData={{ selectFolder: currentFolder }}
          fields={addImagesFields}
          title="Ajouter des images"
          noButtonCancel={false}
          textButtonValidate="Ajouter"
          name="addImages"
          noMemory={true}
        />
      )}
    </div>
  );
};

export default UniversCardGallerie;
