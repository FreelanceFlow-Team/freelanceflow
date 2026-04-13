export type ServiceUnit = 'hour' | 'day' | 'flat';

export interface Service {
  id: string;
  userId: string;
  name: string;
  description?: string;
  defaultRate: number;
  unit: ServiceUnit;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  defaultRate: number;
  unit: ServiceUnit;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}
