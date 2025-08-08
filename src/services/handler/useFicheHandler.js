// @service/handler/FicheHandler.js
// Handlers **purs** (sans API) pour gérer la liste de fiches en mémoire.
// Naming uniforme: handle<Create|Edit|Delete|Move>Fiche

import { isValidImageUrl } from "@service";

export default function useFicheHandlers() {
  /**
   * Créer une fiche et la push à la fin de la liste.
   * @param {Array} fiches - liste actuelle
   * @param {Object} data  - { id, name, image, color, visibility, idOwner, createdAt, ... }
   */
  const handleCreateFiche = (fiches, data) => {
    const newFiche = {
      id: Number(data.id), // ⚠️ on suppose que l'id est fourni par l'appelant
      name: data.name?.trim() || "Sans nom",
      image: data.image || "",
      color: data.color || "#FF8C00",
      visibility:
        data.visibility === "" || data.visibility === undefined || data.visibility === null
          ? 2
          : Number(data.visibility),
      idOwner: data.idOwner ?? null,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data.extra, // si tu veux passer d'autres champs
    };

    // Optionnel: validations légères (on ne throw pas, on “corrige” au mieux)
    if (newFiche.image && !isValidImageUrl(newFiche.image)) {
      // si l’URL n’est pas valide on la vide (pur handler => pas d’erreur bloquante)
      newFiche.image = "";
    }

    return [...fiches, newFiche];
  };

  /**
   * Éditer une fiche (merge seulement les clés définies != null/undefined).
   * @param {Array} fiches
   * @param {Object} update - doit contenir au minimum { id }
   */
  const handleEditFiche = (fiches, update) => {
    const ficheId = Number(update.id);
    if (Number.isNaN(ficheId)) return fiches;

    // Nettoyage/normalisation des champs
    const safeEntries = Object.entries(update).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) {
        if (k === "visibility") acc[k] = Number(v);
        else if (k === "name") acc[k] = String(v).trim();
        else acc[k] = v;
      }
      return acc;
    }, {});

    if (safeEntries.image && !isValidImageUrl(safeEntries.image)) {
      // on ignore un image invalide (pas d’API → pas d’erreur bloquante)
      delete safeEntries.image;
    }

    // Couleur hex rapide
    if (safeEntries.color && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(safeEntries.color)) {
      delete safeEntries.color;
    }

    return fiches.map((f) => {
      if (Number(f.id) !== ficheId) return f;

      // merge “propre” en gardant des defaults
      return {
        ...{
          id: f.id,
          name: f.name || "Sans nom",
          image: f.image || "",
          color: f.color || "#FF8C00",
          visibility:
            f.visibility === "" || f.visibility === undefined || f.visibility === null
              ? 2
              : Number(f.visibility),
          idOwner: f.idOwner ?? null,
          createdAt: f.createdAt || new Date().toISOString(),
        },
        ...safeEntries,
      };
    });
  };

  /**
   * Supprimer une fiche par id.
   * @param {Array} fiches
   * @param {Object|number|string} toDelete - { id } ou id direct
   */
  const handleDeleteFiche = (fiches, toDelete) => {
    const ficheId = Number(typeof toDelete === "object" ? toDelete.id : toDelete);
    if (Number.isNaN(ficheId)) return fiches;
    return fiches.filter((f) => Number(f.id) !== ficheId);
  };

  /**
   * Déplacer une fiche d’une position à une autre (reorder).
   * @param {Array} fiches
   * @param {Object} move - { oldPos, newPos } OU { id, newPos }
   */
  const handleMoveFiche = (fiches, move) => {
    const list = [...fiches];

    // Support 1: move by indexes
    if (typeof move.oldPos === "number" && typeof move.newPos === "number") {
      const oldPos = parseInt(move.oldPos, 10);
      const newPos = parseInt(move.newPos, 10);
      if (oldPos === newPos || oldPos < 0 || newPos < 0 || oldPos >= list.length || newPos > list.length) {
        return fiches;
      }
      const [moved] = list.splice(oldPos, 1);
      list.splice(newPos, 0, moved);
      return list;
    }

    // Support 2: move by id → newPos
    if (move.id != null && typeof move.newPos === "number") {
      const id = Number(move.id);
      const newPos = parseInt(move.newPos, 10);
      const oldPos = list.findIndex((f) => Number(f.id) === id);
      if (oldPos === -1 || oldPos === newPos) return fiches;
      const [moved] = list.splice(oldPos, 1);
      list.splice(newPos, 0, moved);
      return list;
    }

    return fiches;
  };

  /**
   * Reorder à partir d’une liste [{ id, pos }, ...]
   * @param {Array} fiches
   * @param {Array<{id:number|string,pos:number}>} order
   */
  const handleBulkReorderFiche = (fiches, order) => {
    if (!Array.isArray(order) || order.length === 0) return fiches;

    const map = new Map(fiches.map((f) => [Number(f.id), f]));
    const sorted = [...order]
      .sort((a, b) => a.pos - b.pos)
      .map((entry) => map.get(Number(entry.id)))
      .filter(Boolean);

    // Si certains ids ne sont pas dans order → on les ajoute à la fin dans l’ordre initial
    if (sorted.length < fiches.length) {
      const missing = fiches.filter((f) => !order.some((o) => Number(o.id) === Number(f.id)));
      return [...sorted, ...missing];
    }

    return sorted;
  };

  return {
    handleCreateFiche,
    handleEditFiche,
    handleDeleteFiche,
    handleMoveFiche,
    handleBulkReorderFiche,
  };
}
