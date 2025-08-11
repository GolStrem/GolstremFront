import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// Si tu préfères importer statiquement : supprime HttpBackend et
// passe "resources" ici en important les JSON.

i18n
  .use(HttpBackend)          // charge /locales/{{lng}}/{{ns}}.json
  .use(LanguageDetector)     // détecte (localStorage, navigator, etc.)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    supportedLngs: ["fr", "en", "de", "it"],
    ns: ["common"],
    defaultNS: "common",
    fallbackNS: "common",   
    interpolation: {
      escapeValue: false // React échappe déjà
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"]
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
