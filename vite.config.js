import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@assets':     path.resolve(__dirname, 'src/assets'),
      '@store':      path.resolve(__dirname, 'src/store'),
      '@service':    path.resolve(__dirname, 'src/services'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  optimizeDeps: {
    include: [
      "@tiptap/react",
      "@tiptap/starter-kit"
    ]
  },
  build: {
    chunkSizeWarningLimit: 1000, // Augmente la limite d'avertissement à 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances lourdes
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['react-icons', 'styled-components'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-persist'],
          'utils-vendor': ['axios', 'js-cookie', 'react-masonry-css'],
        }
      }
    }
  },
  server: {
    port: 3000,
  },
});
