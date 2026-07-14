import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0]),
  },
  plugins: [
    react(),
    VitePWA({
      // registerType: 'prompt' + injectRegister: false で virtual:pwa-register を
      // main.tsx から明示的に呼び出し、overlay表示 → skipWaiting → controllerchange
      // 待ち → reload の流れを自前で制御する（mypace方式）。
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,xml,txt}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        clientsClaim: true,
      },
      manifest: {
        name: '3 min. Calendar',
        short_name: '3 min. Cal',
        description: 'Quick & easy business calendar for Instagram',
        theme_color: '#fffbea',
        background_color: '#fffbea',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: '/icon-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  base: '/',
})
