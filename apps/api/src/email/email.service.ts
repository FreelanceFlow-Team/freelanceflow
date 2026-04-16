import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('EMAIL: RESEND_API_KEY not set — emails will fail');
    }
    this.resend = new Resend(apiKey);
    this.logger.log('EMAIL: Initialized Resend API client');
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

      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        replyTo: freelancerEmail,
        to: [clientEmail],
        subject,
        html,
        attachments: [
          {
            filename: `facture-${invoiceNumber}.pdf`,
            content: pdfBuffer.toString('base64'),
          },
        ],
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `EMAIL: Invoice ${invoiceNumber} sent successfully to ${clientEmail} (ID: ${data?.id})`,
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
}
