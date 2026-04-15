'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: string | number;
  unitPrice: string | number;
  total: string | number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  vatNumber?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: InvoiceClient;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotal: string | number;
  taxRate: string | number;
  taxAmount: string | number;
  total: string | number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const INVOICES_KEY = ['invoices'];

export function useInvoices(userId: string) {
  return useQuery({
    queryKey: [...INVOICES_KEY, userId],
    queryFn: async () => {
      return api.get<Invoice[]>('/invoices');
    },
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: [...INVOICES_KEY, invoiceId],
    queryFn: async () => {
      return api.get<Invoice>(`/invoices/${invoiceId}`);
    },
  });
}

export interface CreateInvoiceDto {
  clientId: string;
  issueDate: string;
  dueDate: string;
  lines: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
  taxRate?: number;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      return api.post<Invoice>('/invoices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch<Invoice>(`/invoices/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return api.delete(`/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await api.downloadPdf(`/invoices/${invoiceId}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return api.post<Invoice>(`/invoices/${invoiceId}/send-email`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
  });
}
