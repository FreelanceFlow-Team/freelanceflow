import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { CacheService } from '../cache/cache.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockService = {
  id: 'service-1',
  userId: 'user-1',
  name: 'Web Development',
  description: null,
  defaultRate: 500,
  unit: 'day' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCache = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  invalidatePattern: vi.fn().mockResolvedValue(undefined),
} as unknown as CacheService;

function buildService() {
  const prisma = {
    service: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaService;

  return { svc: new ServicesService(prisma, mockCache), prisma };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ServicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. findAll — returns services for user
  it('findAll: returns all services belonging to the user', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.service.findMany).mockResolvedValue([mockService] as any);

    const result = await svc.findAll('user-1');

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toHaveLength(1);
    expect((result[0] as typeof mockService).id).toBe(mockService.id);
  });

  // 2. findOne — throws NotFoundException when not found
  it('findOne: throws NotFoundException when service does not exist', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.service.findFirst).mockResolvedValue(null);

    await expect(svc.findOne('unknown-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  // 3. create — returns created service
  it('create: creates and returns the new service', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.service.create).mockResolvedValue(mockService as any);

    const dto = {
      name: 'Web Development',
      defaultRate: 500,
      unit: 'day' as const,
    };
    const result = await svc.create('user-1', dto);

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 'user-1' },
    });
    expect(result.name).toBe(mockService.name);
  });

  // 4. remove — deletes service when it belongs to user
  it('remove: deletes service when it exists and belongs to user', async () => {
    const { svc, prisma } = buildService();
    vi.mocked(prisma.service.findFirst).mockResolvedValue(mockService as any);
    vi.mocked(prisma.service.delete).mockResolvedValue(mockService as any);

    await svc.remove('service-1', 'user-1');

    expect(prisma.service.delete).toHaveBeenCalledWith({
      where: { id: 'service-1' },
    });
  });
});
