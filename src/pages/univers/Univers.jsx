import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Univers.css";
import { ffimg } from "@assets";
import { ModalGeneric } from "@components";
import { FaPaintBrush, FaTrash, FaEyeSlash, FaEdit } from "react-icons/fa";
import { createUniversDeleteFields, createUniversCreateFields } from "@components/general/fieldModal/universFields";


const CATEGORIES = [
  { key: "fiches",            label: "Fiches",               to: "/univers/fiches" },
  { key: "encyclopedie",      label: "Encyclopédie",         to: "/univers/encyclopedie" },
  { key: "etablissement",     label: "Établissement",        to: "/univers/etablissements" },
  { key: "ouverture",         label: "Ouverture / Inscription",to: "/univers/ouvertures" },
  { key: "tableau-affichage", label: "Tableau d'affichage",  to: "/univers/tableau" },
  { key: "Gallerie", label: "Gallerie",  to: "/univers/gallerie" }
];

// Configuration des boutons d'action
const ACTION_BUTTONS = [
  {
    icon: FaPaintBrush,
    title: "Modifier les images",
    ariaLabel: "Ouvrir la fenêtre de modification des images",
    onClick: (setIsEditImagesOpen) => () => setIsEditImagesOpen(true),
    className: "UniId-dot"
  },
  {
    icon: FaEyeSlash,
    title: "Désactiver/Réactiver l'image d'arrière-plan",
    ariaLabel: "Basculer l'image d'arrière-plan",
    onClick: (_, toggleBackground) => toggleBackground,
    className: "UniId-dot"
  },
  {
    icon: FaTrash,
    title: "Supprimer l'univers",
    ariaLabel: "Supprimer l'univers",
    onClick: (_, __, setIsDeleteModalOpen) => () => setIsDeleteModalOpen(true),
    className: "UniId-dot UniId-dot-danger"
  },
  {
    icon: FaEdit,
    title: "Modifier les informations de l'univers",
    ariaLabel: "Modifier les informations de l'univers",
    onClick: (_, __, ___, setIsEditInfoOpen) => () => setIsEditInfoOpen(true),
    className: "UniId-dot UniId-dot-info"
  }
];

