import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    console.log('📧 [EmailService] Initializing email transporter...');
    console.log('📧 [EmailService] NODE_ENV:', process.env.NODE_ENV);
    
    if (!this.transporter) {
      const envUserRaw = process.env.EMAIL_USER || '';
      const envPassRaw = process.env.EMAIL_PASS || '';
      const emailUser = envUserRaw.trim();
      const emailPass = envPassRaw.replace(/\s+/g, '');

      const hasEmailConfig = !!emailUser && !!emailPass;

      if (hasEmailConfig) {
        console.log('📧 [EmailService] Using configured SMTP for email sending');
        console.log('📧 [EmailService] Email config:', {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || '587',
          secure: (process.env.EMAIL_SECURE || 'false') === 'true',
          user: emailUser ? '***hidden***' : 'NOT_SET',
          pass: envPassRaw ? (envPassRaw.includes(' ') ? '***hidden (contains spaces)***' : '***hidden***') : 'NOT_SET',
          from: process.env.EMAIL_FROM || emailUser || 'noreply@arbitrage.com'
        });

        if (envPassRaw && /\s/.test(envPassRaw)) {
          console.warn('📧 [EmailService] EMAIL_PASS contains whitespace. Removing whitespace before using it. If this is an app password, ensure you copied it correctly (no spaces).');
        }

        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: (process.env.EMAIL_SECURE || 'false') === 'true',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });
        
        try {
          await this.transporter.verify();
          console.log('📧 [EmailService] SMTP transporter verified successfully');
        } catch (error: any) {
          console.error('📧 [EmailService] Failed to verify SMTP:');
          console.error('  message:', error && error.message ? error.message : error);
          if (error && error.response) console.error('  response:', error.response);
          if (error && error.responseCode) console.error('  responseCode:', error.responseCode);
          if (error && error.code) console.error('  code:', error.code);
          if (error && error.stack) console.error('  stack:', error.stack);
          throw error;
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log('📧 [EmailService] No email config found, using Ethereal Email for development');
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
          
          await this.transporter.verify();
          console.log('📧 [EmailService] Ethereal transporter verified successfully');
        } catch (error: any) {
          console.error('📧 [EmailService] Failed to create Ethereal transporter:');
          console.error('  message:', error && error.message ? error.message : error);
          if (error && error.response) console.error('  response:', error.response);
          if (error && error.responseCode) console.error('  responseCode:', error.responseCode);
          if (error && error.code) console.error('  code:', error.code);
          if (error && error.stack) console.error('  stack:', error.stack);
          throw error;
        }
      } else if (process.env.NODE_ENV === 'test') {
        console.log('📧 [EmailService] Using JSON transport for tests');
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      } else {
        console.log('📧 [EmailService] No email configuration found - email sending disabled');
        throw new Error('Email configuration is required but not found');
      }
    }
    return this.transporter;
  }

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
        from: process.env.EMAIL_FROM || 'noreply@arbitrage.com',
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
      
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('📧 [EmailService] Preview URL:', previewUrl);
        if (previewUrl) {
          console.log('📧 [EmailService] ⚠️  This is a test email. Click the preview URL to view it in your browser.');
        }
      }
    } catch (error: any) {
      console.error('📧 [EmailService] Email sending failed:');
      console.error('  message:', error && error.message ? error.message : error);
      if (error && error.response) console.error('  response:', error.response);
      if (error && error.responseCode) console.error('  responseCode:', error.responseCode);
      if (error && error.rejected) console.error('  rejected:', error.rejected);
      if (error && error.accepted) console.error('  accepted:', error.accepted);
      if (error && error.code) console.error('  code:', error.code);
      if (error && error.stack) console.error('  stack:', error.stack);
      throw new Error('Failed to send email');
    }
  }

  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Arbitrage Pro</title>
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
              <h1>Welcome to Arbitrage Pro!</h1>
              <p>Please verify your email address</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with Arbitrage Pro! To complete your registration and start monitoring arbitrage opportunities, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with Arbitrage Pro, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Arbitrage Pro. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to Arbitrage Pro!
      
      Hi ${name},

      Thank you for registering with Arbitrage Pro! To complete your registration, please verify your email address by visiting this link:

      ${verificationUrl}
      
      This verification link will expire in 24 hours.

      If you didn't create an account with Arbitrage Pro, you can safely ignore this email.

      © 2024 Arbitrage Pro. All rights reserved.
    `;

    console.log('📧 [EmailService] Calling sendEmail with verification details...');
    
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Arbitrage Pro',
      html,
      text,
    });
    
    console.log('📧 [EmailService] Verification email process completed successfully!');
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Arbitrage Pro</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
            .button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Arbitrage Pro</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Trading Platform</p>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
              <p>Hello ${name},</p>
              <p>We received a request to reset your password for your Arbitrage Pro account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
              
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </div>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              <p>Best regards,<br>The Arbitrage Pro Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}. If you didn't request this, please ignore it.</p>
              <p>&copy; 2024 Arbitrage Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Ticket Confirmation - Arbitrage Pro</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
            .ticket-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .priority-low { background: #dcfce7; color: #166534; }
            .priority-medium { background: #fef3c7; color: #92400e; }
            .priority-high { background: #fecaca; color: #991b1b; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Arbitrage Pro</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Trading Platform</p>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">Support Ticket Received</h2>
              <p>Hello ${name},</p>
              <p>Thank you for contacting Arbitrage Pro support. We have received your request and will get back to you within 2 hours.</p>
              
              <div class="ticket-info">
                <h3 style="margin-top: 0; color: #1e293b;">Ticket Details</h3>
                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Priority:</strong> <span class="priority priority-${priorityLevel.toLowerCase()}">${priorityLevel}</span></p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Our support team will review your request and respond via email. For urgent matters, please contact us directly.</p>

              <p>Best regards,<br>The Arbitrage Pro Support Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email} regarding ticket ${ticketId}.</p>
              <p>&copy; 2024 Arbitrage Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@arbitragepro.com';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Support Ticket - ${ticketId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
            .ticket-info { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .message-box { background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #06b6d4; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .priority-low { background: #dcfce7; color: #166534; }
            .priority-medium { background: #fef3c7; color: #92400e; }
            .priority-high { background: #fecaca; color: #991b1b; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Support Ticket</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Arbitrage Pro Support</p>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">Ticket #${ticketId}</h2>
              
              <div class="ticket-info">
                <h3 style="margin-top: 0; color: #1e293b;">Customer Information</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
                <p><strong>Priority:</strong> <span class="priority priority-${priorityLevel.toLowerCase()}">${priorityLevel}</span></p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="message-box">
                <h3 style="margin-top: 0; color: #1e293b;">Message</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="margin-top: 15px; white-space: pre-wrap;">${message}</div>
              </div>
              
              <p><strong>Action Required:</strong> Please respond to this ticket within 2 hours as per our SLA.</p>
            </div>
            <div class="footer">
              <p>This notification was generated automatically for ticket ${ticketId}.</p>
              <p>&copy; 2024 Arbitrage Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: supportEmail,
      subject: `[${priorityLevel.toUpperCase()}] New Support Ticket - ${ticketId}`,
      html,
    });
  }
}
