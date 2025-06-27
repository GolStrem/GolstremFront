import React from "react";
import banner from "@assets/banner.jpg";
import avatar1 from "@assets/avatar.png";
import avatar2 from "@assets/avatar.png";

const Banner = ({ workspaceId }) => {
  return (
    <div className="tm-header-banner" style={{ backgroundImage: `url(${banner})` }}>
      <div className="tm-banner-search">
        <input type="text" placeholder="Rechercher..." />
      </div>
      <h1 className="tm-banner-title">{workspaceId}</h1>
      <div className="tm-banner-avatars">
        <img src={avatar1} alt="avatar1" />
        <img src={avatar2} alt="avatar2" />
      </div>
    </div>
  );
};

export default Banner;
