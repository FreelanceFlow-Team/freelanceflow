import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { execSync } from 'child_process';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function syncDatabase() {
  console.log('=== Syncing database schema ===');
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        timeout: 30000,
      });
      console.log('=== Database synced ===');
      return;
    } catch {
      console.log(`Database not ready (attempt ${attempt}/30), retrying in 2s...`);
      execSync('sleep 2');
    }
  }
  throw new Error('Failed to sync database after 30 attempts');
}

async function bootstrap() {
  syncDatabase();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('FreelanceFlow API')
    .setDescription("API de gestion d'activité freelance")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
}
void bootstrap();
