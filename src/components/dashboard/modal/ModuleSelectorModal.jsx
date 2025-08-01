import React, { useState } from "react";
import { BaseModal } from "@components";
import { ApiService } from "@service";

const MODULES = [
  { label: "Workspace", name: "workspace" },
  { label: "Événements", name: "evenement" },
  { label: "Fiches", name: "fiche" },
  { label: "Inventaire", name: "inventaire" },
  { label: "Univers", name: "univers" },
  { label: "Notifications", name: "notification" },
];

const ModuleSelectorModal = ({ onCancel, onSubmit, blocks = [], setBlocks }) => {
  const [selected, setSelected] = useState(() => {
    const names = blocks.map((b) => b.name);
    return new Set(names);
  });

  const toggle = (name) => {
    const updated = new Set(selected);
    updated.has(name) ? updated.delete(name) : updated.add(name);
    setSelected(updated);
  };

  const handleValidation = async () => {
    const selectedArray = Array.from(selected);
    const currentNames = blocks.map((b) => b.name);

    const toDelete = blocks.filter((b) => !selected.has(b.name));
    const toCreate = MODULES.filter(
      (m) => selected.has(m.name) && !currentNames.includes(m.name)
    );

    let newBlocks = [...blocks];

    // Supprimer les modules décochés
    for (const block of toDelete) {
      try {
        await ApiService.deleteModule(block.id);
        newBlocks = newBlocks.filter((b) => b.id !== block.id);
      } catch (err) {
        console.error(`Erreur suppression module ${block.name} :`, err);
      }
    }

    // Créer les modules cochés mais absents
   for (const mod of toCreate) {
  try {
    const userId = localStorage.getItem("id");
    const res = await ApiService.createModule(0, userId, mod.name);

    const entries = Object.entries(res.data || {});
    if (entries.length > 0) {
      const [newId, newData] = entries[0];
      newBlocks.push({
        id: Number(newId),
        name: newData.name,
        extra: newData.extra || "{}",
        pos: newData.pos ?? newBlocks.length,
      });
    }
  } catch (err) {
    console.error(`Erreur création module ${mod.name} :`, err);
  }
}


    // Appliquer les mises à jour visuellement
    setBlocks(newBlocks);
    onSubmit(selectedArray);
  };

  return (
    <BaseModal onClose={onCancel}>
      <h3>Choisissez les modules à afficher</h3>
      <div className="module-selector">
        {MODULES.map((mod) => (
          <label key={mod.name}>
            <input
              type="checkbox"
              checked={selected.has(mod.name)}
              onChange={() => toggle(mod.name)}
            />
            {mod.label}
          </label>
        ))}
      </div>

      <div className="modal-actions">
        <button onClick={onCancel}>Annuler</button>
        <button className="tm-primary" onClick={handleValidation}>
          Valider
        </button>
      </div>
    </BaseModal>
  );
};

export default ModuleSelectorModal;
