import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  private cacheKey(userId: string) {
    return `invoices:${userId}`;
  }

  async findAll(userId: string) {
    const cached = await this.cache.get<unknown[]>(this.cacheKey(userId));
    if (cached) return cached;

    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: { client: true, lines: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(this.cacheKey(userId), invoices, 30);
    return invoices;
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

    const invoice = await this.prisma.invoice.create({
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

    await this.cache.del(this.cacheKey(userId));

    // Send invoice PDF by email to the client (non-blocking)
    this.sendInvoicePdfToClient(invoice, userId).catch(() => {
      // Error already logged in sendInvoicePdfToClient
    });

    return invoice;
  }

  /**
   * Generate invoice PDF and send it to the client by email
   */
  private async sendInvoicePdfToClient(invoice: any, userId: string): Promise<void> {
    try {
      const issuer = await this.getIssuerInfo(userId);
      const issuerName = issuer.name;
      const issuerEmail = issuer.email;

      const pdfData = {
        number: invoice.number,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: Number(invoice.subtotal),
        taxRate: Number(invoice.taxRate),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        notes: invoice.notes,
        lines: invoice.lines.map((l: any) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          total: Number(l.total),
        })),
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
          address: invoice.client.address,
          vatNumber: invoice.client.vatNumber,
        },
      };

      const pdfBuffer = await this.pdfService.generateInvoicePdf(pdfData, issuerName);

      await this.emailService.sendInvoicePdf(
        invoice.client.email,
        invoice.client.name,
        invoice.number,
        pdfBuffer,
        issuerName,
        issuerEmail,
      );
    } catch (error) {
      // Error logged in the EmailService - don't re-throw to avoid blocking invoice creation
      console.error('[InvoicesService] Failed to send invoice email:', error);
    }
  }

  /**
   * Manually send invoice email and update status to "sent"
   */
  async sendEmailAndUpdateStatus(id: string, userId: string): Promise<any> {
    // Get the invoice
    const invoice = await this.findOne(id, userId);

    // Only allow sending from draft status
    if (invoice.status !== 'draft') {
      throw new BadRequestException(
        `Can only send invoices in draft status. Current status: ${invoice.status}`,
      );
    }

    try {
      // Get issuer info
      const issuer = await this.getIssuerInfo(userId);
      const issuerName = issuer.name;
      const issuerEmail = issuer.email;

      // Generate PDF
      const pdfData = {
        number: invoice.number,
        status: 'sent', // Will be marked as sent
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: Number(invoice.subtotal),
        taxRate: Number(invoice.taxRate),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        notes: invoice.notes,
        lines: invoice.lines.map((l: any) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          total: Number(l.total),
        })),
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
          address: invoice.client.address,
          vatNumber: invoice.client.vatNumber,
        },
      };

      const pdfBuffer = await this.pdfService.generateInvoicePdf(pdfData, issuerName);

      // Send email
      await this.emailService.sendInvoicePdf(
        invoice.client.email,
        invoice.client.name,
        invoice.number,
        pdfBuffer,
        issuerName,
        issuerEmail,
      );

      // Update status to "sent"
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: { status: 'sent' },
        include: { client: true, lines: true },
      });

      await this.cache.del(this.cacheKey(userId));
      return updatedInvoice;
    } catch (error) {
      throw new BadRequestException(
        `Failed to send invoice email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateStatus(id: string, userId: string, dto: UpdateInvoiceStatusDto) {
    await this.findOne(id, userId);
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status },
      include: { client: true, lines: true },
    });
    await this.cache.del(this.cacheKey(userId));
    return invoice;
  }

  async remove(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);
    if (invoice.status !== 'draft') {
      throw new BadRequestException('Only draft invoices can be deleted');
    }
    const deleted = await this.prisma.invoice.delete({ where: { id } });
    await this.cache.del(this.cacheKey(userId));
    return deleted;
  }

  async getIssuerName(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'FreelanceFlow';
  }

  async getIssuerInfo(userId: string): Promise<{ name: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    return {
      name: user ? `${user.firstName} ${user.lastName}`.trim() : 'FreelanceFlow',
      email: user?.email || process.env.EMAIL_FROM || 'noreply@freelanceflow.app',
    };
  }

  async getUserWithLogo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        logo: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
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
