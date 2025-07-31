import React from "react";
import "./module/Dash.css";

const DashBanner = ({ image, title, className}) => {
  return (
    <div
      className={`dash-banner ${className}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      <h3 className="dash-banner-title">{title}</h3>
    </div>
  );
};

export default DashBanner;
