import type { ServiceUnit } from '@freelanceflow/types';

export class CreateServiceDto {
  name: string;
  description?: string;
  defaultRate: number;
  unit: ServiceUnit;
}

export class UpdateServiceDto {
  name?: string;
  description?: string;
  defaultRate?: number;
  unit?: ServiceUnit;
}
