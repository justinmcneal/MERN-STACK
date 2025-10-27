export const passwordResetEmailTemplate = (name: string, email: string, resetUrl: string): string => {
  return `
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
};
