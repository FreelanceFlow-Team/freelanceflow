import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PdfModule } from './pdf/pdf.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';

function buildPinoTransports() {
  const targets: Array<{ target: string; options: Record<string, unknown>; level: string }> = [];

  // Pretty print in development
  if (process.env.NODE_ENV !== 'production') {
    targets.push({
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      level: 'debug',
    });
  }

  // Logtail transport (production + dev if token present)
  if (process.env.LOGTAIL_TOKEN) {
    targets.push({
      target: '@logtail/pino',
      options: {
        sourceToken: process.env.LOGTAIL_TOKEN,
        options: {
          endpoint: process.env.LOGTAIL_ENDPOINT || 'https://s2364879.eu-fsn-3.betterstackdata.com',
        },
      },
      level: 'info',
    });
  }

  if (targets.length === 0) {
    return undefined;
  }

  return { targets };
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: buildPinoTransports(),
        autoLogging: {
          ignore: (req: { url?: string }) => req.url === '/api/health',
        },
      },
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    ClientsModule,
    ServicesModule,
    InvoicesModule,
    PdfModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
