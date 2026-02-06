import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collect (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
