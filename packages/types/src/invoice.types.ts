export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  number: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  clientId: string;
  issueDate: string;
  dueDate: string;
  lines: CreateInvoiceLineDto[];
  taxRate?: number;
  notes?: string;
}

export interface UpdateInvoiceDto extends Partial<Omit<CreateInvoiceDto, 'clientId'>> {}
