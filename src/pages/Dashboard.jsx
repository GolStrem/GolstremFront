import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TaskApi } from "@service";
import apiService from "@service/api/ApiService";
import {
  FaTasks,
  FaBook,
  FaBoxOpen,
  FaGlobe,
  FaCrown,
} from "react-icons/fa";

import banner from "@assets/banner.jpg";
import avatarDefault from "@assets/avatar.png";

import "./Dashboard.css";

const Dashboard = () => {
  const [avatar, setAvatar] = useState(avatarDefault);
  const [pseudo, setPseudo] = useState("joueur");
  const location = useLocation();

  const [workspaceId, setWorkspaceId] = useState(() => {
    return localStorage.getItem("lastWorkspace");
  });

  const links = [
    {
      to: workspaceId ? `/workspace/${encodeURIComponent(workspaceId)}` : "#",
      label: "Workspace",
      icon: <FaTasks />,
      active: location.pathname.includes("/workspace"),
    },
    {
      to: "/fiches",
      label: "Fiche",
      icon: <FaBook />,
      active: location.pathname === "/fiches",
    },
    {
      to: "/inventaire",
      label: "Inventaire",
      icon: <FaBoxOpen />,
      active: location.pathname === "/inventaire",
    },
    {
      to: "/univers",
      label: "Univers",
      icon: <FaGlobe />,
      active: location.pathname === "/univers",
    },
    {
      to: "/maitre",
      label: "Maître du jeu",
      icon: <FaCrown />,
      active: location.pathname === "/maitre",
    },
  ];

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { data: user } = await apiService.getUser();
        if (user?.image) setAvatar(user.image);
        if (user?.pseudo) setPseudo(user.pseudo);
      } catch (err) {
        console.error("Erreur utilisateur :", err);
        setAvatar(avatarDefault);
      }

      try {
        const { data } = await TaskApi.getWorkspaces();
        const workspacesArray = Object.entries(data).map(([id, ws]) => ({
          id,
          ...ws,
        }));

        if (workspacesArray.length > 0) {
          const localId = localStorage.getItem("lastWorkspace");

          if (!localId || !workspacesArray.find(w => w.id === localId)) {
            const firstId = workspacesArray[0].id;
            localStorage.setItem("lastWorkspace", firstId);
            setWorkspaceId(firstId);
          } else {
            setWorkspaceId(localId);
          }
        }
      } catch (err) {
        console.error("Erreur workspaces :", err);
      }
    };

    initDashboard();
  }, []);


  return (
    <div className="dashboard">
      <div className="background-blur"></div>

      {/* Bannière */}
      <div className="dashboard-banner">
        <img src={banner} alt="Banner" className="banner-img" />

        <div className="banner-content">
          <img src={avatar} alt="Avatar" className="banner-avatar" />
          <h1 className="helloPlayer">{pseudo}</h1>
        </div>
      </div>


      <header className="dashboard-header">
        <p>Vos espaces de travail, organisés et accessibles</p>
      </header>

      <section className="workspace-section">
        <p>Contenu principal à venir…</p>
      </section>

      <nav className="bottom-nav">
        {links.map((link, index) => (
          <Link
            to={link.to}
            key={index}
            className={`nav-item ${link.active ? "active" : ""}`}
          >
            <div className="icon-wrapper">{link.icon}</div>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
