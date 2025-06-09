import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Add Vitest configuration
  test: {
    globals: true, // Allows using describe, it, expect, etc. without importing them
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/test/setup.js', // Optional: for global test setup (e.g., extending expect)
    css: true, // If you want to process CSS during tests (might need additional config if complex)
  },
})
