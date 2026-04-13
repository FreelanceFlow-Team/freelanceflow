import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';

// ─── Mock bcrypt (ESM namespace is not configurable — must use vi.mock) ──────

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  email: 'john@example.com',
  passwordHash: 'hashed',
  firstName: 'John',
  lastName: 'Doe',
  role: 'freelancer' as const,
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildService() {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as PrismaService;

  const jwt = {
    sign: vi.fn().mockReturnValue('token'),
  } as unknown as JwtService;

  return { service: new AuthService(prisma, jwt), prisma, jwt };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. register — success
  it('register: creates user and returns AuthResponse', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

    const { service, prisma } = buildService();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const result = await service.register({
      email: mockUser.email,
      password: 'secret',
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(result.user.email).toBe(mockUser.email);
  });

  // 2. register — ConflictException
  it('register: throws ConflictException when email already exists', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    await expect(
      service.register({
        email: mockUser.email,
        password: 'secret',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toThrow(ConflictException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  // 3. login — success
  it('login: returns AuthResponse for valid credentials', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const { service, prisma } = buildService();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await service.login({
      email: mockUser.email,
      password: 'secret',
    });

    expect(result.accessToken).toBe('token');
    expect(result.user.id).toBe(mockUser.id);
  });

  // 4. login — UnauthorizedException: user not found
  it('login: throws UnauthorizedException when user does not exist', async () => {
    const { service, prisma } = buildService();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      service.login({ email: 'unknown@example.com', password: 'secret' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // 5. login — UnauthorizedException: wrong password
  it('login: throws UnauthorizedException when password is wrong', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const { service, prisma } = buildService();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
