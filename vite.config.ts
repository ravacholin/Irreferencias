import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.svg',
          'favicon-64x64.png',
          'apple-touch-icon.png',
        ],
        manifest: {
          name: 'Irreferencias — Archivo de Poesía',
          short_name: 'Irreferencias',
          description:
            'Lector minimalista y brutalista del archivo de poesía de irreferencias.blogspot.com.',
          lang: 'es',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0b0b0a',
          theme_color: '#0b0b0a',
          categories: ['books', 'education', 'lifestyle'],
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // La app trae los poemas empaquetados (data.json), así que precachear
          // el bundle basta para que funcione completamente sin conexión.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          clientsClaim: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
