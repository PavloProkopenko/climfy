import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

const plugins = [react(), tsConfigPaths()]

const createPluginArray = (plugins: PluginOption[]) => {
  return plugins as PluginOption[]
}

export default defineConfig({
  plugins: createPluginArray(plugins),
  resolve: {
    alias: {
      '@app': new URL('./src', import.meta.url).pathname,
      '@assets': new URL('./src/assets', import.meta.url).pathname,
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    open: true,
  },
})
