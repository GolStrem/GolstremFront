import React, { useState, useEffect, useRef } from "react";
import { FicheNav } from "@components"; 
import "../../../pages/fiche/CreateFiche.css";
import "./FicheCard.css"
import { useTranslation } from "react-i18next";


const FicheCardGallery = ({ activeTab, indexModule, setActiveTab, data, onEdit, setPreviewSrc }) => {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const prevDataRef = useRef(null);
  const prevItemsCountRef = useRef(0);

  const loadGalleryData = () => {
    setLoading(true);
    
    try {
      const extraData = data.module?.[indexModule]?.extra || {};
      
      // Récupérer tous les inputText et inputUrl
      const textKeys = Object.keys(extraData).filter(key => key.startsWith('inputText'));
      const urlKeys = Object.keys(extraData).filter(key => key.startsWith('inputUrl'));
      
      // Créer un tableau d'objets avec titre et image
      const items = [];
      
      textKeys.forEach(textKey => {
        const index = textKey.replace('inputText', '');
        const urlKey = `inputUrl${index}`;
        
        if (extraData[textKey] && extraData[urlKey]) {
          items.push({
            id: index,
            title: extraData[textKey],
            imageUrl: extraData[urlKey]
          });
        }
      });
      
      // Trier par index numérique
      items.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      setGalleryItems(items);
      
      // Mettre à jour le compteur d'éléments précédents
      prevItemsCountRef.current = items.length;
      
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    } finally {
      setLoading(false);
    }
  };

  // Détection des changements avec comparaison plus fine
  useEffect(() => {
    const extraData = data.module?.[indexModule]?.extra || {};
    
    // Créer une signature des données actuelles
    const currentSignature = JSON.stringify(extraData);
    
    // Vérifier si les données ont changé
    if (prevDataRef.current !== currentSignature) {
      prevDataRef.current = currentSignature;
      loadGalleryData();
    }
  }, [data, indexModule]);

  // Charger les données initiales
  useEffect(() => {
    loadGalleryData();
  }, []);

  // Vérification périodique plus fréquente
  useEffect(() => {
    const interval = setInterval(() => {
      const extraData = data.module?.[indexModule]?.extra || {};
      const currentSignature = JSON.stringify(extraData);
      
      if (prevDataRef.current !== currentSignature) {
        prevDataRef.current = currentSignature;
        loadGalleryData();
      }
    }, 500); // Vérifier toutes les 500ms

    return () => clearInterval(interval);
  }, [data, indexModule]);

  // Écouter les changements de données en temps réel
  useEffect(() => {
    const handleDataChange = () => {
      const extraData = data.module?.[indexModule]?.extra || {};
      const currentSignature = JSON.stringify(extraData);
      
      if (prevDataRef.current !== currentSignature) {
        prevDataRef.current = currentSignature;
        loadGalleryData();
      }
    };

    // Vérifier immédiatement
    handleDataChange();

    // Écouter les changements de données
    const observer = new MutationObserver(handleDataChange);
    
    // Observer les changements dans le DOM
    const targetNode = document.querySelector('.cf-content');
    if (targetNode) {
      observer.observe(targetNode, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['data-*']
      });
    }

    return () => observer.disconnect();
  }, [data, indexModule]);

  if (loading) {
    return (
      <div className="cf-content">
        <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '18px',
          color: 'var(--color-text-secondary)'
        }}>
          {t("loadingGallery")}
        </div>
      </div>
    );
  }

  return (
    <div className="cf-content">
      {/* Nav synchronisée */}
      <FicheNav activeTab={activeTab} setActiveTab={setActiveTab} data={data} />
      
      <div className="gallery-container cf-text cf-imagetaille">

        {galleryItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--color-text-secondary)',
            fontSize: '16px'
          }}>
            {t("noImagesInGallery")}
          </div>
        ) : (
          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <div key={`${item.id}-${item.title}-${item.imageUrl}`} className="gallery-item">
                <div className="gallery-image-container">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="gallery-image"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPreviewSrc(item.imageUrl)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="gallery-image-error" style={{ display: 'none' }}>
                    <span>{t("imageNotFound")}</span>
                  </div>
                </div>
                <div className="gallery-title">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="cf-edit-btn" onClick={onEdit}>
        ✏️ {t("edit")}
      </button>

    </div>
  );
};

export default FicheCardGallery;
