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
  server: {
    port: 3000,
  },
});
