'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

const CLIENTS_KEY = ['clients'];

export function useClients(userId: string) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, userId],
    queryFn: async () => {
      return api.get<Client[]>('/clients');
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, clientId],
    queryFn: async () => {
      return api.get<Client>(`/clients/${clientId}`);
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      return api.post<Client>('/clients', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => {
      return api.patch<Client>(`/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      return api.delete(`/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEY });
    },
  });
}
