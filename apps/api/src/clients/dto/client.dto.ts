export class CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
}

export class UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
}
