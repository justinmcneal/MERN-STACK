// services/EmailService.ts
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    console.log('📧 [EmailService] Initializing email transporter...');
    console.log('📧 [EmailService] NODE_ENV:', process.env.NODE_ENV);
    
    if (!this.transporter) {
      // For development, use Ethereal Email (fake SMTP)
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [EmailService] Using Ethereal Email for development');
        try {
          const testAccount = await nodemailer.createTestAccount();
          console.log('📧 [EmailService] Ethereal test account created:', {
            user: testAccount.user,
            pass: testAccount.pass ? '***hidden***' : 'NOT_SET'
          });
          
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          
          // Test the connection
          await this.transporter.verify();
          console.log('📧 [EmailService] Ethereal transporter verified successfully');
        } catch (error) {
          console.error('📧 [EmailService] Failed to create Ethereal transporter:', error);
          throw error;
        }
      } else if (process.env.NODE_ENV === 'test') {
        console.log('📧 [EmailService] Using JSON transport for tests');
        // For tests, use a noop transport that logs to memory
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      } else {
        console.log('📧 [EmailService] Using production SMTP configuration');
        console.log('📧 [EmailService] Email config:', {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || '587',
          secure: process.env.EMAIL_SECURE === 'true',
          user: process.env.EMAIL_USER ? '***hidden***' : 'NOT_SET',
          pass: process.env.EMAIL_PASS ? '***hidden***' : 'NOT_SET',
          from: process.env.EMAIL_FROM || 'noreply@arbitrader.com'
        });
        
        // For production, use real SMTP
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        
        try {
          await this.transporter.verify();
          console.log('📧 [EmailService] Production SMTP transporter verified successfully');
        } catch (error) {
          console.error('📧 [EmailService] Failed to verify production SMTP:', error);
          throw error;
        }
      }
    }
    return this.transporter;
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    console.log('📧 [EmailService] Attempting to send email...');
    console.log('📧 [EmailService] Email options:', {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!options.text
    });
    
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@arbitrader.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log('📧 [EmailService] Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await transporter.sendMail(mailOptions);
      
      console.log('📧 [EmailService] Email sent successfully!');
      console.log('📧 [EmailService] Message ID:', info.messageId);
      
      // In development, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 [EmailService] Preview URL:', previewUrl);
        if (previewUrl) {
          console.log('📧 [EmailService] ⚠️  This is a test email. Click the preview URL to view it in your browser.');
        }
      }
    } catch (error) {
      console.error('📧 [EmailService] Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ArbiTrader Pro</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ArbiTrader Pro!</h1>
              <p>Please verify your email address</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with ArbiTrader Pro! To complete your registration and start monitoring arbitrage opportunities, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with ArbiTrader Pro, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 ArbiTrader Pro. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to ArbiTrader Pro!
      
      Hi ${name},
      
      Thank you for registering with ArbiTrader Pro! To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with ArbiTrader Pro, you can safely ignore this email.
      
      © 2024 ArbiTrader Pro. All rights reserved.
    `;

    console.log('📧 [EmailService] Calling sendEmail with verification details...');
    
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - ArbiTrader Pro',
      html,
      text,
    });
    
    console.log('📧 [EmailService] Verification email process completed successfully!');
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - ArbiTrader Pro</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>ArbiTrader Pro</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password for your ArbiTrader Pro account. Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              
              <p><strong>This reset link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© 2024 ArbiTrader Pro. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - ArbiTrader Pro',
      html,
    });
  }
}
