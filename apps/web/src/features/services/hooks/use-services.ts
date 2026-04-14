'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export type ServiceUnit = 'hour' | 'day' | 'flat';

export interface Service {
  id: string;
  name: string;
  description?: string;
  defaultRate: number;
  unit: ServiceUnit;
  createdAt: string;
  updatedAt: string;
}

const SERVICES_KEY = ['services'];

export function useServices(userId: string) {
  return useQuery({
    queryKey: [...SERVICES_KEY, userId],
    queryFn: async () => {
      return api.get<Service[]>('/services');
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
      return api.post<Service>('/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: string) => {
      return api.delete(`/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}
