import React from "react";
import Masonry from "react-masonry-css";
import { dossier }from "@assets"; // ajuste si ton alias exporte différemment
import "./UniversCardGallerie.css";

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
  return (
    <div
      className="uni-gallerie"
      style={bg ? { ["--uni-bg"]: `url(${bg})` } : undefined}
    >
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
          <div className="uni-card" key={src + idx}>
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
    </div>
  );
};

export default UniversCardGallerie;
