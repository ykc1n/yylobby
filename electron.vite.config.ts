import { resolve } from 'path'
import { defineConfig, } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  main: {
  },
  preload: {
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          debug: resolve('src/renderer/debug.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer'),
        '@/components': resolve('src/renderer/components'),
        '@/utils': resolve('src/renderer/utils')
      }
    },
    plugins: [tailwindcss(), react()]
  }
})
