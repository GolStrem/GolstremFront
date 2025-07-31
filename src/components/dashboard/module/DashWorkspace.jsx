import React, { useEffect, useState } from "react";
import { TaskApi, Socket } from "@service";
import { banner } from "@assets"; // image utilisée en fond
import { DashBanner } from "@components"
import "./Dash.css";

const DashWorkspace = () => {
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
    Socket.subscribe(`user-${localStorage.getItem('id')}`);
    if (!workspaces.length) return;

    // S'abonner à tous les canaux
    workspaces.forEach(ws => {
      Socket.subscribe(`workSpaceOnly-${ws.id}`);
    });

    // Nettoyage : se désabonner de tous les canaux
    return () => {
      workspaces.forEach(ws => {
        Socket.unsubscribe(`workSpaceOnly-${ws.id}`);
      });
    };
  }, [workspaces]);
  useEffect(() => {
        console.log("✅ workspaces mis à jour :", workspaces);
      }, [workspaces]);
  useEffect(() => {
    const handleUpdateWorkspace = (data) => {
      console.log(data)
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
        // éviter les doublons si jamais on a déjà reçu ce workspace
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
      Socket.offMessage?.("updateWorkspace", handleUpdateWorkspace);
      Socket.offMessage("newWorkspace", handleNewWorkspace);
      Socket.offMessage("deleteWorkspace", handleDeleteWorkspace);
    };
  }, []);

    if (loading) return <div className="dash-loading">Chargement...</div>;

  return (
    <div className="dash-container">
      <DashBanner 
            image={banner} 
            title="Mes Workspace" 
            className="dash-work"/>

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashWorkspace;
