import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      include: { client: true, lines: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { client: true, lines: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    const number = await this.generateNumber(userId);
    const taxRate = dto.taxRate ?? 0;

    const subtotal = dto.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return this.prisma.invoice.create({
      data: {
        userId,
        clientId: dto.clientId,
        number,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        taxRate,
        taxAmount,
        subtotal,
        total,
        notes: dto.notes,
        lines: {
          create: dto.lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: Math.round(l.quantity * l.unitPrice * 100) / 100,
          })),
        },
      },
      include: { client: true, lines: true },
    });
  }

  async updateStatus(id: string, userId: string, dto: UpdateInvoiceStatusDto) {
    await this.findOne(id, userId);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status },
      include: { client: true, lines: true },
    });
  }

  async remove(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);
    if (invoice.status !== 'draft') {
      throw new BadRequestException('Only draft invoices can be deleted');
    }
    return this.prisma.invoice.delete({ where: { id } });
  }

  async getIssuerName(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'FreelanceFlow';
  }

  // ─── Numérotation FF-YYYY-NNN ────────────────────────────────────────────

  async generateNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `FF-${year}-`;

    const last = await this.prisma.invoice.findFirst({
      where: { userId, number: { startsWith: prefix } },
      orderBy: { number: 'desc' },
    });

    let seq = 1;
    if (last) {
      const parts = last.number.split('-');
      seq = parseInt(parts[2], 10) + 1;
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }
}
