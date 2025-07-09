/**
 * Normalise une chaîne de caractères pour recherche insensible aux accents et aux caractères spéciaux.
 * @param {string} str
 * @returns {string}
 */
export const normalize = (str) => {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
};
