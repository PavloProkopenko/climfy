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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'cmdk',
            'sonner',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: Number(process.env.REACT_APP_PORT) || 3000,
    open: true,
  },
})
