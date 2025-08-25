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
      value: ["Public", "Priver"],
      label: "Visibilité :",
      key: "visibiltyUnivers",
    },
    flagsCreate: {
      type: "checkBox",
      list: ["NSFW"],
      label: "",
      key: "flags",
    },
  };
};

/**
 * Fonction utilitaire pour créer des configurations de champs avec des valeurs par défaut
 * @param {Object} config - Configuration de base
 * @param {Object} overrides - Valeurs à remplacer
 * @returns {Object} Configuration finale
 */
export const createFieldConfig = (config, overrides = {}) => {
  return {
    ...config,
    ...overrides
  };
};
