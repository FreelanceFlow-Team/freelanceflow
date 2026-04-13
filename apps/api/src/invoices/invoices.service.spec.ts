import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { PrismaService } from '../prisma/prisma.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockLine = {
  id: 'line-1',
  invoiceId: 'inv-1',
  description: 'Dev',
  quantity: 2,
  unitPrice: 500,
  total: 1000,
};

const mockInvoice = {
  id: 'inv-1',
  userId: 'user-1',
  clientId: 'client-1',
  number: 'FF-2026-001',
  status: 'draft' as const,
  issueDate: new Date('2026-01-01'),
  dueDate: new Date('2026-01-31'),
  subtotal: 1000,
  taxRate: 20,
  taxAmount: 200,
  total: 1200,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  client: {},
  lines: [mockLine],
};

function buildService() {
  const prisma = {
    invoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;

  return { svc: new InvoicesService(prisma), prisma };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('InvoicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. numérotation — première facture de l'année
  it('generateNumber: returns FF-YYYY-001 when no invoice exists yet', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

    const year = new Date().getFullYear();
    const number = await svc.generateNumber('user-1');

    expect(number).toBe(`FF-${year}-001`);
  });

  // 2. numérotation — incrément séquentiel
  it('generateNumber: increments sequence from last invoice number', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
      ...mockInvoice,
      number: 'FF-2026-004',
    });

    const number = await svc.generateNumber('user-1');
    expect(number).toBe('FF-2026-005');
  });

  // 3. calcul HT/TVA/TTC à la création
  it('create: computes subtotal, taxAmount and total correctly', async () => {
    const { svc, prisma } = buildService();
    // generateNumber call
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.invoice.create).mockResolvedValue(mockInvoice);

    await svc.create('user-1', {
      clientId: 'client-1',
      issueDate: '2026-01-01',
      dueDate: '2026-01-31',
      taxRate: 20,
      lines: [{ description: 'Dev', quantity: 2, unitPrice: 500 }],
    });

    const createCall = vi.mocked(prisma.invoice.create).mock.calls[0][0];
    expect(createCall.data.subtotal).toBe(1000);
    expect(createCall.data.taxAmount).toBe(200);
    expect(createCall.data.total).toBe(1200);
  });

  // 4. remove — lève BadRequestException si statut !== draft
  it('remove: throws BadRequestException when invoice is not draft', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
      ...mockInvoice,
      status: 'sent' as const,
    });

    await expect(svc.remove('inv-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.invoice.delete).not.toHaveBeenCalled();
  });
});
