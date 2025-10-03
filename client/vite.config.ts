import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures environment variables are available at runtime
    'process.env': 'import.meta.env',
  },
})
