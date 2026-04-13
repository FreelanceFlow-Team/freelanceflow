import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

const prismaInstance = new PrismaClient();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma = prismaInstance;

  get user() {
    return this.prisma.user;
  }

  get client() {
    return this.prisma.client;
  }

  get service() {
    return this.prisma.service;
  }

  get invoice() {
    return this.prisma.invoice;
  }

  get invoiceLine() {
    return this.prisma.invoiceLine;
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
