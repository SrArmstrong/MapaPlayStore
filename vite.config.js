import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-192.png', 'logo-512.png'],
      manifest: {
        name: 'Mapa UTEQ',
        short_name: 'UTEQ',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4caf50',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        permissions: ["geolocation"]
      },
      workbox: {
        navigateFallback: 'index.html',
        runtimeCaching: [{
          urlPattern: /^https:\/\/[a-z]+\.google\.com/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'google-maps',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        }]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: true,
    cors: true,
    hmr: {
      host: '0.0.0.0',
      port: 5173
    }
  }
});