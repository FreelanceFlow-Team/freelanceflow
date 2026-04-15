import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class AppController {
  private readonly startedAt = new Date();

  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    const uptimeMs = Date.now() - this.startedAt.getTime();
    const uptimeSeconds = Math.floor(uptimeMs / 1000);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${uptimeSeconds}s`,
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version ?? '0.0.1',
    };
  }
}
