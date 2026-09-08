import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/clock-winder/ — asset URLs need this prefix.
  base: '/clock-winder/',
  plugins: [react()],
})
