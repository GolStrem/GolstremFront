// cypress.config.mjs  ← renomme ton fichier en .mjs
import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",  // URL de base
    screenshotOnRunFailure: true,      // Capture d’écran si échec
    setupNodeEvents(on, config) {
      // Events Node si besoin
      return config;
    },
  },
  env: {
    CYPRESS_EMAIL: process.env.VITE_CYPRESS_EMAIL,
    CYPRESS_PASSWORD: process.env.VITE_CYPRESS_PASSWORD,
  },
});
