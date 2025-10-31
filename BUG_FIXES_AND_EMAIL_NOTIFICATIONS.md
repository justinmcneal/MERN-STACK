# Bug Fixes & Email Notifications Implementation

## Issues Fixed

### 1. ✅ Chart Timeframe Not Updating

**Problem:** Clicking 1h or 24h timeframe buttons showed the same chart data.

**Root Cause:** The timeframe parameter mapping had a bug:
```typescript
// BEFORE (BUGGY):
const tfParam = timeframe === '1h' ? '24h' : timeframe === '24h' ? '24h' : '7d';
// Both 1h and 24h mapped to '24h' - that's why they looked identical!

// AFTER (FIXED):
const tfParam = timeframe === '1h' ? '1h' : timeframe === '24h' ? '24h' : '7d';
```

**Files Fixed:**
- `client/src/components/dashboard/ChartComponent.tsx` (line ~56)
- `client/src/components/opportunities/OpportunitiesChart.tsx` (line ~110)

**Test:** Click different timeframe buttons (1h/24h/7d) and verify the chart updates with different data ranges.

---

### 2. ✅ Currency Not Reflecting in Opportunities Page

**Problem:** Changing currency in settings didn't update the profit display on opportunities page.

**Root Cause:** The opportunities page wasn't using the `useCurrencyFormatter` hook, so all profits were hardcoded as USD.

**Changes Made:**
1. Added `useCurrencyFormatter` hook import to `opportunities.tsx`
2. Used `formatCurrency()` function to format profit values
3. Added `formatCurrency` to the dependency array of `useMemo`

**Files Modified:**
- `client/src/pages/opportunities.tsx`
  - Line 10: Added `import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";`
  - Line 32: Added `const { formatCurrency } = useCurrencyFormatter();`
  - Line 72: Changed from `$${opp.netProfitUsd.toFixed(0)}` to `formatCurrency(opp.netProfitUsd, { minimumFractionDigits: 0, maximumFractionDigits: 0 })`
  - Line 77: Added `formatCurrency` to dependency array

**Test:** 
1. Go to Settings → change currency (e.g., EUR, GBP, PHP)
2. Navigate to Opportunities page
3. Verify profits are shown in the selected currency with correct symbol

---

### 3. ✅ Email Notification System Implemented

**Problem:** No email notifications were being sent when new opportunities were detected.

**Implementation:**

#### A. Email Template Created
- **File:** `server/templates/emails/opportunityAlertEmail.ts`
- **Features:**
  - Professional HTML email design with gradient backgrounds
  - Shows token symbol, chain route (From → To)
  - Displays net profit and ROI metrics
  - Shows price comparison and difference
  - Call-to-action buttons to view opportunity
  - Responsive design for mobile/desktop
  - Plain text alternative included

#### B. Email Service Method
- **File:** `server/services/EmailService.ts`
- **Added:** `sendOpportunityAlert()` method
- **Parameters:**
  - email, name, tokenSymbol, chainFrom, chainTo
  - netProfit, roi, priceFrom (optional), priceTo (optional)

