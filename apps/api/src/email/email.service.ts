import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress = process.env.EMAIL_FROM || 'noreply@freelanceflow.app';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Si SMTP_USER n'est pas défini, on suppose que c'est un mode test (MailHog) sans authentification
    const hasAuth = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    this.logger.log(
      `EMAIL: Initializing SMTP transporter for ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}${hasAuth ? ' with auth' : ' without auth'}`,
    );

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: hasAuth
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Send invoice PDF by email to the client
   */
  async sendInvoicePdf(
    clientEmail: string,
    clientName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
    freelancerName: string,
    freelancerEmail: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `EMAIL: Preparing to send invoice ${invoiceNumber} to ${clientEmail} from ${freelancerEmail}`,
      );

      const subject = `Facture ${invoiceNumber} - FreelanceFlow`;
      const html = `
        <h2>Bonjour ${clientName},</h2>
        <p>Veuillez trouver ci-joint la facture <strong>${invoiceNumber}</strong> de <strong>${freelancerName}</strong>.</p>
        <p>Merci de votre confiance.</p>
        <hr />
        <p><em>Cet email a été généré automatiquement par FreelanceFlow</em></p>
      `;

      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        replyTo: freelancerEmail,
        to: clientEmail,
        subject,
        html,
        attachments: [
          {
            filename: `facture-${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(
        `EMAIL: Invoice ${invoiceNumber} sent successfully to ${clientEmail} (ID: ${info.messageId})`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `EMAIL: Failed to send invoice ${invoiceNumber} to ${clientEmail}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Verify the email configuration is working
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter verified successfully');
      return true;
    } catch (error) {
      this.logger.error(
        `Email verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }
}
