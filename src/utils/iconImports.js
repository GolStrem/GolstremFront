import React from 'react';

// Centralisation des imports d'icônes pour optimiser le bundle
// Import dynamique des icônes pour réduire la taille du bundle principal

// Icônes FontAwesome
export const FaIcons = {
  Sun: () => import('react-icons/fa').then(module => ({ default: module.FaSun })),
  Moon: () => import('react-icons/fa').then(module => ({ default: module.FaMoon })),
  Eye: () => import('react-icons/fa').then(module => ({ default: module.FaEye })),
  EyeSlash: () => import('react-icons/fa').then(module => ({ default: module.FaEyeSlash })),
  UserAlt: () => import('react-icons/fa').then(module => ({ default: module.FaUserAlt })),
  Plus: () => import('react-icons/fa').then(module => ({ default: module.FaPlus })),
  EllipsisV: () => import('react-icons/fa').then(module => ({ default: module.FaEllipsisV })),
  Filter: () => import('react-icons/fa').then(module => ({ default: module.FaFilter })),
  Star: () => import('react-icons/fa').then(module => ({ default: module.FaStar })),
  ArrowLeft: () => import('react-icons/fa').then(module => ({ default: module.FaArrowLeft })),
  AlignLeft: () => import('react-icons/fa').then(module => ({ default: module.FaAlignLeft })),
  ChevronDown: () => import('react-icons/fa').then(module => ({ default: module.FaChevronDown })),
  UserPlus: () => import('react-icons/fa').then(module => ({ default: module.FaUserPlus })),
  Tasks: () => import('react-icons/fa').then(module => ({ default: module.FaTasks })),
  Book: () => import('react-icons/fa').then(module => ({ default: module.FaBook })),
  BoxOpen: () => import('react-icons/fa').then(module => ({ default: module.FaBoxOpen })),
  Globe: () => import('react-icons/fa').then(module => ({ default: module.FaGlobe })),
  Crown: () => import('react-icons/fa').then(module => ({ default: module.FaCrown })),
};

// Icônes Bootstrap
export const BiIcons = {
  Copy: () => import('react-icons/bi').then(module => ({ default: module.BiCopy })),
};

// Icônes Ionicons
export const IoIcons = {
  Close: () => import('react-icons/io5').then(module => ({ default: module.IoClose })),
};

// Hook pour utiliser les icônes de manière optimisée
export const useIcon = (iconName, iconType = 'Fa') => {
  const [Icon, setIcon] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let iconMap;
    switch (iconType) {
      case 'Bi':
        iconMap = BiIcons;
        break;
      case 'Io':
        iconMap = IoIcons;
        break;
      default:
        iconMap = FaIcons;
    }

    const iconLoader = iconMap[iconName];
    if (iconLoader) {
      iconLoader().then(module => {
        setIcon(() => module.default);
        setLoading(false);
      });
    }
  }, [iconName, iconType]);

  return { Icon, loading };
};
