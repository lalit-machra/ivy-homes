import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': { target: 'https://solve.ivy.homes', changeOrigin: true },
      '/v1': { target: 'https://solve.ivy.homes', changeOrigin: true },
      '/health': { target: 'https://solve.ivy.homes', changeOrigin: true },
    },
  },
})
