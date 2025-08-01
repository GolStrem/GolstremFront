import React from "react";
import { EditableBanner } from "@components";
import "./Dash.css";

const DashNotification = ({ extra, id }) => {

  return (
      <div className="dash-container">
          <EditableBanner
            id={id}
            extra={extra}
            title="Mes Notifications"
            className="dash-banev"
          />
    
        </div>
  );
};

export default DashNotification;