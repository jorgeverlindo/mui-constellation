import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    // Proxy API calls to a real backend when available
    proxy: {
      // Backend API (asset CRUD)
      '/api/assets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Vehicle make detection — Replicate-backed vision model
      '/api/detect-make': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // File upload
      '/api/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Anthropic API — proxied through Vite to avoid browser CORS restrictions.
      // The x-api-key header is forwarded as-is from the client.
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
      // Image proxy — serves Unsplash CDN photos as same-origin to avoid ORB blocking.
      '/api/img': {
        target: 'https://images.unsplash.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/img/, ''),
      },
    },
  },
});
