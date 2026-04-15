import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@freelanceflow/types';
import { InvoicesService } from './invoices.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.findOne(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created with auto-computed totals',
  })
  async create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.create(user.sub, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoicesService.updateStatus(id, user.sub, dto);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice as PDF' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getPdf(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(id, user.sub);

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
      lines: invoice.lines.map((l) => ({
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

    const issuerName = await this.invoicesService.getIssuerName(user.sub);
    const buffer = await this.pdfService.generateInvoicePdf(pdfData, issuerName);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${invoice.number}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send invoice by email to client and mark as sent' })
  @ApiResponse({ status: 200, description: 'Email sent and status updated to sent' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be sent' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  sendInvoiceEmail(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.sendEmailAndUpdateStatus(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft invoice' })
  @ApiResponse({ status: 204, description: 'Invoice deleted' })
  @ApiResponse({
    status: 400,
    description: 'Only draft invoices can be deleted',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.remove(id, user.sub);
  }
}
