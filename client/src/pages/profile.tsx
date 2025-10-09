// pages/profile.tsx
import { useState } from "react";
import { Save } from "lucide-react";
import ProfileSidebar from "../components/sections/ProfileSidebar";
import ProfileHeader from "../components/sections/ProfileHeader";
import ProfileInformation from "../components/sections/ProfileInformation";
import ProfilePreferences from "../components/sections/ProfilePreferences";
import ProfileSecurity from "../components/sections/ProfileSecurity";
import { useProfile } from "../hooks/useProfile";
import { usePreferences } from "../hooks/usePreferences";

const ProfilePage = () => {
  const [activeTab] = useState("Profile");
  const [sidebarOpen] = useState(false);
  const [notificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Use hooks for API data
  const { 
    profile, 
    isLoading: profileLoading, 
    isUpdating: profileUpdating,
    errors: profileErrors
  } = useProfile();

  const { 
    preferences, 
    isLoading: preferencesLoading, 
    isUpdating: preferencesUpdating,
    errors: preferencesErrors
  } = usePreferences();
  
  // Static notification data (can be moved to API later)
  const notifications = [
    {
      type: "price",
      title: "Price Target Hit",
      pair: "ETH/USDT",
      target: "$0.45",
      current: "$0.4523",
      time: "now",
    },
    {
      type: "arbitrage",
      title: "New Arbitrage Alert",
      details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
      profit: "$567",
      gas: "$15",
      score: 91,
      time: "now",
    },
    {
      type: "price",
      title: "Price Target Hit",
      pair: "ETH/USDT",
      target: "$0.45",
      current: "$0.4523",
      time: "36m ago",
    },
    {
      type: "arbitrage",
      title: "New Arbitrage Alert",
      details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
      profit: "$567",
      gas: "$15",
      score: 91,
      time: "1h ago",
    },
  ];

  const avatars = [
    { id: 0, initials: "JW", gradient: "from-cyan-400 to-purple-500" },
    { id: 1, initials: "AT", gradient: "from-emerald-400 to-cyan-500" },
    { id: 2, initials: "PT", gradient: "from-pink-400 to-orange-500" },
    { id: 3, initials: "BT", gradient: "from-blue-400 to-indigo-500" },
    { id: 4, initials: "GT", gradient: "from-yellow-400 to-red-500" },
    { id: 5, initials: "MT", gradient: "from-purple-400 to-pink-500" }
  ];

  const handleSaveChanges = async () => {
    // This will be implemented when we add form state management
    console.log('Save changes clicked');
  };

  // Show loading state
  if (profileLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileErrors.general || preferencesErrors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-slate-300 mb-4">{profileErrors.general || preferencesErrors.general}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Convert preferences data to component format
  const tokensTracked = preferences?.tokensTracked.reduce((acc, token) => {
    acc[token] = true;
    return acc;
  }, {} as Record<string, boolean>) || {};

  const dashboardPopup = preferences?.notificationSettings.dashboard || false;
  const emailNotifications = preferences?.notificationSettings.email || false;
  const profitThreshold = preferences?.alertThresholds.minROI || 5;
  const twoFactorAuth = false; // This would come from user settings

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative z-50 flex h-screen">
        {/* Sidebar */}
        <ProfileSidebar 
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300
              ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
        onClick={() => {}} >
          
          {/* Header */}
          <ProfileHeader
            notificationOpen={notificationOpen}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            notifications={notifications}
          />

          {/* Profile Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Profile Information */}
              <ProfileInformation
                fullName={profile?.user.name || ''}
                email={profile?.user.email || ''}
                joinDate={profile?.user.createdAt ? new Date(profile.user.createdAt).toLocaleDateString() : ''}
                selectedAvatar={0} // This would be stored in user preferences
                avatars={avatars}
              />

              {/* Preferences */}
              <ProfilePreferences
                tokensTracked={tokensTracked}
                dashboardPopup={dashboardPopup}
                emailNotifications={emailNotifications}
                profitThreshold={profitThreshold}
              />
            </div>

            {/* Security */}
            <ProfileSecurity
              twoFactorAuth={twoFactorAuth}
              className="mt-8"
            />

            {/* Save Button */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleSaveChanges}
                  disabled={profileUpdating || preferencesUpdating}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save className="w-5 h-5" />
                  {profileUpdating || preferencesUpdating ? 'Saving...' : 'Save All Changes'}
                </button>
                <p className="text-sm text-slate-400 text-center">
                  Changes will be applied immediately to your account
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {}}
        ></div>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;