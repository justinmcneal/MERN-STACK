export const opportunityAlertEmailTemplate = (
  name: string,
  tokenSymbol: string,
  chainFrom: string,
  chainTo: string,
  netProfit: number,
  roi: number,
  priceFrom?: number,
  priceTo?: number
): { html: string; text: string } => {
  const dashboardUrl = `${process.env.CLIENT_URL!}/dashboard`;
  const opportunitiesUrl = `${process.env.CLIENT_URL!}/opportunities`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0f172a;
      color: #e2e8f0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #06b6d4;
      margin-bottom: 10px;
    }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .alert-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .opportunity-title {
      font-size: 24px;
      font-weight: bold;
      color: #f1f5f9;
      margin-bottom: 24px;
      text-align: center;
    }
    .route-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 32px;
      padding: 20px;
      background: rgba(6, 182, 212, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }
    .chain-badge {
      background: #1e293b;
      border: 1px solid #475569;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      color: #94a3b8;
    }
    .arrow {
      color: #06b6d4;
      font-size: 20px;
      font-weight: bold;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }
    .metric-card {
      background: rgba(6, 182, 212, 0.05);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .metric-label {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
    }
    .price-info {
      background: rgba(148, 163, 184, 0.05);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #cbd5e1;
    }
    .price-label {
      color: #94a3b8;
    }
    .cta-button {
      display: block;
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
      text-decoration: none;
      text-align: center;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 16px;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .secondary-link {
      display: block;
      text-align: center;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #334155;
    }
    .footer-link {
      color: #06b6d4;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .route-display {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ ArbitragePro</div>
    </div>

    <div class="card">
      <div style="text-align: center;">
        <span class="alert-badge">🔔 New Opportunity Alert</span>
      </div>

      <h1 class="opportunity-title">
        ${tokenSymbol} Arbitrage Opportunity
      </h1>

      <div class="route-display">
        <div class="chain-badge">${chainFrom}</div>
        <div class="arrow">→</div>
        <div class="chain-badge">${chainTo}</div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Net Profit</div>
          <div class="metric-value">$${netProfit.toFixed(2)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">ROI</div>
          <div class="metric-value">${roi.toFixed(1)}%</div>
        </div>
      </div>

      ${priceFrom && priceTo ? `
      <div class="price-info">
        <div class="price-row">
          <span class="price-label">${chainFrom} Price:</span>
          <span>$${priceFrom.toFixed(4)}</span>
        </div>
        <div class="price-row">
          <span class="price-label">${chainTo} Price:</span>
          <span>$${priceTo.toFixed(4)}</span>
        </div>
        <div class="price-row" style="border-top: 1px solid rgba(148, 163, 184, 0.2); margin-top: 8px; padding-top: 12px;">
          <span class="price-label">Price Difference:</span>
          <span style="color: #10b981; font-weight: 600;">+${((Math.abs(priceTo - priceFrom) / priceFrom) * 100).toFixed(2)}%</span>
        </div>
      </div>
      ` : ''}

      <a href="${opportunitiesUrl}" class="cta-button">
        View Full Opportunity →
      </a>

      <a href="${dashboardUrl}" class="secondary-link">
        Go to Dashboard
      </a>
    </div>

    <div class="footer">
      <p>
        Hi ${name}, this is an automated notification from ArbitragePro.<br/>
        You received this email because you have opportunity notifications enabled.
      </p>
      <p>
        <a href="${process.env.CLIENT_URL!}/settings" class="footer-link">Manage Notification Settings</a> |
        <a href="${process.env.CLIENT_URL!}/support" class="footer-link">Contact Support</a>
      </p>
      <p style="margin-top: 16px;">
        © ${new Date().getFullYear()} ArbitragePro. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
🔔 New Arbitrage Opportunity Alert

Hi ${name},

A new profitable arbitrage opportunity has been detected:

Token: ${tokenSymbol}
Route: ${chainFrom} → ${chainTo}

METRICS:
- Net Profit: $${netProfit.toFixed(2)}
- ROI: ${roi.toFixed(1)}%

${priceFrom && priceTo ? `
PRICES:
- ${chainFrom}: $${priceFrom.toFixed(4)}
- ${chainTo}: $${priceTo.toFixed(4)}
- Difference: +${((Math.abs(priceTo - priceFrom) / priceFrom) * 100).toFixed(2)}%
` : ''}

View this opportunity: ${opportunitiesUrl}

Dashboard: ${dashboardUrl}

---
You received this email because you have opportunity notifications enabled.
Manage settings: ${process.env.CLIENT_URL!}/settings

© ${new Date().getFullYear()} ArbitragePro
  `;

  return { html, text };
};
