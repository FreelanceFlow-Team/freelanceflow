'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
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
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });
}
