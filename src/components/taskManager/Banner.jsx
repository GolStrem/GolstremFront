import React, { useEffect, useState, useCallback } from "react";
import banner from "@assets/banner.jpg";
import { TaskApi, UserInfo, Socket } from "@service";
import { AddUserModal, BoardCardAccess, SearchBar } from "@components";
import { FaUserPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5"; // pour la croix
import avatar1 from "@assets/avatar.png";
import "./Banner.css";
import { useNavigate } from "react-router-dom";

const Banner = ({ workspaceId, onSearch }) => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [search, setSearch] = useState("");
  const [droit, setDroit] = useState(null);

 const fetchWorkspace = useCallback(async () => {
    try {
      
      const userId = await UserInfo.getId();
      const { data } = await TaskApi.getWorkspaceDetail(workspaceId);

      const computedDroit =
        String(data.idOwner) === String(userId)
          ? "owner"
          : data.user.find(user => String(user.id) === String(userId))?.state || null;

      setDroit(computedDroit);
      data.droit = computedDroit;

      setWorkspace(data);
    } catch (err) {
      console.error("Erreur lors du chargement du workspace :", err);
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  useEffect(() => {
    if (!workspace || !workspace.user.length) return;

    workspace.user.forEach(user => {
      Socket.subscribe(`user-${user.id}`);
    });

    return () => {
      workspace.user.forEach(user => {
        Socket.unsubscribe(`user-${user.id}`);
      });
    };
  }, [workspace]);
  

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
  }, [workspaceId, fetchWorkspace]);


  useEffect(() => {
    onSearch?.(search);
  }, [search, onSearch]);

  useEffect(() => {
    if (!workspaceId) return;

    const handleUpdateWorkspace = (data) => {
      if (!data || Number(data.id) !== Number(workspaceId)) return;

      setWorkspace(prev => {
        if (!prev) return prev;
        // Met à jour uniquement les champs présents dans data
        return {
          ...prev,
          name: data.name ?? prev.name,
          description: data.description ?? prev.description,
          image: data.image ?? prev.image,
        };
      });
    };

    const handleDeleteWorkSpaceUser = (data) => {
      if (!data || Number(data.idWorkSpace) !== Number(workspaceId)) return;

      const localUserId = Number(localStorage.getItem('id'));
      if (localUserId === Number(data.idUser)) {
        return navigate('/dashboard');
      }

      setWorkspace(prev => {
        return {
          ...prev,
          user: prev.user.filter(u => Number(u.id) !== Number(data.idUser))
        };
      });
    };

    const handleCreateWorkSpaceUser = (data) => {
      if (!data || Number(data.idWorkSpace) !== Number(workspaceId)) return;
      setWorkspace(prev => {
        if (prev.user.some(u => Number(u.id) === Number(data.user.id))) return prev;
        return {
          ...prev,
          user: [...prev.user, data.user]
        };
      });
    };

    const handleUpdateUserWorkSpace = (data) => {
      if (!data || Number(data.idWorkSpace) !== Number(workspaceId)) return;

      setWorkspace(prev => {
        const updatedUsers = prev.user.map(user => {
          if (Number(user.id) !== Number(data.idUser)) return user;

          return {
            ...user,
            state: (data.state === 0 ? 'read' : 'write')
          };
        });

        return {
          ...prev,
          user: updatedUsers
        };
      });
    };

    const handleUpdateUser = (data) => {
      setWorkspace(prev => ({
        ...prev,
        user: prev.user.map(user => 
          Number(user.id) === Number(data.id)
            ? { ...user, ...data.user }
            : user
        )
      }));
    };


    Socket.onMessage("updateWorkspace", handleUpdateWorkspace);
    Socket.onMessage("deleteWorkSpaceUser", handleDeleteWorkSpaceUser);
    Socket.onMessage("createWorkSpaceUser", handleCreateWorkSpaceUser);
    Socket.onMessage("updateUserWorkSpace", handleUpdateUserWorkSpace);
    Socket.onMessage("updateUser", handleUpdateUser);
    Socket.subscribe(`workSpace-${workspaceId}`);

    return () => {
      Socket.offMessage("updateWorkspace", handleUpdateWorkspace);
      Socket.offMessage("deleteWorkSpaceUser", handleDeleteWorkSpaceUser);
      Socket.offMessage("createWorkSpaceUser", handleCreateWorkSpaceUser);
      Socket.offMessage("updateUserWorkSpace", handleUpdateUserWorkSpace);
      Socket.offMessage("updateUser", handleUpdateUser);
      Socket.unsubscribe(`workSpace-${workspaceId}`);
    };
  }, [workspaceId]);

  const clearSearch = () => setSearch("");

  return (
    <div style={{ display: "flex", justifyContent: "center"}}>
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
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
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
          {(workspace?.user || []).map((user) => (
            <img
              key={user.id}
              src={user.image || avatar1}
              alt={user.pseudo || "Utilisateur"}
              title={`${user.pseudo || "Utilisateur"} (${user.state})`}
              className="tm-avatar"
            />
          ))}
          {BoardCardAccess.isOwner(droit) && (
          <button
            className="tm-add-user-btn"
            onClick={() => setShowAddUserModal(true)}
            title="Ajouter un utilisateur"
          >
            <FaUserPlus size={20} className="userplus" />
          </button>
          )}
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
