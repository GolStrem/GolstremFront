import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import avatarPlaceholder from "@assets/avatar.png";
import { ApiService } from "@service";
import { setUserData } from "@store";

const UserNewAvatar = ({ onUpdate }) => {
  const { t } = useTranslation("general");
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
          throw new Error(t("general.userNotFound"));
        }

        setUser(data);
        setImage(data.image || "");
      } catch (err) {
        setError(t("general.userInfoError"));
      }
    };

    fetchUser();
  }, [t]);

  const handleSave = async () => {
    if (!image.trim() || !user) return;

    setLoading(true);
    setError("");

    try {
      await ApiService.updateUser(user.id, { image });
      setEditing(false);
      setUser((prev) => ({ ...prev, image }));
      onUpdate?.(image);

      dispatch(setUserData({ avatar: image }));
    } catch (err) {
      setError(t("general.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="user-settings-error">{error}</div>;
  }

  if (!user) {
    return <div>{t("general.loadingUserInfo")}</div>;
  }

  return (
    <div className="user-settings-section">
      <img
        src={user.image || avatarPlaceholder}
        alt={t("avatarAlt")}
        className="user-settings-img"
      />

      {!editing ? (
        <>
          <button
            onClick={() => setEditing(true)}
            className="user-settings-edit"
            title={t("general.edit")}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
            disabled={loading}
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="user-settings-save"
            title={t("validate")}
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
            title={t("close")}
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
