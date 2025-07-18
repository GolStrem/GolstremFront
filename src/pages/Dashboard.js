import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TaskApi, UserInfo } from "@service";
import {
  FaTasks,
  FaBook,
  FaBoxOpen,
  FaGlobe,
  FaCrown,
} from "react-icons/fa";

import "./Dashboard.css";

const Dashboard = () => {
  const [workspaceId, setWorkspaceId] = useState(null);
  const location = useLocation();

  const links = [
    {
      to: workspaceId ? `/workspace/${encodeURIComponent(workspaceId)}` : "#",
      label: "Workspace",
      icon: <FaTasks />,
      active: location.pathname.includes("/workspace"),
    },
    {
      to: "/dashboard",
      label: "Fiche",
      icon: <FaBook />,
      active: location.pathname === "/fiches",
    },
    {
      to: "/dashboard",
      label: "Inventaire",
      icon: <FaBoxOpen />,
      active: location.pathname === "/inventaire",
    },
    {
      to: "/dashboard",
      label: "Univers",
      icon: <FaGlobe />,
      active: location.pathname === "/univers",
    },
    {
      to: "/dashboard",
      label: "Maître du jeu",
      icon: <FaCrown />,
      active: location.pathname === "/maitre",
    },
  ];

  useEffect(() => {
    const initWorkspace = async () => {
      const lastWorkspace = await UserInfo.get("lastWorkspace");

      if (lastWorkspace) {
        return setWorkspaceId(lastWorkspace);
      }

      try {
        const { data } = await TaskApi.getWorkspaces();
        const workspacesArray = Object.entries(data).map(([id, ws]) => ({
          id,
          ...ws,
        }));
        if (workspacesArray.length > 0) {
          const firstId = workspacesArray[0].id;
          setWorkspaceId(firstId);
          UserInfo.set("lastWorkspace", firstId);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des workspaces :", err);
      }
    };

    initWorkspace();
  }, []);

  return (
    <div className="dashboard">
      <div className="background-blur"></div>

      <header className="dashboard-header">
        <h1>Bienvenue </h1>
        <p>Vos espaces de travail, organisés et accessibles</p>
      </header>

      <section className="workspace-section">
        <p>Contenu principal à venir…</p>
      </section>

      {/* Barre de navigation */}
      <nav className="bottom-nav">
        {links.map((link, index) => (
          <Link
            to={link.to}
            key={index}
            className={`nav-item ${link.active ? "active" : ""}`}
          >
            <div className="icon-wrapper">
              {link.icon}
            </div>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
