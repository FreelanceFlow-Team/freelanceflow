import type { InvoiceStatus } from '@freelanceflow/types';

export class InvoiceLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export class CreateInvoiceDto {
  clientId: string;
  issueDate: string;
  dueDate: string;
  lines: InvoiceLineDto[];
  taxRate?: number;
  notes?: string;
}

export class UpdateInvoiceStatusDto {
  status: InvoiceStatus;
}
