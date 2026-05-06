import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/sql': {
        target: 'https://administracionuser.uy',
        changeOrigin: true,
      }
    },
  },
});
