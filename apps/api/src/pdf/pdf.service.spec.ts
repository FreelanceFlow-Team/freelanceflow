import { describe, it, expect, vi } from 'vitest';
import { PdfService } from './pdf.service';

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
  StyleSheet: { create: (s: unknown) => s },
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
}));

vi.mock('./templates/invoice.template', () => ({
  InvoiceTemplate: () => null,
}));

const mockInvoice = {
  number: 'FF-2026-001',
  status: 'draft',
  issueDate: new Date('2026-01-01'),
  dueDate: new Date('2026-01-31'),
  subtotal: 1000,
  taxRate: 20,
  taxAmount: 200,
  total: 1200,
  notes: null,
  lines: [{ description: 'Dev', quantity: 2, unitPrice: 500, total: 1000 }],
  client: {
    name: 'Acme',
    email: 'acme@example.com',
    address: null,
    vatNumber: null,
  },
};

describe('PdfService', () => {
  it('generateInvoicePdf: returns a Buffer containing PDF data', async () => {
    const service = new PdfService();
    const buffer = await service.generateInvoicePdf(mockInvoice, 'John Doe');

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
