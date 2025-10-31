import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  supportTicketConfirmationTemplate,
  supportTicketNotificationTemplate,
  opportunityAlertEmailTemplate,
} from '../templates/emails';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const emailUser = process.env.EMAIL_USER!.trim();
      const emailPass = process.env.EMAIL_PASS!.replace(/\s+/g, '');

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST!,
        port: parseInt(process.env.EMAIL_PORT!),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      
      try {
        await this.transporter.verify();
        logger.success('Email transporter verified');
      } catch (error) {
        logger.error('Failed to verify email transporter');
        throw error;
      }
    }
    return this.transporter;
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM!,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.success(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      logger.error('Email sending failed');
      throw new Error('Failed to send email');
    }
  }

  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL!}/verify-email?token=${verificationToken}`;
    const { html, text } = verificationEmailTemplate(name, verificationUrl);

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Arbitrage Pro',
      html,
      text,
    });
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL!}/reset-password?token=${resetToken}`;
    const html = passwordResetEmailTemplate(name, email, resetUrl);

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Arbitrage Pro',
      html,
    });
  }

  static async sendSupportTicketConfirmation(
    email: string,
    name: string,
    ticketId: string,
    subject: string,
    priorityLevel: string
  ): Promise<void> {
    const html = supportTicketConfirmationTemplate(name, email, ticketId, subject, priorityLevel);

    await this.sendEmail({
      to: email,
      subject: `Support Ticket Confirmation - ${ticketId}`,
      html,
    });
  }

  static async sendSupportTicketNotification(
    fullName: string,
    email: string,
    phoneNumber: string,
    subject: string,
    message: string,
    priorityLevel: string,
    ticketId: string
  ): Promise<void> {
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    if (!supportEmail) {
      logger.error('SUPPORT_EMAIL, EMAIL_FROM, or EMAIL_USER not configured');
      throw new Error('Support email not configured');
    }

    const html = supportTicketNotificationTemplate(fullName, email, phoneNumber, subject, message, priorityLevel, ticketId);

    await this.sendEmail({
      to: supportEmail,
      subject: `[${priorityLevel.toUpperCase()}] New Support Ticket - ${ticketId}`,
      html,
    });
  }

  static async sendOpportunityAlert(
    email: string,
    name: string,
    tokenSymbol: string,
    chainFrom: string,
    chainTo: string,
    netProfit: number,
    roi: number,
    priceFrom?: number,
    priceTo?: number
  ): Promise<void> {
    const { html, text } = opportunityAlertEmailTemplate(
      name,
      tokenSymbol,
      chainFrom,
      chainTo,
      netProfit,
      roi,
      priceFrom,
      priceTo
    );

    await this.sendEmail({
      to: email,
      subject: `🔔 New ${tokenSymbol} Arbitrage Opportunity: $${netProfit.toFixed(2)} Profit`,
      html,
      text,
    });
  }
}