#### C. Opportunity Scanner Integration
- **File:** `server/jobs/opportunityScanner.ts`
- **Changes:**
  1. Added `EmailService` import
  2. Added `User` model import  
  3. Updated `createOpportunityAlerts()` to:
     - Check if user has `notificationSettings.email` enabled
     - Fetch user email and name
     - Send email via `EmailService.sendOpportunityAlert()`
     - Log email sending with console message
     - Gracefully handle email failures (doesn't stop alert creation)
  4. Added `formatChainName()` helper for proper chain display

#### D. Test Endpoint Created
- **File:** `server/controllers/alertController.ts`
- **Added:** `sendTestEmailNotification()` controller
- **Route:** `POST /api/alerts/test-email` (protected)
- **What it does:**
  - Sends a sample USDC Ethereum→Polygon arbitrage email
  - Uses authenticated user's email and name
  - Returns success/failure response
  - Perfect for testing email configuration

---

## How to Test Email Notifications

### Prerequisites
Make sure your `.env` file has these configured:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="ArbitragePro <your-email@gmail.com>"
CLIENT_URL=http://localhost:5173
```

### Method 1: Test Endpoint (Quickest)

1. **Enable Email Notifications in Settings:**
   - Go to Settings page
   - Under "Notification Settings", toggle ON "Email Notifications"
   - Click "Update Preferences"

2. **Send Test Email via API:**
   ```bash
   # Using curl (replace YOUR_TOKEN with your auth token)
   curl -X POST http://localhost:5000/api/alerts/test-email \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Or use Postman/Insomnia:
   # POST http://localhost:5000/api/alerts/test-email
   # Headers: Authorization: Bearer YOUR_TOKEN
   ```

3. **Check Your Email:**
   - Look for subject: "🔔 New USDC Arbitrage Opportunity: $125.50 Profit"
   - Should arrive within 30 seconds

### Method 2: Wait for Real Opportunities

1. **Enable Notifications:**
   - Settings → Enable "Email Notifications"
   - Settings → Enable "Dashboard Notifications"
   - Adjust alert thresholds if needed

2. **Wait for Opportunity Scanner:**
   - Scanner runs every hour automatically
   - Or manually trigger: Run the scanner job
   - When new profitable opportunity is found that meets your thresholds, you'll receive:
     - In-app alert (bell icon)
     - Email notification (to your registered email)

### Method 3: Create Test Opportunity Manually

Run this in your MongoDB/terminal to trigger email:
```javascript
// Create a test opportunity that triggers alerts
// This requires access to the database
```

---

## Email Notification Flow

```
1. Opportunity Scanner Detects New Opportunity
   ↓
2. Check Users with Dashboard Notifications Enabled
   ↓
3. For Each User:
   a. Check if opportunity meets user's thresholds
   b. Create in-app Alert
   c. IF user.notificationSettings.email === true:
      - Fetch user email and name
      - Send email via EmailService
      - Log success/failure
   ↓
4. Continue to Next User (failures don't stop processing)
```

---

## Email Template Preview

The email includes:
- **Header:** ArbitragePro logo
- **Alert Badge:** "🔔 New Opportunity Alert"
- **Title:** Token symbol (e.g., "USDC Arbitrage Opportunity")
- **Route Display:** Visual chain route (Ethereum → Polygon)
- **Metrics Cards:** Net Profit ($XXX.XX) and ROI (XX.X%)
- **Price Comparison:** Shows prices on both chains + difference %
- **CTA Button:** "View Full Opportunity" → Links to opportunities page
- **Secondary Link:** "Go to Dashboard"
- **Footer:** User name, settings link, support link, copyright

**Styling:**
- Dark theme matching the app (slate/cyan colors)
- Gradient backgrounds
- Mobile responsive
- Professional look

---

## Troubleshooting

### Email Not Sending?

1. **Check Email Settings:**
   ```bash
   # Verify .env has correct SMTP settings
   cat .env | grep EMAIL
   ```

2. **Check User Has Email:**
   - User must have verified email address
   - Check `notificationSettings.email` is `true` in UserPreference

3. **Check Server Logs:**
   ```bash
   # Look for these messages:
   # ✅ "Email transporter verified"
   # ✅ "Email sent to user@example.com: <messageId>"
   # ❌ "Failed to send opportunity email: [error]"
   ```

4. **Gmail App Password:**
   - If using Gmail, you need an "App Password", not your regular password
   - Go to: Google Account → Security → 2-Step Verification → App Passwords

5. **Test the Email Service Directly:**
   - Use the test endpoint: `POST /api/alerts/test-email`
   - Check response for specific error messages

---

## Summary of All Changes

### Client-Side Changes (3 files)
1. `client/src/components/dashboard/ChartComponent.tsx` - Fixed timeframe bug
2. `client/src/components/opportunities/OpportunitiesChart.tsx` - Fixed timeframe bug
3. `client/src/pages/opportunities.tsx` - Added currency formatting

### Server-Side Changes (6 files)
1. `server/templates/emails/opportunityAlertEmail.ts` - NEW: Email template
2. `server/templates/emails/index.ts` - Export new template
3. `server/services/EmailService.ts` - Added sendOpportunityAlert method
4. `server/jobs/opportunityScanner.ts` - Integrated email sending
5. `server/controllers/alertController.ts` - Added test endpoint
6. `server/routes/alertRoutes.ts` - Added test route

### Total Files Modified: 9
### Total Lines Added: ~350
### Total Lines Modified: ~15

---

## Next Steps

1. ✅ **Test Chart Timeframes:** Verify 1h/24h/7d buttons work correctly
2. ✅ **Test Currency Conversion:** Change currency in settings, check opportunities page
3. ✅ **Test Email Sending:** Use `POST /api/alerts/test-email` endpoint
4. ⚡ **Enable Real Alerts:** Turn on email notifications in settings
5. 🎉 **Monitor:** Watch for real opportunity emails when scanner runs!

---

**All three issues are now resolved!** 🚀
