import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Config.css";
import { UserNewPseudo, UserNewAvatar } from "@components";
import { ApiService } from "@service";

import { styleModal, warningModal } from "@assets";

const Parametre = () => {
  const themeMode = useSelector((state) => state.theme.mode);

  const [email, setEmail] = useState(""); // 👈 on ajoute l'état pour l'email

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await ApiService.getUser();
        console.log("Réponse API /user :", data);

        if (data?.email) {
          setEmail(data.email);
        }
      } catch (err) {
        console.error("Erreur API /user :", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className={`parametre-page ${themeMode}`}>
      <aside className="parametre-sidebar">
        PARAMETRE
      </aside>

      <main className="parametre-main">
        <header className="parametre-header">
          {/* Barres décoratives en haut */}
          <img src={styleModal} alt="Décoratif" className="parametre-style-top" />
        </header>

        <h2 className="parametre-h2">Parametre du compte</h2>

        <section className="parametre-content">
          <div className="parametre-general">
            <UserNewAvatar
              onUpdate={(newAvatar) =>
                console.log("Avatar mis à jour :", newAvatar)
              }
            />

            <div className="parametre-rectangle"></div>

            <div className="parametre-maj">
              <UserNewPseudo
                onUpdate={(newPseudo) =>
                  console.log("Pseudo mis à jour :", newPseudo)
                }
              />
              <p className="param-g a">
                <span className="param-g-label">Adresse mail :</span>{" "}
                <span className="param-g-value">{email || "..."}</span>
              </p>
              <p className="param-g ">
                <span className="param-g-label">Mot de passe :</span>{" "}
                <span className="param-g-value">***********</span>
              </p>
            </div>
          </div>
        </section>

        {/* Barres décoratives en bas */}
        <img src={warningModal} alt="Attention" className="parametre-warning" />
        <img src={styleModal} alt="Décoratif" className="parametre-style-bottom" />
      </main>
    </div>
  );
};

export default Parametre;
