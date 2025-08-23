// Assets chargés de manière dynamique pour optimiser le bundle
// Seuls les assets les plus utilisés sont importés statiquement

// Assets principaux (utilisés fréquemment)
import avatar from './avatar.png';
import banner from './banner1.jpg';
import banner1 from './banner.jpg';
import logo from './logo.png';

// Composants SVG (utilisés dans l'UI)
import StyleModalIcon from './svg/StyleModalIcon';
import WarningIcon from './svg/WarningIcon';
import FondBack from './svg/FondBack';
import CheckIcon from './svg/CheckIcon';
import GoldenStremC from './svg/GoldenStremC';
import GoldenStremE from './svg/GoldenStremE';
import GoldenStremP from './svg/GoldenStremP';
import GoldenStremV from './svg/GoldenStremV';
import GoldenLogo from './svg/GoldenLogo';

// Fonctions pour charger les autres assets de manière dynamique
const loadAsset = (path) => () => import(`./${path}`);

// Assets secondaires (chargés à la demande)
export const abstrait = loadAsset('abstrait.webp');
export const checkIcon = loadAsset('checkIcon.svg');
export const Fichier4 = loadAsset('Fichier4.svg');
export const Fichier5 = loadAsset('Fichier5.png');
export const Fichier6 = loadAsset('Fichier6.png');
export const personp = loadAsset('Fichier6.png');
export const golden = loadAsset('golden.svg');
export const golstremV = loadAsset('goldstremV.svg');
export const golstremb = loadAsset('golstremb.svg');
export const golstremc = loadAsset('golstremc.svg');
export const golstremE = loadAsset('golstremE.svg');
export const golstremp = loadAsset('golstremp_1.svg');
export const golstremw = loadAsset('golstremw.svg');
export const styleModal = loadAsset('styleModal.svg');
export const warningModal = loadAsset('warningModal.svg');
export const trombone = loadAsset('icons/trombone.svg');
export const cadre = loadAsset('icons/cadre.svg');
export const raw = loadAsset('raw.png');

// Images univers (déplacées dans public/images/univers)

// Export des assets principaux (imports statiques)
export {
  avatar,
  banner,
  banner1,
  logo,
  StyleModalIcon,
  WarningIcon,
  FondBack,
  CheckIcon,
  GoldenStremC,
  GoldenStremE,
  GoldenStremP,
  GoldenStremV,
  GoldenLogo
};

// Les autres assets sont exportés comme fonctions de chargement dynamique
