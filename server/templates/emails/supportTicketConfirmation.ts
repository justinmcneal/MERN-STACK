export const supportTicketConfirmationTemplate = (
  name: string,
  email: string,
  ticketId: string,
  subject: string,
  priorityLevel: string
): string => {
  return `
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
};
