import React, { useEffect, useState } from "react";
import banner from "@assets/banner.jpg";
import { TaskApi } from "@service";
import { AddUserModal } from "@components";
import { FaUserPlus } from "react-icons/fa";
import avatar1 from "@assets/avatar.png";
import "./Banner.css";

const Banner = ({ workspaceId, onSearch }) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchWorkspace = async () => {
    try {
      const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
      const users = data.user || [];
      setWorkspace({ ...data, users });
    } catch (err) {
      console.error("Erreur lors du chargement du workspace :", err);
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    const handleWorkspaceUpdated = (e) => {
      if (e.detail.id === workspaceId) {
        fetchWorkspace();
      }
    };

    window.addEventListener("workspaceUpdated", handleWorkspaceUpdated);

    return () => {
      window.removeEventListener("workspaceUpdated", handleWorkspaceUpdated);
    };
  }, [workspaceId]);

  useEffect(() => {
    onSearch?.(search);
  }, [search, onSearch]);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingRight: "16px" }}>
      <div
        className="tm-header-banner"
        style={{
          backgroundImage: `url(${workspace?.image || banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          maxWidth: "3000px",
          height: "300px",
        }}
      >
        <div className="tm-banner-search">
          <input
            type="text"
            placeholder="Rechercher dans tableaux et cartes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tm-banner-info">
          <h1 className="tm-banner-title">
            {loading ? "Chargement..." : workspace?.name || ""}
          </h1>

          {!loading && workspace?.description && (
            <p className="tm-banner-description">{workspace.description}</p>
          )}
        </div>

        <div className="tm-banner-avatars">
          {(workspace?.users || []).map((user) => (
            <img
              key={user.id}
              src={user.image || avatar1}
              alt={user.pseudo || "Utilisateur"}
              title={`${user.pseudo || "Utilisateur"} (${user.state})`}
              className="tm-avatar"
            />
          ))}
          <button
            className="tm-add-user-btn"
            onClick={() => setShowAddUserModal(true)}
            title="Ajouter un utilisateur"
          >
            <FaUserPlus size={20} className="userplus" />
          </button>
        </div>
      </div>

      {showAddUserModal && (
        <AddUserModal
          workspaceId={workspaceId}
          onClose={() => {
            setShowAddUserModal(false);
            fetchWorkspace();
          }}
        />
      )}
    </div>
  );
};

export default Banner;
