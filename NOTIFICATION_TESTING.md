# Testing Dynamic Notifications

## Overview
All pages now use the dynamic notification system powered by the `useNotifications` hook. Notifications are fetched from the backend Alert model and automatically refresh every hour.

## Updated Pages
- ✅ `opportunities.tsx` - Uses `useNotifications(10, 3600000)`
- ✅ `faq.tsx` - Uses `useNotifications(10, 3600000)`
- ✅ `about_us_inside.tsx` - Uses `useNotifications(10, 3600000)`
- ✅ `main_dashboard.tsx` - Uses alerts from `useAlerts` hook
- ✅ `settings.tsx` - Uses alerts from `useAlerts` hook
- ✅ `profile.tsx` - Uses alerts from `useAlerts` hook

## How to Test Notifications

### Step 1: Start Your Application
```bash
# Terminal 1 - Start the backend
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm run dev
```

### Step 2: Create Test Alerts
Run the test alert creation script from the **server** directory:

```bash
cd server
npx ts-node scripts/createTestAlerts.ts
```

**Note**: Make sure your `.env` file in the server directory has `MONGO_URI` set to your MongoDB connection string.

This will:
- Find the most recent user in your database (or you can modify it to target a specific user)
- Clear any existing alerts for that user
- Create 8 different test alerts:
  - **3 Opportunity alerts** (high, medium, low priority) - BTC, ETH, USDC arbitrage
  - **1 Price alert** (high priority) - BTC price target reached
  - **1 System alert** (medium priority) - Maintenance notification
  - **1 Custom alert** (low priority) - Welcome message
  - **1 Additional opportunity** - MATIC arbitrage
  - **1 Read alert** - To test filtering

### Step 3: View Notifications in UI

1. **Log in** with the user account that was targeted (check console output for email)

2. **Check the notification bell icon** in the header:
   - Should show a red badge with the count of unread notifications
   - Click to see notification dropdown with all alerts

3. **Verify notifications appear on pages**:
   - Navigate to **Dashboard** (`/dashboard`) - See alerts in the notification panel
   - Navigate to **Opportunities** (`/opportunities`) - See notifications at the top
   - Navigate to **FAQ** (`/faq`) - See notifications at the top
   - Navigate to **About Us (Inside)** (`/about-us-inside`) - See notifications at the top

4. **Test notification features**:
   - Click "Mark all as read" - Badge count should decrease
   - Click individual notification to view details
   - Verify different alert types show appropriate icons and colors
   - Check that high priority alerts appear at the top

### Step 4: Test Auto-Refresh

Notifications automatically refresh every hour (3600000ms). To test faster:

1. Temporarily modify the poll interval in any page:
   ```typescript
   const { notifications } = useNotifications(10, 30000); // 30 seconds instead of 1 hour
   ```

2. Create new alerts while the app is running:
   ```bash
   npx ts-node scripts/createTestAlerts.ts
   ```

3. Wait 30 seconds and verify new notifications appear automatically

## Alert Types and Their Display

### Opportunity Alerts
- **Icon**: 🎯 (target)
- **Color**: Blue/Cyan
- **Message Format**: "{TOKEN} arbitrage opportunity: Buy on {CHAIN_FROM}, Sell on {CHAIN_TO} for {ROI}% profit"
- **Example**: "BTC arbitrage opportunity: Buy on Ethereum, Sell on BSC for 5.2% profit"

### Price Alerts
- **Icon**: 💰 (money bag)
- **Color**: Green
- **Message Format**: "{TOKEN} on {CHAIN} has reached your target price of ${PRICE}"
- **Example**: "BTC on Ethereum has reached your target price of $46,000"

### System Alerts
- **Icon**: ⚙️ (gear)
- **Color**: Gray
- **Message**: Custom system messages
- **Example**: "Scheduled maintenance on December 15th from 2:00 AM to 4:00 AM UTC"

### Custom Alerts
- **Icon**: 📢 (megaphone)
- **Color**: Purple
- **Message**: Custom messages
- **Example**: "Welcome to ArbiScan! Start by setting your preferences..."

## Customizing Test Data

Edit `/server/scripts/createTestAlerts.ts` to:

1. **Target a specific user**:
   ```typescript
   const user = await User.findOne({ email: 'your-email@example.com' });
   ```

2. **Add more alerts**:
   ```typescript
   {
     userId: user._id,
     alertType: 'opportunity',
     priority: 'high',
     title: 'Your Custom Title',
     message: 'Your custom message',
     metadata: {
       tokenSymbol: 'SOL',
       chainFrom: 'ethereum',
       chainTo: 'polygon',
       profit: 100,
       roi: 4.2
     },
     isRead: false
   }
   ```

3. **Keep existing alerts** (comment out the delete line):
   ```typescript
   // await Alert.deleteMany({ userId: user._id });
   ```

## Verifying Backend API

You can also manually test the alerts API:

```bash
# Get alerts for authenticated user
curl http://localhost:3000/api/alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark alerts as read
curl -X PUT http://localhost:3000/api/alerts/mark-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alertIds": ["alert_id_1", "alert_id_2"]}'
```

## Troubleshooting

### Notifications not appearing?
1. Check browser console for errors
2. Verify user is logged in
3. Check that backend is running on port 3000
4. Verify alerts were created: `db.alerts.find()` in MongoDB
5. Check user's notification preferences in Settings

### Notification count is 0?
1. All alerts might be marked as read
2. User might have disabled notifications in preferences
3. Run the createTestAlerts script again

### Notifications not auto-refreshing?
1. Check the poll interval (default is 1 hour)
2. Verify `useNotifications` hook is being called
3. Check browser console for polling errors
4. Ensure backend `/api/alerts` endpoint is accessible

## Clean Up Test Data

To remove all test alerts:

```typescript
// In MongoDB shell or script
db.alerts.deleteMany({});

// Or target specific user
db.alerts.deleteMany({ userId: ObjectId('USER_ID_HERE') });
```

## Next Steps

After testing, you can:
1. Adjust poll intervals based on your needs
2. Add more alert types in the backend
3. Customize notification UI components
4. Add notification sound effects
5. Implement push notifications for high-priority alerts
