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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@freelanceflow/types';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

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
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: JwtPayload) {
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
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Download invoice as PDF' })
  @ApiResponse({ status: 501, description: 'Not yet implemented' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPdf(@Param('id') id: string) {
    return { message: 'PDF generation not yet implemented' };
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
