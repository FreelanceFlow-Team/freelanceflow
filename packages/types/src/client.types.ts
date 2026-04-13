export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}
