import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { TaskApi, UserInfo, ApiService } from "@service";
import {
  FaTasks,
  FaBook,
  FaBoxOpen,
  FaGlobe,
  FaCrown,
} from "react-icons/fa";
import { BannerModal, DashboardManager, ModuleSelectorModal } from "@components";
const banner = "/images/banner.jpg";
import avatarDefault from "@assets/avatar.png";

import "./Dashboard.css";

const Dashboard = () => {
  const { t } = useTranslation("general");

  const [avatar, setAvatar] = useState(avatarDefault);
  const [pseudo, setPseudo] = useState("joueur");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [bannerDash, setBannerDash] = useState(banner);
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState(() =>
    localStorage.getItem("lastWorkspace")
  );
  const [selectedModules, setSelectedModules] = useState([
    "workspace",
    "evenement",
    "fiche",
    "inventaire",
    "univers",
    "notification",
  ]);
  const [blocks, setBlocks] = useState([]);

  const location = useLocation();

  const links = [
    {
      to: "/fiches",
      label: t("general.fiche"),
      icon: <FaBook />,
      active: location.pathname === "/fiches",
    },
    {
      to: "/univers",
      label: t("general.univers"),
      icon: <FaGlobe />,
      active: location.pathname === "/univers",
    },
    {
      to: "/create",
      label: t("general.inventaire"),
      icon: <FaBoxOpen />,
      active: location.pathname === "/inventaire",
    },
    {
      to: "/create",
      label: t("general.maitre"),
      icon: <FaCrown />,
      active: location.pathname === "/maitre",
    },
    {
      to: workspaceId ? `/workspace/${encodeURIComponent(workspaceId)}` : "#",
      label: t("general.workspace"),
      icon: <FaTasks />,
      active: location.pathname.includes("/workspace"),
    }
  ];

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { data: user } = await ApiService.getUser();
        if (user?.image) setAvatar(user.image);
        if (user?.pseudo) setPseudo(user.pseudo);
        const bannerUse = await UserInfo.get("banner");
        if (bannerUse) setBannerDash(bannerUse);
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
          const exists = workspacesArray.find((w) => w.id === localId);
          const firstId = workspacesArray[0].id;
          localStorage.setItem("lastWorkspace", exists ? localId : firstId);
          setWorkspaceId(exists ? localId : firstId);
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

      <div className="dashboard-banner">
        <img src={bannerDash} alt={t("general.bannerAlt")} className="banner-img" />

        <div className="banner-content">
          <img src={avatar} alt={t("general.avatarAlt")} className="banner-avatar" />
          <h1 className="helloPlayer">{pseudo}</h1>
        </div>

        <button
          className="lock-page-btn"
          onClick={() => {
            localStorage.setItem("locationBeforeLocked", window.location.pathname);
            navigate("/lockscreen");
          }}
          aria-label={t("general.lockScreen")}
          title={t("general.lockScreen")}
        >
          🔒
        </button>


        <button
          className="change-module-btn"
          onClick={() => setShowModuleModal(true)}
          aria-label={t("general.changeModules")}
          title={t("general.changeModules")}
        >
          …
        </button>

        <button
          className="change-banner-btn"
          onClick={() => setShowBannerModal(true)}
          aria-label={t("general.changeBanner")}
          title={t("general.changeBanner")}
        >
          ✎
        </button>

        {showBannerModal && (
          <BannerModal
            defaultBanner={banner}
            initialValue={bannerDash}
            onCancel={() => setShowBannerModal(false)}
            onSubmit={async (url) => {
              await UserInfo.set("banner", url);
              setBannerDash(url);
            }}
          />
        )}

        {showModuleModal && (
          <ModuleSelectorModal
            initialModules={selectedModules}
            onCancel={() => setShowModuleModal(false)}
            onSubmit={(modules) => {
              setSelectedModules(modules);
              setShowModuleModal(false);
            }}
            blocks={blocks}
            setBlocks={setBlocks}
          />
        )}
      </div>

      <DashboardManager blocks={blocks} setBlocks={setBlocks} />

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
