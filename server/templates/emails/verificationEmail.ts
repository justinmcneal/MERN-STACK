export const verificationEmailTemplate = (name: string, verificationUrl: string): { html: string; text: string } => {
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

  return { html, text };
};
