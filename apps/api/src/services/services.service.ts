import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.service.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, userId },
    });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  create(userId: string, dto: CreateServiceDto) {
    return this.prisma.service.create({ data: { ...dto, userId } });
  }

  async update(id: string, userId: string, dto: UpdateServiceDto) {
    await this.findOne(id, userId);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.service.delete({ where: { id } });
  }
}
