import React from "react";
import { EditableBanner } from "@components";
import "./Dash.css";

const DashUnivers = ({ extra, id }) => {

  return (
      <div className="dash-container">
          <EditableBanner
            id={id}
            extra={extra}
            title="Mes Univers"
            className="dash-banev"
          />
    
        </div>
  );
};

export default DashUnivers;