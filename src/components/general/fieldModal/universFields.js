/**
 * Configuration des champs pour les filtres d'univers
 * @param {Array} listTag - Liste des tags disponibles
 * @param {Array} listFriend - Liste des amis disponibles
 * @param {Function} t - Fonction de traduction
 * @returns {Object} Configuration des champs de filtrage
 */
export const createUniversFilterFields = (listTag = [], listFriend = [], t) => {
  return {
    flags: {
      type: "checkBox",
      list: [
        t("fields.filter.flags.friends"),
        t("fields.filter.flags.favorites"),
        t("fields.filter.flags.nsfw")
      ],
      label: "",
      key: "flags",
    },
    tagsUnivers: {
      type: "select",
      value: ["", ...listTag], // Ajout d'une option vide en premier
      label: t("fields.filter.tags"),
      key: "selectedTagFilter",
    },
    sortScope: {
      type: "select",
      value: ["", ...listFriend],
      label: t("fields.filter.friends"),
      key: "scope",
    },
    orderBy: {
      type: "select",
      value: [
        t("fields.filter.sortOptions.new"),
        t("fields.filter.sortOptions.popularity"),
        t("fields.filter.sortOptions.members")
      ],
      label: t("fields.filter.sortBy"),
      key: "orderBy",
    },
    orderDir: {
      type: "select",
      value: [
        t("fields.filter.orderDir.desc"),
        t("fields.filter.orderDir.asc")
      ],
      label: "",
      key: "orderDir",
    },
  };
};

/**
 * Configuration des champs pour la création d'univers
 * @param {Array} listTag - Liste des tags disponibles
 * @param {Function} t - Fonction de traduction
 * @returns {Object} Configuration des champs de création
 */
export const createUniversCreateFields = (listTag = [], t) => {
  return {
    NomUnivers: { 
      type: "inputText", 
      label: t("fields.create.name")
    },
    descriptionUnivers: { 
      type: "textarea", 
      label: t("fields.create.description")
    },
    image: { 
      type: "inputUrl", 
      label: t("fields.create.image")
    },
    tagsUnivers: {
      type: "checkBox",
      list: listTag,                
      label: t("fields.create.tags"),
      key: "selectedTagFilter",
    },
    selectVisibily: {
      type: "select",
      value: [
        t("fields.create.visibilityOptions.public"),
        t("fields.create.visibilityOptions.invitation"),
        t("fields.create.visibilityOptions.private")
      ],
      label: t("fields.create.visibility"),
      key: "visibiltyUnivers",
    },    
    selectRegistre: {
      type: "select",
      value: [
        t("fields.create.registrationOptions.auto"),
        t("fields.create.registrationOptions.validation"),
        t("fields.create.registrationOptions.refuse")
      ],
      label: t("fields.create.registration"),
      key: "RegistreUnivers",
    },
    flags: {
      type: "checkBox",
      list: [t("fields.create.flags.nsfw")],
      label: "",
      key: "flags",
    },
  };
};

/**
 * Configuration des champs pour la modal de suppression d'univers
 * @param {Function} t - Fonction de traduction
 * @returns {Object} Configuration des champs de suppression
 */
export const createUniversDeleteFields = (t) => {
  return {
    confirmation: {
      type: "html",
      value: `
        <div style="text-align: center; padding: 20px; max-height: 300px; overflow-y: auto;">
          <h3 style="color: #ff4444; margin-bottom: 20px; font-size: 1.5rem; font-weight: 700;">
            ${t("fields.delete.title")}
          </h3>
          <p style="color: #fff; margin-bottom: 15px; font-size: 1rem; line-height: 1.5;">
            ${t("fields.delete.message")}
          </p>
          <p style="color: #ffaa00; font-weight: 600; font-size: 0.9rem;">
            ${t("fields.delete.warning")}
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
