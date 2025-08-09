import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ApiService } from "@service";
import { setUserData } from "@store";

const UserNewPseudo = ({ onUpdate }) => {
  const { t } = useTranslation("general");
  const [user, setUser] = useState(null);
  const [pseudo, setPseudo] = useState("");
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
        setPseudo(data.pseudo || "");
      } catch {
        setError(t("general.userInfoError"));
      }
    };

    fetchUser();
  }, [t]);

  const handleSave = async () => {
    if (!pseudo.trim() || !user) return;

    setLoading(true);
    setError("");

    const responseApi = await ApiService.updateUser(user.id, { pseudo });
    if (responseApi.status === 409) {
      setError(t("general.pseudoUnavailable"));
      setLoading(false);
      return;
    }

    setEditing(false);
    setUser((prev) => ({ ...prev, pseudo }));
    onUpdate?.(pseudo);

    dispatch(setUserData({ pseudo }));
    setLoading(false);
  };

  if (!user) {
    return <div>{t("general.loadingUserInfo")}</div>;
  }

  return (
    <div className="user-new-pseudo">
      <h3>{t("general.pseudo")} :</h3>

      {!editing ? (
        <>
          <span className="user-new-pseudo-name">{pseudo}</span>
          <button
            onClick={() => setEditing(true)}
            className="user-new-pseudo-edit"
            title={t("general.edit")}
          >
            ✎
          </button>
        </>
      ) : (
        <div className="user-new-pseudo-edit-form">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
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
            className="user-new-pseudo-save"
            title={t("validate")}
          >
            {loading ? "…" : "✔"}
          </button>
          <button
            onClick={() => {
              setPseudo(user.pseudo);
              setEditing(false);
            }}
            disabled={loading}
            className="user-new-pseudo-cancel"
            title={t("close")}
          >
            ✖
          </button>
          {error && <div className="user-new-pseudo-error">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default UserNewPseudo;
