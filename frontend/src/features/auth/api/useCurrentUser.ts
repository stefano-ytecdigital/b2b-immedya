import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { User } from '@/shared/types/api';

/**
 * Fetch current user query hook
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User> => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    retry: false,
  });
}
