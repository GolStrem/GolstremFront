/**
 * Vérifie si l'utilisateur a le droit d'écrire sur ce tableau.
 * @param {string} droit - Le droit actuel (par ex. "owner", "write", "read", etc.).
 * @returns {boolean} true si écriture autorisée.
 */
 function hasWriteAccess(droit) {
  return ["owner", "write"].includes(droit);
}

/**
 * Vérifie si l'utilisateur est le propriétaire du tableau.
 * @param {string} droit - Le droit actuel.
 * @returns {boolean} true si propriétaire.
 */
 function isOwner(droit) {
  return droit === "owner";
}


 const DroitAccess = {hasWriteAccess, isOwner}

export default DroitAccess;