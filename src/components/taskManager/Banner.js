import React, { useEffect, useState } from "react";
import banner from "@assets/banner.jpg";
import avatar1 from "@assets/avatar.png";
import avatar2 from "@assets/avatar.png";
import { TaskApi } from "@service";
import "./Banner.css";

const Banner = ({ workspaceId }) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
        setWorkspace(data);
      } catch (err) {
        console.error("Erreur lors du chargement du workspace :", err);
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  useEffect(() => {
    const handleWorkspaceUpdated = (e) => {
      if (e.detail.id === workspaceId) {
        setWorkspace((prev) => ({
          ...prev,
          ...e.detail.updatedFields,
        }));
      }
    };

    window.addEventListener("workspaceUpdated", handleWorkspaceUpdated);

    return () => {
      window.removeEventListener("workspaceUpdated", handleWorkspaceUpdated);
    };
  }, [workspaceId]);


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        transition: "all 0.3s ease",
        paddingRight: "16px",
      }}
    >
      <div
        className="tm-header-banner"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          maxWidth: "3000px",
          transition: "all 0.3s ease",
          height: "300px",
        }}
      >
        <div className="tm-banner-search">
          <input type="text" placeholder="Rechercher..." />
        </div>

        <div className="tm-banner-info">
          <h1 className="tm-banner-title">
            {loading && "Chargement..."}
            {!loading && workspace ? workspace.name : ""}
          </h1>

          {!loading && workspace?.description && (
            <p className="tm-banner-description">
              {workspace.description}
            </p>
          )}
        </div>


        <div className="tm-banner-avatars">
          <img src={avatar1} alt="avatar1" />
          <img src={avatar2} alt="avatar2" />
        </div>
      </div>
    </div>
  );
};

export default Banner;
