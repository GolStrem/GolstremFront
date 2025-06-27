import React from "react";
import banner from "@assets/banner.jpg";
import avatar1 from "@assets/avatar.png";
import avatar2 from "@assets/avatar.png";

const Banner = ({ workspaceId, sidebarVisible }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        transition: "all 0.3s ease",
        paddingRight: "16px", // ✅ marge droite
        paddingLeft: sidebarVisible ? "300px" : "0", // ✅ marge gauche quand sidebar visible
      }}
    >
      <div
        className="tm-header-banner"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          maxWidth: "3000px", // optionnel pour limiter sur grand écran
          transition: "all 0.3s ease",
          height:'300px'
        }}
      >
        <div className="tm-banner-search">
          <input type="text" placeholder="Rechercher..." />
        </div>
        <h1 className="tm-banner-title">{workspaceId}</h1>
        <div className="tm-banner-avatars">
          <img src={avatar1} alt="avatar1" />
          <img src={avatar2} alt="avatar2" />
        </div>
      </div>
    </div>
  );
};

export default Banner;
