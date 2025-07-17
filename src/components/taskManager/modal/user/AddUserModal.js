import React, { useState } from "react";
import { TaskApi } from "@service";
import { ApiService } from "@service";
import "./addUserModal.css";
import { BaseModal } from "@components";

const AddUserModal = ({ workspaceId, onClose }) => {
  const [pseudo, setPseudo] = useState("");
  const [state, setState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await ApiService.getUserByPseudo(pseudo);

      if (!data || !Array.isArray(data) || !data[0]?.id) {
        setError("Utilisateur non trouvé");
        setLoading(false);
        return;
      }

      const idUser = data[0].id;

      const result = await TaskApi.addWorkspaceUser(workspaceId, [{ idUser, state }]);
      if (!result || (result.status && result.status !== 200)) {
        throw new Error("Échec côté serveur");
      }

      window.dispatchEvent(new CustomEvent("workspaceUpdated", {
        detail: { id: workspaceId, updatedFields: {} },
      }));

      setSuccess("Utilisateur ajouté avec succès.");
      setPseudo("");
      setState(0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Échec de l'ajout de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className={`tmedit`}>
      <button className="tm-close-btn" onClick={onClose}></button>
      <h2>Ajouter un utilisateur</h2>
      <label className="tm-label">Pseudo utilisateur :
        <div className="tm-label-field">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
        </div>
      </label>
      <label className="tm-label">Rôle :
        <div className="tm-label-field">
          <select
            value={state}
            onChange={(e) => setState(parseInt(e.target.value, 10))}
          >
            <option value={0}>Lecteur</option>
            <option value={1}>Editeur</option>
          </select>
        </div>
      </label>
      {error && <p className="tm-error">{error}</p>}
      {success && <p className="tm-success">{success}</p>}
      <div className="tm-modal-buttons">
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Ajout..." : "Ajouter"}
        </button>
        <button className="cancel-btn" onClick={onClose}>Annuler</button>
      </div>
    </BaseModal>
  );
};

export default AddUserModal;
