import { useState } from "react";
import { Save, User, Shield, Key } from "lucide-react";
import { Layout } from "../../components/layout";
import { ProfileForm, type ProfileFormValues } from "../../components/features/forms";
import { useFormState, usePageState, useNotificationState } from "../../hooks";
import { Button, ToggleSwitch, Card } from "../../components/ui";

const ProfilePage = () => {
  const pageState = usePageState("Profile");
  const navigate = useNavigate();
  
  const notificationState = useNotificationState([
    {
      type: "system",
      title: "Profile Updated",
      description: "Your profile information has been updated successfully",
      time: "2h ago",
      unread: false,
    },
    {
      type: "security",
      title: "Two-Factor Auth",
      description: "Consider enabling two-factor authentication for enhanced security",
      time: "1d ago",
      unread: true,
    },
  ]);

  const formState = useFormState<ProfileFormValues>({
    initialValues: {
      fullName: "John Wayne",
      email: "johnwayne@gmail.com",
      avatar: 0,
      tokensTracked: {
        ETH: true,
        BTC: true,
        MATIC: true,
        USDT: false,
        BNB: false
      },
      dashboardPopup: true,
      emailNotifications: true,
      profitThreshold: 5,
      twoFactorAuth: false,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
      
      if (!values.fullName.trim()) errors.fullName = "Full name is required";
      if (!values.email.trim()) errors.email = "Email is required";
      
      return errors;
    }
  });

  const handleSave = async () => {
    if (formState.validate()) {
      try {
        // Simulate API call
        console.log('Profile saved:', formState.values);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Failed to save profile:', error);
        alert('Failed to save profile. Please try again.');
      }
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
            disabled={!formState.isValid}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <ProfileForm
              values={formState.values}
              errors={formState.errors}
              onChange={formState.setValue}
              onTokenToggle={(token) => {
                const newTokens = { ...formState.values.tokensTracked };
                newTokens[token] = !newTokens[token];
                formState.setValue('tokensTracked', newTokens);
              }}
            />
          </div>

          {/* Security Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="glass" padding="lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Two-Factor Authentication</label>
                    <p className="text-xs text-slate-400">Add extra security to your account</p>
                  </div>
                  <ToggleSwitch
                    enabled={formState.values.twoFactorAuth}
                    onChange={(enabled) => formState.setValue('twoFactorAuth', enabled)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Email Notifications</label>
                    <p className="text-xs text-slate-400">Get important updates via email</p>
                  </div>
                  <ToggleSwitch
                    enabled={formState.values.emailNotifications}
                    onChange={(enabled) => formState.setValue('emailNotifications', enabled)}
                  />
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                Trading Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Minimum Profit Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={formState.values.profitThreshold}
                    onChange={(e) => formState.setValue('profitThreshold', Number(e.target.value))}
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
                    enabled={formState.values.dashboardPopup}
                    onChange={(enabled) => formState.setValue('dashboardPopup', enabled)}
                  />
                </div>
              </div>
            </Card>
          </div>
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
