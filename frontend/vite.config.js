import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Make variables and mixins available globally in all scss files
        additionalData: `
          @use "${path.resolve(__dirname, 'src/styles/_variables.scss').replace(/\\/g, '/')}" as *;
          @use "${path.resolve(__dirname, 'src/styles/_mixins.scss').replace(/\\/g, '/')}" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
})
