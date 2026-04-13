import { Injectable } from '@nestjs/common';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { InvoiceTemplate } from './templates/invoice.template';

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  number: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  lines: InvoiceLine[];
  client: {
    name: string;
    email: string;
    address?: string | null;
    vatNumber?: string | null;
  };
}

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: InvoiceData, issuerName: string): Promise<Buffer> {
    const element = React.createElement(InvoiceTemplate, {
      invoice,
      issuerName,
    }) as any;
    const buffer = await renderToBuffer(element);
    return Buffer.from(buffer);
  }
}
