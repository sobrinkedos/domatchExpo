import { QueryClient } from '@tanstack/react-query'

export type { QueryClient }
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 horas
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
      networkMode: 'always' // Permite queries mesmo offline
    }
  }
})
