import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://130.61.77.93:50940',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
