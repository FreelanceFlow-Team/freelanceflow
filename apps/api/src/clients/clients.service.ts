import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateClientDto } from './dto/client.dto';
import { UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private cacheKey(userId: string) {
    return `clients:${userId}`;
  }

  async findAll(userId: string) {
    const cached = await this.cache.get<unknown[]>(this.cacheKey(userId));
    if (cached) return cached;

    const clients = await this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(this.cacheKey(userId), clients, 60);
    return clients;
  }

  async findOne(id: string, userId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async create(userId: string, dto: CreateClientDto) {
    const client = await this.prisma.client.create({ data: { ...dto, userId } });
    await this.cache.del(this.cacheKey(userId));
    return client;
  }

  async update(id: string, userId: string, dto: UpdateClientDto) {
    await this.findOne(id, userId);
    const client = await this.prisma.client.update({ where: { id }, data: dto });
    await this.cache.del(this.cacheKey(userId));
    return client;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    const client = await this.prisma.client.delete({ where: { id } });
    await this.cache.del(this.cacheKey(userId));
    return client;
  }
}
