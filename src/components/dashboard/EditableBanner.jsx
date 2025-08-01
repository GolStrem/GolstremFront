import React, { useState } from "react";
import { ApiService } from "@service";
import { DashBanner, BannerModal } from "@components";
import { banner as defaultBanner } from "@assets";

const EditableBanner = ({ id, extra, title, className = "" }) => {
  const parsedExtra = typeof extra === "string" ? JSON.parse(extra) : extra || {};
  const [bannerUrl, setBannerUrl] = useState(parsedExtra.banner || defaultBanner);
  const [showModal, setShowModal] = useState(false);

  const handleBannerSubmit = async (newUrl) => {
    try {
      const newExtra = { ...parsedExtra, banner: newUrl };
      await ApiService.updateModule(id, { extra: newExtra });
      setBannerUrl(newUrl);
    } catch (err) {
      console.error("Erreur mise à jour bannière :", err);
    }
  };

  return (
    <div className="dash-banner-wrapper">
      <DashBanner image={bannerUrl} title={title} className={className} />
      <button
        className="change-banner-btn-mod"
        onClick={() => setShowModal(true)}
      >
        ✎
      </button>

      {showModal && (
        <BannerModal
          defaultBanner={defaultBanner}
          initialValue={bannerUrl}
          onCancel={() => setShowModal(false)}
          onSubmit={handleBannerSubmit}
        />
      )}
    </div>
  );
};

export default EditableBanner;
