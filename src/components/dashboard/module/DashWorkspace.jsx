import React, { useEffect, useState } from "react";
import { TaskApi, Socket, ApiService } from "@service";
import { banner as defaultBanner } from "@assets";
import { BannerModal, EditableBanner } from "@components";
import "./Dash.css";

const DashWorkspace = ({ extra, id }) => {
  const parsedExtra = typeof extra === "string" ? JSON.parse(extra) : extra || {};

  const [bannerUrl, setBannerUrl] = useState(parsedExtra.banner || defaultBanner);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await TaskApi.getWorkspaces();
        const parsed = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setWorkspaces(parsed);
      } catch (error) {
        console.error("Erreur lors du chargement des workspaces :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    Socket.subscribe(`user-${localStorage.getItem("id")}`);
    if (!workspaces.length) return;

    workspaces.forEach(ws => {
      Socket.subscribe(`workSpaceOnly-${ws.id}`);
    });

    return () => {
      workspaces.forEach(ws => {
        Socket.unsubscribe(`workSpaceOnly-${ws.id}`);
      });
    };
  }, [workspaces]);

  useEffect(() => {
    const handleUpdateWorkspace = (data) => {
      if (!data?.id) return;

      setWorkspaces(prev =>
        prev.map(ws =>
          Number(ws.id) === Number(data.id)
            ? {
                ...ws,
                name: data.name ?? ws.name,
                image: data.image ?? ws.image,
                description: data.description ?? ws.description,
              }
            : ws
        )
      );
    };

    const handleNewWorkspace = (data) => {
      if (!data?.id) return;
      setWorkspaces(prev => {
        if (prev.some(ws => Number(ws.id) === Number(data.id))) return prev;
        return [...prev, data];
      });
    };

    const handleDeleteWorkspace = (id) => {
      if (!id) return;
      setWorkspaces(prev => prev.filter(ws => Number(ws.id) !== Number(id)));
    };

    Socket.onMessage("updateWorkspace", handleUpdateWorkspace);
    Socket.onMessage("newWorkspace", handleNewWorkspace);
    Socket.onMessage("deleteWorkspace", handleDeleteWorkspace);

    return () => {
      Socket.offMessage("updateWorkspace", handleUpdateWorkspace);
      Socket.offMessage("newWorkspace", handleNewWorkspace);
      Socket.offMessage("deleteWorkspace", handleDeleteWorkspace);
    };
  }, []);

  const handleBannerSubmit = async (newUrl) => {
    try {
      console.log({ extra: { ...parsedExtra, banner: newUrl } })
      await ApiService.updateModule(id, { extra: { ...parsedExtra, banner: newUrl } });
      setBannerUrl(newUrl);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la bannière :", err);
    }
  };

  if (loading) return <div className="dash-loading">Chargement...</div>;

  return (
    <div className="dash-container">
    <EditableBanner id={id} extra={extra} title="Mes Workspace" className="dash-work" />


      {showBannerModal && (
        <BannerModal
          defaultBanner={defaultBanner}
          initialValue={bannerUrl}
          onCancel={() => setShowBannerModal(false)}
          onSubmit={handleBannerSubmit}
        />
      )}

      <div className="dash-list">
        {workspaces.map((ws) => (
          <div
            className="dash-card"
            key={ws.id}
            style={{ backgroundImage: `url(${ws.image})` }}
          >
            <div className="dash-overlay">
              <div className="dash-info">
                <h4 className="dash-name">{ws.name}</h4>
                <p className="dash-description">{ws.description}</p>
              </div>
            </div>
            {ws.news === 1 && (
                  <p className="dash-notif">!</p>
                )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashWorkspace;
