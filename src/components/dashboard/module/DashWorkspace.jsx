import React, { useEffect, useState } from "react";
import { TaskApi, Socket, ApiService } from "@service";
const defaultBanner = "/images/banner.jpg";
import { BannerModal, EditableBanner } from "@components";
import "./Dash.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashWorkspace = ({ extra, id }) => {
  const { t } = useTranslation("general");
  const navigate = useNavigate();
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
        console.error(t("general.errorLoadWorkspaces"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [t]);

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
      await ApiService.updateModule(id, { extra: { ...parsedExtra, banner: newUrl } });
      setBannerUrl(newUrl);
    } catch (err) {
      console.error(t("general.errorUpdateBanner"), err);
    }
  };

  if (loading) return <div className="dash-loading">{t("general.loading")}</div>;

  return (
    <div className="dash-container">
      <EditableBanner id={id} extra={extra} title={t("general.myWorkspaces")} className="dash-work" />

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
            onClick={() => navigate(`/workspace/${ws.id}`)}
            role="button"
            aria-label={ws.name}
            title={ws.name}
          >
            <div className="dash-overlay">
              <div className="dash-info">
                <h4 className="dash-name">{ws.name}</h4>
                <p className="dash-description">{ws.description}</p>
              </div>
            </div>
            {ws.news === 1 && <p className="dash-notif">!</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashWorkspace;
