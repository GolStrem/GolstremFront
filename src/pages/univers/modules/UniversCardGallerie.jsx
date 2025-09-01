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
}) => {
  const navigatePage = useNavigatePage();
  const [selectedImage, setSelectedImage] = useState(null);

  // Fonction pour ouvrir l'aperçu d'une image
  const handleImageClick = (imageSrc, imageIndex) => {
    setSelectedImage({ src: imageSrc, index: imageIndex });
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
          <button
            key={i}
            className="uni-folder"
            type="button"
            onClick={() => onOpenFolder?.(f)}
            title={f.label}
          >
            <img src={dossier} alt="" aria-hidden="true" />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <Masonry
        breakpointCols={breakpoints}
        className="uni-masonry"
        columnClassName="uni-masonry_column"
      >
        {images.map((src, idx) => (
          <div 
            className="uni-card" 
            key={src + idx}
            onClick={() => handleImageClick(src, idx)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={src}
              alt={`Galerie image ${idx + 1}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </Masonry>

      <button
        className="uni-fab"
        type="button"
        title="Ajouter des images"
        onClick={onAddClick}
        aria-label="Ajouter"
              >
         +
       </button>

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
