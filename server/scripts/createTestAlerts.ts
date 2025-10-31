import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Alert from '../models/Alert';
import User from '../models/User';

// Load environment variables from server directory
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-stack';

async function createTestAlerts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a test user (you can modify this to use a specific user email)
    const user = await User.findOne().sort({ createdAt: -1 }); // Get most recent user
    
    if (!user) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Creating test alerts for user: ${user.email}`);

    // Clear existing alerts for this user (optional)
    await Alert.deleteMany({ userId: user._id });
    console.log('Cleared existing alerts');

    // Create test alerts with different types and priorities
    const testAlerts = [
      // High priority opportunity alert
      {
        userId: user._id,
        alertType: 'opportunity',
        priority: 'high',
        title: 'High Profit Arbitrage Opportunity',
        message: 'BTC arbitrage opportunity detected: Buy on Ethereum, Sell on BSC for 5.2% profit',
        metadata: {
          tokenSymbol: 'BTC',
          chainFrom: 'ethereum',
          chainTo: 'bsc',
          profit: 520,
          roi: 5.2,
          priceFrom: 45000,
          priceTo: 47340
        },
        isRead: false
      },
      // Medium priority opportunity alert
      {
        userId: user._id,
        alertType: 'opportunity',
        priority: 'medium',
        title: 'Moderate Arbitrage Opportunity',
        message: 'ETH arbitrage opportunity: Buy on Polygon, Sell on Avalanche for 3.1% profit',
        metadata: {
          tokenSymbol: 'ETH',
          chainFrom: 'polygon',
          chainTo: 'avalanche',
          profit: 93,
          roi: 3.1,
          priceFrom: 3000,
          priceTo: 3093
        },
        isRead: false
      },
      // Low priority opportunity alert
      {
        userId: user._id,
        alertType: 'opportunity',
        priority: 'low',
        title: 'Small Arbitrage Opportunity',
        message: 'USDC arbitrage opportunity: Buy on Arbitrum, Sell on Optimism for 1.8% profit',
        metadata: {
          tokenSymbol: 'USDC',
          chainFrom: 'arbitrum',
          chainTo: 'optimism',
          profit: 18,
          roi: 1.8,
          priceFrom: 1.00,
          priceTo: 1.018
        },
        isRead: false
      },
      // Price alert
      {
        userId: user._id,
        alertType: 'price',
        priority: 'high',
        title: 'Price Alert Triggered',
        message: 'BTC on Ethereum has reached your target price of $46,000',
        metadata: {
          tokenSymbol: 'BTC',
          chain: 'ethereum',
          currentPrice: 46000,
          targetPrice: 46000,
          direction: 'above'
        },
        isRead: false
      },
      // System alert
      {
        userId: user._id,
        alertType: 'system',
        priority: 'medium',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance on December 15th from 2:00 AM to 4:00 AM UTC',
        metadata: {
          scheduledDate: new Date('2024-12-15T02:00:00Z'),
          duration: '2 hours'
        },
        isRead: false
      },
      // Custom alert
      {
        userId: user._id,
        alertType: 'custom',
        priority: 'low',
        title: 'Welcome to ArbiScan!',
        message: 'Thank you for joining ArbiScan. Start by setting your preferences to receive personalized alerts.',
        metadata: {
          type: 'welcome'
        },
        isRead: false
      },
      // Multiple opportunities for the same token
      {
        userId: user._id,
        alertType: 'opportunity',
        priority: 'high',
        title: 'Multiple Arbitrage Routes Available',
        message: 'MATIC arbitrage: Buy on Ethereum, Sell on Polygon for 4.5% profit',
        metadata: {
          tokenSymbol: 'MATIC',
          chainFrom: 'ethereum',
          chainTo: 'polygon',
          profit: 45,
          roi: 4.5,
          priceFrom: 1.00,
          priceTo: 1.045
        },
        isRead: false
      },
      // Read alert (to test filtering)
      {
        userId: user._id,
        alertType: 'opportunity',
        priority: 'medium',
        title: 'Previous Opportunity (Read)',
        message: 'LINK arbitrage opportunity: Buy on BSC, Sell on Avalanche for 2.9% profit',
        metadata: {
          tokenSymbol: 'LINK',
          chainFrom: 'bsc',
          chainTo: 'avalanche',
          profit: 29,
          roi: 2.9
        },
        isRead: true
      }
    ];

    // Insert alerts
    const createdAlerts = await Alert.insertMany(testAlerts);
    console.log(`\n✅ Successfully created ${createdAlerts.length} test alerts`);

    // Display summary
    console.log('\n📊 Alert Summary:');
    console.log(`   - Opportunity alerts: ${createdAlerts.filter(a => a.alertType === 'opportunity').length}`);
    console.log(`   - Price alerts: ${createdAlerts.filter(a => a.alertType === 'price').length}`);
    console.log(`   - System alerts: ${createdAlerts.filter(a => a.alertType === 'system').length}`);
    console.log(`   - Custom alerts: ${createdAlerts.filter(a => a.alertType === 'custom').length}`);
    console.log(`   - High priority: ${createdAlerts.filter(a => a.priority === 'high').length}`);
    console.log(`   - Medium priority: ${createdAlerts.filter(a => a.priority === 'medium').length}`);
    console.log(`   - Low priority: ${createdAlerts.filter(a => a.priority === 'low').length}`);
    console.log(`   - Unread: ${createdAlerts.filter(a => !a.isRead).length}`);
    console.log(`   - Read: ${createdAlerts.filter(a => a.isRead).length}`);

    console.log(`\n🔔 Alerts created for user: ${user.email} (ID: ${user._id})`);
    console.log('\nYou can now test the notifications in the UI!');

  } catch (error) {
    console.error('Error creating test alerts:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
createTestAlerts();
