import React from "react";
import { EditableBanner } from "@components";
import "./Dash.css";


const DashFiche= ({ extra, id }) => {

  return (
      <div className="dash-container">
          <EditableBanner
            id={id}
            extra={extra}
            title="Mes Fiches"
            className="dash-banev"
          />
    
        </div>
  );
};

export default DashFiche;