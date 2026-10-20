import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import styleXPlugin from '@stylexjs/babel-plugin'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            styleXPlugin,
            {
              dev: process.env.NODE_ENV !== 'production',
              runtimeInjection: true,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir,
              },
            },
          ],
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        fury: resolve(__dirname, 'fury.html'),
        documentos: resolve(__dirname, 'documentos.html'),
      },
    },
  },
})
