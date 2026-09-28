import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Cache all vital assets so the app works offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'RehabForce Clinical',
        short_name: 'RehabForce',
        description: 'Sensor-Agnostic Rehabilitation and Sports-Performance Platform',
        theme_color: '#0f172a', // Tailwind slate-900 (matches sidebar)
        background_color: '#f8fafc', // Tailwind slate-50 (matches background)
        display: 'standalone',
        orientation: 'landscape', // Force iPad landscape orientation
        icons: [
          {
            src: 'rehabforce-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'rehabforce-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'rehabforce-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})