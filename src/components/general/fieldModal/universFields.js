/**
 * Configuration des champs pour les filtres d'univers
 * @param {Array} listTag - Liste des tags disponibles
 * @returns {Object} Configuration des champs de filtrage
 */
export const createUniversFilterFields = (listTag = [], listFriend = []) => {
  return {
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
      value: ["", ...listFriend],
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
};

/**
 * Configuration des champs pour la création d'univers
 * @param {Array} listTag - Liste des tags disponibles
 * @returns {Object} Configuration des champs de création
 */
export const createUniversCreateFields = (listTag = []) => {
  return {
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
      value: ["Public", "Sur invitation", "Priver" ],
      label: "Visibilité :",
      key: "visibiltyUnivers",
    },
    flags: {
      type: "checkBox",
      list: ["NSFW"],
      label: "",
      key: "flags",
    },
  };
};

/**
 * Configuration des champs pour la modal de suppression d'univers
 * @returns {Object} Configuration des champs de suppression
 */
export const createUniversDeleteFields = () => {
  return {
    confirmation: {
      type: "html",
      value: `
        <div style="text-align: center; padding: 20px; max-height: 300px; overflow-y: auto;">
          <h3 style="color: #ff4444; margin-bottom: 20px; font-size: 1.5rem; font-weight: 700;">
            Confirmer la suppression
          </h3>
          <p style="color: #fff; margin-bottom: 15px; font-size: 1rem; line-height: 1.5;">
            Êtes-vous sûr de vouloir supprimer cet univers ?
          </p>
          <p style="color: #ffaa00; font-weight: 600; font-size: 0.9rem;">
            ⚠️ Cette action est irréversible.
          </p>
        </div>
      `
    }
  };
};


export const createFieldConfig = (config, overrides = {}) => {
  return {
    ...config,
    ...overrides
  };
};
