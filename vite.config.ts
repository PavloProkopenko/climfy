import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const plugins = [react(), tsConfigPaths(), tailwindcss()]

const createPluginArray = (plugins: PluginOption[]) => {
  return plugins as PluginOption[]
}

export default defineConfig({
  plugins: createPluginArray(plugins),
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: Number(process.env.REACT_APP_PORT) || 3000,
    open: true,
  },
})
