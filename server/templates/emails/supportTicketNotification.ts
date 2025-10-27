export const supportTicketNotificationTemplate = (
  fullName: string,
  email: string,
  phoneNumber: string,
  subject: string,
  message: string,
  priorityLevel: string,
  ticketId: string
): string => {
  return `
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
};
