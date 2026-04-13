'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<AuthResponse>('/auth/login', data, {
        skipAuth: true,
      });
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<AuthResponse>('/auth/register', data, {
        skipAuth: true,
      });
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
  });
}
