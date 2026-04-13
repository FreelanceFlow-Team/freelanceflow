import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import type { ServiceUnit } from '@freelanceflow/types';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  defaultRate: number;

  @IsEnum(['hour', 'day', 'flat'])
  unit: ServiceUnit;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultRate?: number;

  @IsOptional()
  @IsEnum(['hour', 'day', 'flat'])
  unit?: ServiceUnit;
}
