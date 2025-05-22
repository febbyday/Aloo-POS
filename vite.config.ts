import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@radix-ui/react-slot": path.resolve(__dirname, "./src/components/ui/slot.tsx"),
    },
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    },
    hmr: {
      overlay: true,
    },
    // Force dependency optimization
    force: true,
    // Increase timeout for dependency optimization
    optimizeDeps: {
      force: true,
      entries: ['src/main.tsx'],
    },
  },
})
