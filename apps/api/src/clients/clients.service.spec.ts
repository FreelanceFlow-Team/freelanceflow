import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import type { PrismaService } from '../prisma/prisma.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockClient = {
  id: 'client-1',
  userId: 'user-1',
  name: 'Acme Corp',
  email: 'acme@example.com',
  phone: null,
  address: null,
  city: null,
  postalCode: null,
  country: null,
  vatNumber: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildService() {
  const prisma = {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;

  return { service: new ClientsService(prisma), prisma };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ClientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. findAll — returns clients for user
  it('findAll: returns all clients belonging to the user', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.client.findMany).mockResolvedValue([mockClient]);

    const result = await service.findAll('user-1');

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockClient.id);
  });

  // 2. findOne — throws NotFoundException when client does not exist
  it('findOne: throws NotFoundException when client does not exist', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.client.findFirst).mockResolvedValue(null);

    await expect(service.findOne('unknown-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  // 3. findOne — throws NotFoundException when client belongs to another user
  it('findOne: throws NotFoundException when client belongs to another user', async () => {
    const { service, prisma } = buildService();
    // findFirst with { id, userId } returns null if user doesn't own the client
    vi.mocked(prisma.client.findFirst).mockResolvedValue(null);

    await expect(service.findOne('client-1', 'other-user')).rejects.toThrow(NotFoundException);

    expect(prisma.client.findFirst).toHaveBeenCalledWith({
      where: { id: 'client-1', userId: 'other-user' },
    });
  });

  // 4. create — returns created client
  it('create: creates and returns the new client', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.client.create).mockResolvedValue(mockClient);

    const dto = { name: 'Acme Corp', email: 'acme@example.com' };
    const result = await service.create('user-1', dto);

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 'user-1' },
    });
    expect(result.name).toBe(mockClient.name);
  });

  // 5. remove — deletes client
  it('remove: deletes client when it exists and belongs to user', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.client.findFirst).mockResolvedValue(mockClient);
    vi.mocked(prisma.client.delete).mockResolvedValue(mockClient);

    await service.remove('client-1', 'user-1');

    expect(prisma.client.delete).toHaveBeenCalledWith({
      where: { id: 'client-1' },
    });
  });
});
