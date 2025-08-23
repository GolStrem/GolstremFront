import React from 'react';

// Utilitaire pour charger les assets de manière dynamique
// Cela permet de réduire la taille du bundle principal

// Fonction pour charger une image de manière dynamique
export const loadImage = (imagePath) => {
  return new URL(`../assets/${imagePath}`, import.meta.url).href;
};

// Fonction pour charger un SVG de manière dynamique
export const loadSvg = (svgPath) => {
  return new URL(`../assets/${svgPath}`, import.meta.url).href;
};

// Map des assets les plus utilisés pour un accès rapide
export const commonAssets = {
  // Images principales
  avatar: () => import('../assets/avatar.png'),
  banner: () => import('../assets/banner.jpg'),
  banner1: () => import('../assets/banner1.jpg'),
  logo: () => import('../assets/logo.png'),
  
  // Icônes SVG
  checkIcon: () => import('../assets/checkIcon.svg'),
  styleModal: () => import('../assets/styleModal.svg'),
  warningModal: () => import('../assets/warningModal.svg'),
  
  // Logos Golden
  golden: () => import('../assets/golden.svg'),
  golstremV: () => import('../assets/goldstremV.svg'),
  golstremb: () => import('../assets/golstremb.svg'),
  golstremc: () => import('../assets/golstremc.svg'),
  golstremE: () => import('../assets/golstremE.svg'),
  golstremp: () => import('../assets/golstremp_1.svg'),
  golstremw: () => import('../assets/golstremw.svg'),
  
  // Images univers (dans public)
  discordimg: () => Promise.resolve({ default: '/images/univers/discordimg.png' }),
  ffimg: () => Promise.resolve({ default: '/images/univers/ffimg.png' }),
  forum: () => Promise.resolve({ default: '/images/univers/forum.png' }),
  jeux: () => Promise.resolve({ default: '/images/univers/jeux.png' }),
  plateau: () => Promise.resolve({ default: '/images/univers/plateau.png' }),
  
  // Autres assets
  raw: () => import('../assets/raw.png'),
};

// Hook pour utiliser les assets de manière optimisée
export const useAsset = (assetName) => {
  const [asset, setAsset] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const assetLoader = commonAssets[assetName];
    if (assetLoader) {
      assetLoader().then(module => {
        setAsset(module.default);
        setLoading(false);
      });
    }
  }, [assetName]);

  return { asset, loading };
};
