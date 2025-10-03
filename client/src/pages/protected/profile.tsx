import { Save, User, Shield } from "lucide-react";
import { Layout } from "../../components/layout";
import { usePageState, useNotificationState } from "../../hooks";
import { Button, ToggleSwitch, Card, Input } from "../../components/ui";
import { useState } from "react";

const ProfilePage = () => {
  const pageState = usePageState("Profile");
  
  const notificationState = useNotificationState([
    {
      type: "system",
      title: "Profile Updated",
      description: "Your profile information has been updated successfully",
      time: "2h ago",
      unread: false,
    },
    {
      type: "alert",
      title: "Two-Factor Auth",
      description: "Consider enabling two-factor authentication for enhanced security",
      time: "1d ago",
      unread: true,
    },
  ]);

  // Local state management
    const [fullName, setFullName] = useState("John Wayne");
    const [email, setEmail] = useState("johnwayne@gmail.com");
  const [profitThreshold, setProfitThreshold] = useState(5);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dashboardPopup, setDashboardPopup] = useState(true);

  // Token preferences removed for simplicity
    
  const handleSave = async () => {
    try {
      // Simulate API call
      console.log('Profile saved:', {
        fullName,
        email,
        profitThreshold,
        twoFactorAuth,
        emailNotifications,
        dashboardPopup
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

  return (
    <Layout
      title="Profile & Preferences"
      activeTab={pageState.activeTab}
      onTabChange={pageState.setActiveTab}
      notifications={notificationState.notifications}
      user={user}
      onNotificationClick={(notification) => {
        console.log('Notification clicked:', notification);
        notificationState.markAsRead(notification.id!);
      }}
      onMarkAllRead={notificationState.markAllAsRead}
      onLogout={() => console.log('Logout')}
    >
      <div className="p-6 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <User className="w-7 h-7 text-cyan-400" />
              Profile Management
            </h1>
            <p className="text-slate-400 mt-1">Manage your account details and trading preferences</p>
          </div>
          <Button
            onClick={handleSave}
            variant="primary"
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-400 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
            
            <div className="space-y-4">
                  <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <Input
                      type="text"
                      value={fullName}
                  onChange={setFullName}
                  placeholder="Enter your full name"
                  className="w-full"
                    />
                  </div>

                  <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <Input
                      type="email"
                      value={email}
                  onChange={setEmail}
                  placeholder="Enter your email"
                  className="w-full"
                    />
                  </div>
                    </div>
          </Card>

          {/* Security Settings */}
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-400" />
              Security Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                    <div>
                  <label className="text-sm font-medium text-slate-300">Two-Factor Authentication</label>
                  <p className="text-xs text-slate-400">Add extra security to your account</p>
                </div>
                <ToggleSwitch
                  enabled={twoFactorAuth}
                  onChange={setTwoFactorAuth}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-300">Email Notifications</label>
                  <p className="text-xs text-slate-400">Get important updates via email</p>
                </div>
                        <ToggleSwitch 
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                        />
                      </div>
                      
                  <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minimum Profit Threshold ($)
                </label>
                          <input
                            type="number"
                            value={profitThreshold}
                            onChange={(e) => setProfitThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                  min="1"
                          />
                      </div>
                      
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-300">Dashboard Popups</label>
                  <p className="text-xs text-slate-400">Show helpful notifications</p>
                </div>
                <ToggleSwitch
                  enabled={dashboardPopup}
                  onChange={setDashboardPopup}
                />
              </div>
            </div>
          </Card>
                </div>

        {/* Account Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" padding="md" className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-2">127</div>
            <div className="text-sm text-slate-400">Opportunities Found</div>
          </Card>
          
          <Card variant="glass" padding="md" className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-2">$12,456</div>
            <div className="text-sm text-slate-400">Total Profit</div>
          </Card>
          
          <Card variant="glass" padding="md" className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">42</div>
            <div className="text-sm text-slate-400">Days Active</div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;