import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import avatarPlaceholder from "@assets/avatar.png";
import { ApiService } from "@service";
import { setUserData } from "@store";

const UserNewAvatar = ({ onUpdate }) => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await ApiService.getUser();

        if (!data || !data.id) {
          throw new Error("Utilisateur non trouvé");
        }

        setUser(data);
        setImage(data.image || "");
      } catch (err) {
        setError("Impossible de récupérer vos informations.");
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!image.trim() || !user) return;

    setLoading(true);
    setError("");

    try {
      await ApiService.updateUser(user.id, { image });
      setEditing(false);
      setUser((prev) => ({ ...prev, image }));
      onUpdate?.(image);

      dispatch(setUserData({avatar: image}));
    } catch (err) {
      setError("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="user-settings-error">{error}</div>;
  }

  if (!user) {
    return <div>Chargement des informations utilisateur…</div>;
  }

  return (
    <div className="user-settings-section">
      <img
        src={user.image || avatarPlaceholder}
        alt="Avatar"
        className="user-settings-img"
      />

      {!editing ? (
        <>
          <button
            onClick={() => setEditing(true)}
            className="user-settings-edit"
          >
            ✎
          </button>
        </>
      ) : (
        <div className="user-settings-edit-form">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="user-settings-save"
          >
            {loading ? "…" : "✔"}
          </button>
          <button
            onClick={() => {
              setImage(user.image);
              setEditing(false);
            }}
            disabled={loading}
            className="user-settings-cancel"
          >
            ✖
          </button>
        </div>
      )}

      {error && <div className="user-settings-error">{error}</div>}
    </div>
  );
};

export default UserNewAvatar;
