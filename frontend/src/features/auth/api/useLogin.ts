import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, LoginResponse } from '@/shared/types/api';

/**
 * Login mutation hook
 */
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Store auth data in Zustand
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}
