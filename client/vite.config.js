import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    // Backend CORS only allows http://localhost:5173,
    // so if this port is busy we fail instead of silently moving to 5174
    port: 5173,
    strictPort: true,
  },
})
