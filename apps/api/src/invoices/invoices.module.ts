import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PdfModule, EmailModule],
  providers: [InvoicesService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
