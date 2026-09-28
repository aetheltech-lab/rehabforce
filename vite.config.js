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
      includeAssets: ['rehabforce-logo.png'], // Explicitly caches the public asset for the install prompt
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'RehabForce Clinical',
        short_name: 'RehabForce',
        description: 'Sensor-Agnostic Rehabilitation and Sports-Performance Platform',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'rehabforce-logo.png',
            sizes: '655x658',
            type: 'image/png'
          },
          {
            src: 'rehabforce-logo.png',
            sizes: '655x658',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})