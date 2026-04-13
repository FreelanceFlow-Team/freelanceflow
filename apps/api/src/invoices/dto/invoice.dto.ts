import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { InvoiceStatus } from '@freelanceflow/types';

export class InvoiceLineDto {
  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @IsString()
  clientId: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status: InvoiceStatus;
}