const Univers = () => {
  const navigate = useNavigate();
  const [isEditImagesOpen, setIsEditImagesOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isBackgroundDisabled, setIsBackgroundDisabled] = useState(false);
  const [droits, setDroits] = useState("write")
  const [images, setImages] = useState({
    bgImage: "https://i.pinimg.com/1200x/88/1e/7e/881e7edfb44d95af1ca9ff72455c3152.jpg",
    fiches: "https://i.pinimg.com/1200x/88/1e/7e/881e7edfb44d95af1ca9ff72455c3152.jpg",
    encyclopedie: "https://i.pinimg.com/1200x/3b/4f/b2/3b4fb215d37f317b19b6c3bbe1fb45ab.jpg",
    etablissement: "https://i.pinimg.com/736x/0b/65/c9/0b65c9b4e68b043afe1e8650612d7729.jpg",
    ouverture: "https://i.pinimg.com/1200x/cd/e9/fb/cde9fb533e796a92f05b282e2d73f186.jpg",
    tableau: "https://i.pinimg.com/1200x/49/a5/fb/49a5fbf5e163b86e21626b2db4bb4e57.jpg",
    gallerie: "https://i.pinimg.com/736x/e0/db/db/e0dbdb2927e1b15fa28b4245da1e425f.jpg",
  });

  const [universInfo, setUniversInfo] = useState({
    NomUnivers: "Golstrem",
    descriptionUnivers: "ici sera reférencé les établissements et les fiches des personnes/établissement qui auront passer la validation",
    image: "https://i.pinimg.com/1200x/88/1e/7e/881e7edfb44d95af1ca9ff72455c3152.jpg",
    tagsUnivers: [],
    selectVisibily: "Public",
    flagsCreate: []
  });

  const fields = useMemo(() => ({
    bgImage: { type: "inputUrl", label: "Image d'arrière-plan" },
    fiches: { type: "inputUrl", label: "Fiches" },
    encyclopedie: { type: "inputUrl", label: "Encyclopédie" },
    etablissement: { type: "inputUrl", label: "Établissement" },
    ouverture: { type: "inputUrl", label: " Ouverture / Inscription" },
    tableau: { type: "inputUrl", label: "Tableau d'affichage" },
    gallerie: { type: "inputUrl", label: "Gallerie" },
  }), []);

  const deleteFields = useMemo(() => createUniversDeleteFields(), []);
  const infoFields = useMemo(() => createUniversCreateFields([]), []);

  const handleSubmitImages = (values) => {
    setImages(prev => ({ ...prev, ...values }));
    setIsEditImagesOpen(false);
  };

  const handleSubmitInfo = (values) => {
    setUniversInfo(prev => ({ ...prev, ...values }));
    setIsEditInfoOpen(false);
  };

  const handleDeleteUnivers = () => {
    // Ici vous pouvez ajouter la logique pour supprimer l'univers
    console.log("Suppression de l'univers...");
    setIsDeleteModalOpen(false);
    // navigate("/"); // Rediriger vers la page d'accueil ou la liste des univers
  };

  const toggleBackground = () => {
    setIsBackgroundDisabled(prev => !prev);
  };

  const resolveKey = (key) => {
    if (key === "tableau-affichage") return "tableau";
    return String(key || "").toLowerCase();
  };

  return (
    <div
      className="UniId-page"
      style={!isBackgroundDisabled && images.bgImage ? {
        backgroundImage: `url(${images.bgImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      } : undefined}
    >
      {droits === "write" && (
        <div className="UniId-left-dots">
          {ACTION_BUTTONS.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <button
                key={index}
                type="button"
                className={button.className}
                title={button.title}
                onClick={button.onClick(setIsEditImagesOpen, toggleBackground, setIsDeleteModalOpen, setIsEditInfoOpen)}
                aria-label={button.ariaLabel}
              >
                <IconComponent size={12} />
              </button>
            );
          })}
        </div>
      )}

      <h1 className="UniId-title">{universInfo.NomUnivers}</h1>
      <p className="UniId-text">{universInfo.descriptionUnivers}</p>

      <div className="UniId-grid">
        {CATEGORIES.map((item) => (
          <button
            key={item.key}
            className="UniId-card"
            style={{ "--thumb": `url(${images[resolveKey(item.key)] || ffimg})` }}
            onClick={() => navigate(item.to)}
            type="button"
          >
            <span className="UniId-label">{item.label}</span>
          </button>
        ))}
      </div>

      {isEditImagesOpen && (
        <ModalGeneric
          onClose={() => setIsEditImagesOpen(false)}
          handleSubmit={handleSubmitImages}
          initialData={images}
          fields={fields}
          name="univers-images-modal"
          isOpen={true}
          title="Images"
          textButtonValidate="save"
        />
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <ModalGeneric
          onClose={() => setIsDeleteModalOpen(false)}
          handleSubmit={handleDeleteUnivers}
          initialData={{}}
          fields={deleteFields}
          name="univers-delete-modal"
          isOpen={true}
          title=""
          textButtonValidate="Supprimer"
          noButtonCancel={false}
        />
      )}

      {/* Modal de modification des informations */}
      {isEditInfoOpen && (
        <ModalGeneric
          onClose={() => setIsEditInfoOpen(false)}
          handleSubmit={handleSubmitInfo}
          initialData={universInfo}
          fields={infoFields}
          name="univers-info-modal"
          isOpen={true}
          title="Modifier l'univers"
          textButtonValidate="Sauvegarder"
          noButtonCancel={false}
        />
      )}
    </div>
  );
};

export default Univers;
