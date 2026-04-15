import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLogo(userId: string, logoBase64: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!logoBase64) {
      throw new BadRequestException('Logo invalide');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { logo: logoBase64 },
    });

    return { message: 'Logo uploadé avec succès' };
  }
}
