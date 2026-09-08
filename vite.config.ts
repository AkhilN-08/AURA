import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the app under /AURA/; Vercel serves from the root.
  base: process.env.VERCEL ? '/' : '/AURA/',
  build: {
    target: 'es2020',
  },
})
