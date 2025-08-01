import React from "react";
import { EditableBanner } from "@components";
import "./Dash.css";

const DashInventaire = ({ extra,id }) => {

  return (
      <div className="dash-container">
          <EditableBanner
            id={id}
            extra={extra}
            title="Mes Inventaires"
            className="dash-banev"
          />
    
        </div>
  );
};

export default DashInventaire;