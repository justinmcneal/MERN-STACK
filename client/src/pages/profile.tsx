// pages/profile.tsx
import { useState, useEffect } from "react";
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
    errors: profileErrors,
    updateProfile
  } = useProfile();

  const { 
    preferences, 
    isLoading: preferencesLoading, 
    isUpdating: preferencesUpdating,
    errors: preferencesErrors,
    updatePreferences
  } = usePreferences();

  // Local state for form data
  const [localTokensTracked, setLocalTokensTracked] = useState<Record<string, boolean>>({});
  const [localDashboardPopup, setLocalDashboardPopup] = useState(false);
  const [localEmailNotifications, setLocalEmailNotifications] = useState(false);
  const [localProfitThreshold, setLocalProfitThreshold] = useState(5);
  const [localTwoFactorAuth, setLocalTwoFactorAuth] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  
  // Track pending changes
  const [pendingChanges, setPendingChanges] = useState({
    profile: { name: '', email: '' },
    preferences: { 
      tokensTracked: [] as string[], 
      dashboardPopup: undefined as boolean | undefined, 
      emailNotifications: undefined as boolean | undefined, 
      profitThreshold: undefined as number | undefined 
    },
    hasChanges: false
  });

  // Update local state when preferences change
  useEffect(() => {
    if (preferences) {
      const tokensTracked = preferences.tokensTracked.reduce((acc, token) => {
        acc[token] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setLocalTokensTracked(tokensTracked);
      setLocalDashboardPopup(preferences.notificationSettings.dashboard);
      setLocalEmailNotifications(preferences.notificationSettings.email);
      setLocalProfitThreshold(preferences.alertThresholds.minROI);
    }
  }, [preferences]);

  // Fetch available tokens on component mount
  useEffect(() => {
    const fetchAvailableTokens = async () => {
      try {
        // Use the default supported tokens for now
        // In a real app, you'd fetch this from the API
        const defaultTokens = ['ETH', 'USDT', 'USDC', 'BNB', 'MATIC'];
        setAvailableTokens(defaultTokens);
        
        // Initialize localTokensTracked with all available tokens
        if (Object.keys(localTokensTracked).length === 0) {
          const initialTokensTracked = defaultTokens.reduce((acc, token) => {
            acc[token] = false; // Start with all unchecked
            return acc;
          }, {} as Record<string, boolean>);
          setLocalTokensTracked(initialTokensTracked);
        }
      } catch (error) {
        console.error('Failed to fetch available tokens:', error);
      }
    };

    fetchAvailableTokens();
  }, []);

  // Handle profile updates (store locally, don't save immediately)
  const handleProfileUpdate = (data: { name?: string; email?: string; avatar?: number }) => {
    if (data.avatar !== undefined) {
      setSelectedAvatar(data.avatar);
      // Avatar is just UI state for now, not saved to backend
      return;
    }

    // Only handle name changes - email changes are disabled
    if (data.name) {
      setPendingChanges(prev => ({
        ...prev,
        profile: {
          name: data.name || prev.profile.name,
          email: prev.profile.email // Keep existing email, don't allow changes
        },
        hasChanges: true
      }));
    }
  };

  // Handle preferences updates (store locally, don't save immediately)
  const handlePreferencesUpdate = (data: { 
    tokensTracked?: Record<string, boolean>;
    dashboardPopup?: boolean;
    emailNotifications?: boolean;
    profitThreshold?: number;
    twoFactorAuth?: boolean;
  }) => {
    if (data.tokensTracked) {
      setLocalTokensTracked(data.tokensTracked);
      const tokensArray = Object.keys(data.tokensTracked).filter(token => data.tokensTracked![token]);
      setPendingChanges(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          tokensTracked: tokensArray
        },
        hasChanges: true
      }));
    }

    if (data.dashboardPopup !== undefined) {
      setLocalDashboardPopup(data.dashboardPopup);
      setPendingChanges(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          dashboardPopup: data.dashboardPopup
        },
        hasChanges: true
      }));
    }

    if (data.emailNotifications !== undefined) {
      setLocalEmailNotifications(data.emailNotifications);
      setPendingChanges(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          emailNotifications: data.emailNotifications
        },
        hasChanges: true
      }));
    }

    if (data.profitThreshold !== undefined) {
      setLocalProfitThreshold(data.profitThreshold);
      setPendingChanges(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          profitThreshold: data.profitThreshold
        },
        hasChanges: true
      }));
    }

    if (data.twoFactorAuth !== undefined) {
      setLocalTwoFactorAuth(data.twoFactorAuth);
      // This would be handled by a separate security API endpoint
      console.log('Two-factor auth toggle:', data.twoFactorAuth);
    }
  };

  // Handle save all changes
  const handleSaveChanges = async () => {
    if (!pendingChanges.hasChanges) {
      console.log('No changes to save');
      return;
    }

    try {
      // Save profile changes
      if (pendingChanges.profile.name) {
        const profileData: { name: string } = {
          name: pendingChanges.profile.name
        };
        
        await updateProfile(profileData);
      }

      // Save preferences changes
      if (pendingChanges.preferences.tokensTracked.length > 0 || 
          pendingChanges.preferences.dashboardPopup !== undefined ||
          pendingChanges.preferences.emailNotifications !== undefined ||
          pendingChanges.preferences.profitThreshold !== undefined) {
        
        const preferencesData: any = {};
        
        if (pendingChanges.preferences.tokensTracked.length > 0) {
          preferencesData.tokensTracked = pendingChanges.preferences.tokensTracked;
        }
        
        if (pendingChanges.preferences.dashboardPopup !== undefined || 
            pendingChanges.preferences.emailNotifications !== undefined) {
          preferencesData.notificationSettings = {
            dashboard: pendingChanges.preferences.dashboardPopup,
            email: pendingChanges.preferences.emailNotifications
          };
        }
        
        if (pendingChanges.preferences.profitThreshold !== undefined) {
          preferencesData.alertThresholds = {
            minROI: pendingChanges.preferences.profitThreshold,
            minProfit: preferences?.alertThresholds.minProfit || 100,
            maxGasCost: preferences?.alertThresholds.maxGasCost || 50,
            minScore: preferences?.alertThresholds.minScore || 80
          };
        }
        
        await updatePreferences(preferencesData);
      }

      // Clear pending changes
      setPendingChanges({
        profile: { name: '', email: '' },
        preferences: { 
          tokensTracked: [], 
          dashboardPopup: undefined, 
          emailNotifications: undefined, 
          profitThreshold: undefined 
        },
        hasChanges: false
      });

      console.log('All changes saved successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };
  
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
  const tokensTracked = availableTokens.reduce((acc, token) => {
    acc[token] = localTokensTracked[token] || false;
    return acc;
  }, {} as Record<string, boolean>);
  const dashboardPopup = localDashboardPopup;
  const emailNotifications = localEmailNotifications;
  const profitThreshold = localProfitThreshold;
  const twoFactorAuth = localTwoFactorAuth;

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
                selectedAvatar={selectedAvatar}
                avatars={avatars}
                onUpdate={handleProfileUpdate}
                isUpdating={profileUpdating}
              />

              {/* Preferences */}
              <ProfilePreferences
                tokensTracked={tokensTracked}
                dashboardPopup={dashboardPopup}
                emailNotifications={emailNotifications}
                profitThreshold={profitThreshold}
                availableTokens={availableTokens}
                onUpdate={handlePreferencesUpdate}
                isUpdating={preferencesUpdating}
              />
            </div>

            {/* Security */}
            <ProfileSecurity
              twoFactorAuth={twoFactorAuth}
              onUpdate={handlePreferencesUpdate}
              isUpdating={preferencesUpdating}
              className="mt-8"
            />

            {/* Save Button */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleSaveChanges}
                  disabled={!pendingChanges.hasChanges || profileUpdating || preferencesUpdating}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    !pendingChanges.hasChanges || profileUpdating || preferencesUpdating
                      ? 'bg-slate-600 text-slate-400 cursor-default opacity-50'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white hover:shadow-cyan-500/25 transform hover:scale-105 cursor-pointer'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {profileUpdating || preferencesUpdating ? 'Saving...' : 'Save All Changes'}
                </button>
                <p className="text-sm text-slate-400 text-center">
                  {pendingChanges.hasChanges 
                    ? 'You have unsaved changes' 
                    : 'Changes will be applied immediately to your account'
                  }
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