import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtPayload } from '@freelanceflow/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

interface UploadedLogoFile {
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload du logo utilisateur' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Image (PNG, JPG, JPEG, GIF, WEBP, SVG)',
        },
      },
      required: ['logo'],
    },
  })
  @ApiResponse({ status: 200, description: 'Logo uploadé avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadLogo(@UploadedFile() file: UploadedLogoFile, @CurrentUser() user: JwtPayload) {
    if (!file) {
      throw new BadRequestException('Aucun fichier uploadé');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('La taille du fichier ne doit pas dépasser 2MB');
    }

    const logoBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return this.usersService.updateLogo(user.sub, logoBase64);
  }
}
