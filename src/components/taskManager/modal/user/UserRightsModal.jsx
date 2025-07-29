import React, { useState, useEffect } from "react";
import { TaskApi } from "@service";
import { BaseModal } from "@components";
import "./UserRightsModal.css"
import { avatar } from "@assets";


const UserRightsModal = ({ workspaceId, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userStates, setUserStates] = useState([]);
  const [initialStates, setInitialStates] = useState([]);

  // Charger les utilisateurs à l'ouverture
useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
      const user = data.user.filter((user) => user.id !== data.idOwner)
      const mappedUsers = user.map(u => ({ ...u, state: u.state === "write" ? 1 : 0 }));
      setUserStates(mappedUsers);
      setInitialStates(mappedUsers);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, [workspaceId]);


  const handleChange = (userId, newState) => {
    setUserStates(prev => prev.map(u =>
      u.id === userId ? { ...u, state: newState } : u
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updates = userStates.filter((user, idx) => {
        return user.state !== initialStates[idx]?.state;
      });
      await Promise.all(
        updates.map(user =>
          TaskApi.editWorkspaceUser(workspaceId, user.id, { state: user.state })
        )
      );
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Échec de la mise à jour des droits.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal onClose={onClose} className={`tmedit`}>
      <button className="tm-close-btn" onClick={onClose}></button>

      <h3>Gérer les droits des utilisateurs</h3>

      {loading ? (
        <p>Chargement des utilisateurs...</p>
      ) : error ? (
        <p className="tm-warning-text">{error}</p>
      ) : (
        <div className="user-rights-list">
          {userStates.map(user => (
            <div key={user.id} className="tm-label user-rights-item">
              <div className="tm-label-field">
                <img src={user.image || avatar} alt={user.pseudo}/>

                <span>{user.pseudo}</span>
                <select
                  value={user.state}
                  onChange={e => handleChange(user.id, parseInt(e.target.value, 10))}
                >
                  <option value={0}>Lecteur</option>
                  <option value={1}>Editeur</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && <p className="tm-warning-text">{error}</p>}

      <div className="tm-modal-buttons">
        <button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button className="tm-cancel-btn" onClick={onClose}>Annuler</button>
      </div>
    </BaseModal>
  );
};

export default UserRightsModal;
