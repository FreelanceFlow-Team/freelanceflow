import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private cacheKey(userId: string) {
    return `services:${userId}`;
  }

  async findAll(userId: string) {
    const cached = await this.cache.get<unknown[]>(this.cacheKey(userId));
    if (cached) return cached;

    const services = await this.prisma.service.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(this.cacheKey(userId), services, 60);
    return services;
  }

  async findOne(id: string, userId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, userId },
    });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async create(userId: string, dto: CreateServiceDto) {
    const service = await this.prisma.service.create({ data: { ...dto, userId } });
    await this.cache.del(this.cacheKey(userId));
    return service;
  }

  async update(id: string, userId: string, dto: UpdateServiceDto) {
    await this.findOne(id, userId);
    const service = await this.prisma.service.update({ where: { id }, data: dto });
    await this.cache.del(this.cacheKey(userId));
    return service;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    const service = await this.prisma.service.delete({ where: { id } });
    await this.cache.del(this.cacheKey(userId));
    return service;
  }
}
