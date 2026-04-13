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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@freelanceflow/types';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all services for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of services' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.servicesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  @ApiResponse({ status: 200, description: 'Service found' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.servicesService.findOne(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created' })
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: JwtPayload) {
    return this.servicesService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({ status: 200, description: 'Service updated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.servicesService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({ status: 204, description: 'Service deleted' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.servicesService.remove(id, user.sub);
  }
}
