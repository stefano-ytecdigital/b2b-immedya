import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';

/**
 * Logout mutation hook
 */
export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    },
    onSettled: () => {
      // Clear auth regardless of API success/failure
      clearAuth();
    },
  });
}
