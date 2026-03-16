import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/shared/locales/i18n'
import { RouterProvider } from 'react-router'
import { routes } from './shared/resources/routes'
import { ThemeProvider } from './shared/context/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/context/auth-context'
import { Toaster } from '@/shared/components/ui/sonner'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <RouterProvider router={routes} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </StrictMode>,
)
