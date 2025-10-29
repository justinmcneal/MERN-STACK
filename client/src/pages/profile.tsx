// pages/profile.tsx
import { useState, useEffect, useMemo } from "react";
import { Save } from "lucide-react";
import ProfileSidebar from "../components/sections/ProfileSidebar";
import ProfileHeader from "../components/sections/ProfileHeader";
import ProfileInformation from "../components/sections/ProfileInformation";
import ProfilePreferences from "../components/sections/ProfilePreferences";
import ProfileSecurity from "../components/sections/ProfileSecurity";
import { useProfile } from "../hooks/useProfile";
import { usePreferences } from "../hooks/usePreferences";
import { useAlerts } from "../hooks/useAlerts";
import type { UpdatePreferencesData } from "../services/profileService";

const ProfilePage = () => {
    const [activeTab] = useState("Profile");
    const [sidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
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

  // Fetch live alerts for notifications
  const alertQuery = useMemo(() => ({ limit: 10 }), []);
  const { alerts } = useAlerts({ pollIntervalMs: 60000, query: alertQuery });

  const toggleNotifications = () => {
    setNotificationOpen(prev => {
      const next = !prev;
      if (next) {
        setProfileDropdownOpen(false);
      }
      return next;
    });
  };

  const closeNotifications = () => setNotificationOpen(false);

  // Original state for comparison
  const [originalState, setOriginalState] = useState({
    profile: { name: '', email: '', profilePicture: null as string | null, avatar: 0 },
    preferences: {
      dashboardPopup: false,
      emailNotifications: false,
      profitThreshold: 1,
      minProfit: 10,
      maxGasCost: 50,
      minScore: 60
    }
  });

  const [localName, setLocalName] = useState('');

  // Local state for form data
  const [localDashboardPopup, setLocalDashboardPopup] = useState(false);
  const [localEmailNotifications, setLocalEmailNotifications] = useState(false);
  const [localProfitThreshold, setLocalProfitThreshold] = useState(1);
  const [localMinProfit, setLocalMinProfit] = useState(10);
  const [localMaxGasCost, setLocalMaxGasCost] = useState(50);
  const [localMinScore, setLocalMinScore] = useState(60);
  const [localTwoFactorAuth, setLocalTwoFactorAuth] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(null);
  
  // Update local state when preferences change
  useEffect(() => {
    if (preferences) {
      setLocalDashboardPopup(preferences.notificationSettings.dashboard);
      setLocalEmailNotifications(preferences.notificationSettings.email);
      setLocalProfitThreshold(preferences.alertThresholds.minROI);
      setLocalMinProfit(preferences.alertThresholds.minProfit);
      setLocalMaxGasCost(preferences.alertThresholds.maxGasCost);
      // Convert minScore from 0-1 (backend) to 0-100 (UI)
      setLocalMinScore(preferences.alertThresholds.minScore * 100);
      setLocalName(profile?.user.name || '');
      setLocalProfilePicture(profile?.user.profilePicture || null);
      setSelectedAvatar(profile?.user.avatar || 0);

      // Set original state for comparison
      setOriginalState({
        profile: {
          name: profile?.user.name || '',
          email: profile?.user.email || '',
          profilePicture: profile?.user.profilePicture || null,
          avatar: profile?.user.avatar || 0
        },
        preferences: {
          dashboardPopup: preferences.notificationSettings.dashboard,
          emailNotifications: preferences.notificationSettings.email,
          profitThreshold: preferences.alertThresholds.minROI,
          minProfit: preferences.alertThresholds.minProfit,
          maxGasCost: preferences.alertThresholds.maxGasCost,
          // Store as 0-100 for UI comparison
          minScore: preferences.alertThresholds.minScore * 100
        }
      });
    }
  }, [preferences, profile]);

  useEffect(() => {
    if (profile?.user.name) {
      setLocalName(prev => (prev === '' ? profile.user.name : prev));
    }
  }, [profile]);

  // Function to check if current state differs from original state
  const hasActualChanges = useMemo(() => {
    const trimmedLocalName = localName.trim();
    const profileChanged = trimmedLocalName !== originalState.profile.name;
    const profilePictureChanged = localProfilePicture !== originalState.profile.profilePicture;
    const avatarChanged = selectedAvatar !== originalState.profile.avatar;

    const dashboardChanged = localDashboardPopup !== originalState.preferences.dashboardPopup;
    const emailChanged = localEmailNotifications !== originalState.preferences.emailNotifications;
    const profitChanged = localProfitThreshold !== originalState.preferences.profitThreshold;
    const minProfitChanged = localMinProfit !== originalState.preferences.minProfit;
    const maxGasCostChanged = localMaxGasCost !== originalState.preferences.maxGasCost;
    const minScoreChanged = localMinScore !== originalState.preferences.minScore;

    return profileChanged || profilePictureChanged || avatarChanged || dashboardChanged || emailChanged || profitChanged || minProfitChanged || maxGasCostChanged || minScoreChanged;
  }, [localName, localProfilePicture, selectedAvatar, localDashboardPopup, localEmailNotifications, localProfitThreshold, localMinProfit, localMaxGasCost, localMinScore, originalState]);

  // Handle profile updates (store locally, don't save immediately)
  const handleProfileUpdate = (data: { name?: string; email?: string; avatar?: number; profilePicture?: string }) => {
    if (data.avatar !== undefined) {
      setSelectedAvatar(data.avatar);
      // Clear profile picture when avatar is selected
      if (data.avatar !== originalState.profile.avatar) {
        setLocalProfilePicture('');
      }
      return;
    }

    if (data.profilePicture !== undefined) {
      setLocalProfilePicture(data.profilePicture);
      return;
    }

    // Only handle name changes - email changes are disabled
    if (data.name) {
      setLocalName(data.name);
    }
  };

  // Handle preferences updates (store locally, don't save immediately)
  const handlePreferencesUpdate = (data: { 
    dashboardPopup?: boolean;
    emailNotifications?: boolean;
    profitThreshold?: number;
    minProfit?: number;
    maxGasCost?: number;
    minScore?: number;
    twoFactorAuth?: boolean;
  }) => {
    if (data.dashboardPopup !== undefined) {
      setLocalDashboardPopup(data.dashboardPopup);
    }

    if (data.emailNotifications !== undefined) {
      setLocalEmailNotifications(data.emailNotifications);
    }

    if (data.profitThreshold !== undefined) {
      setLocalProfitThreshold(data.profitThreshold);
    }

    if (data.minProfit !== undefined) {
      setLocalMinProfit(data.minProfit);
    }

    if (data.maxGasCost !== undefined) {
      setLocalMaxGasCost(data.maxGasCost);
    }

    if (data.minScore !== undefined) {
      setLocalMinScore(data.minScore);
    }

    if (data.twoFactorAuth !== undefined) {
      setLocalTwoFactorAuth(data.twoFactorAuth);
      // This would be handled by a separate security API endpoint
      console.log('Two-factor auth toggle:', data.twoFactorAuth);
    }
  };

  // Handle save all changes
  const handleSaveChanges = async () => {
    if (!hasActualChanges) {
      console.log('No actual changes to save');
      return;
    }

    try {
      const trimmedLocalName = localName.trim();
      const profileData: { name?: string; profilePicture?: string; avatar?: number } = {};
      if (trimmedLocalName && trimmedLocalName !== originalState.profile.name) {
        profileData.name = trimmedLocalName;
      }
      if (localProfilePicture !== originalState.profile.profilePicture) {
        profileData.profilePicture = localProfilePicture || '';
      }
      if (selectedAvatar !== originalState.profile.avatar) {
        profileData.avatar = selectedAvatar;
      }

      const dashboardChanged = localDashboardPopup !== originalState.preferences.dashboardPopup;
      const emailChanged = localEmailNotifications !== originalState.preferences.emailNotifications;
      const profitChanged = localProfitThreshold !== originalState.preferences.profitThreshold;
      const minProfitChanged = localMinProfit !== originalState.preferences.minProfit;
      const maxGasCostChanged = localMaxGasCost !== originalState.preferences.maxGasCost;
      const minScoreChanged = localMinScore !== originalState.preferences.minScore;

      // Save profile changes
      if (profileData.name || profileData.profilePicture !== undefined || profileData.avatar !== undefined) {
        console.log('🔍 [ProfilePage] Sending profile data:', profileData);
        await updateProfile(profileData);
      }

      // Save preferences changes (check if any threshold changed)
      if (dashboardChanged || emailChanged || profitChanged || minProfitChanged || maxGasCostChanged || minScoreChanged) {
  const preferencesData: UpdatePreferencesData = {};

        if (dashboardChanged || emailChanged) {
          preferencesData.notificationSettings = {
            dashboard: localDashboardPopup,
            email: localEmailNotifications
          };
        }

        if (profitChanged || minProfitChanged || maxGasCostChanged || minScoreChanged) {
          preferencesData.alertThresholds = {
            minROI: localProfitThreshold,
            minProfit: localMinProfit,
            maxGasCost: localMaxGasCost,
            // Convert minScore from 0-100 (UI) to 0-1 (backend)
            minScore: localMinScore / 100
          };
        }

        await updatePreferences(preferencesData);
      }

      // Update original state to reflect saved changes
      setOriginalState(prev => ({
        profile: {
          ...prev.profile,
          name: profileData.name ?? prev.profile.name,
          profilePicture: profileData.profilePicture !== undefined ? profileData.profilePicture : prev.profile.profilePicture,
          avatar: profileData.avatar !== undefined ? profileData.avatar : prev.profile.avatar
        },
        preferences: {
          dashboardPopup: localDashboardPopup,
          emailNotifications: localEmailNotifications,
          profitThreshold: localProfitThreshold,
          minProfit: localMinProfit,
          maxGasCost: localMaxGasCost,
          minScore: localMinScore
        }
      }));

      console.log('All changes saved successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

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
  const dashboardPopup = localDashboardPopup;
  const emailNotifications = localEmailNotifications;
  const profitThreshold = localProfitThreshold;
  const twoFactorAuth = localTwoFactorAuth;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative flex h-screen">
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
            onNotificationToggle={toggleNotifications}
            onNotificationClose={closeNotifications}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            notifications={alerts}
          />

          {/* Profile Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Profile Information */}
              <ProfileInformation
                fullName={localName}
                email={profile?.user.email || ''}
                joinDate={profile?.user.createdAt ? new Date(profile.user.createdAt).toLocaleDateString() : ''}
                selectedAvatar={selectedAvatar}
                avatars={avatars}
                profilePicture={localProfilePicture}
                onUpdate={handleProfileUpdate}
                isUpdating={profileUpdating}
              />

              {/* Preferences */}
              <ProfilePreferences
                dashboardPopup={dashboardPopup}
                emailNotifications={emailNotifications}
                profitThreshold={profitThreshold}
                minProfit={localMinProfit}
                maxGasCost={localMaxGasCost}
                minScore={localMinScore}
                onUpdate={handlePreferencesUpdate}
                isUpdating={preferencesUpdating}
              />
            </div>

            <div className="mt-8 space-y-6">
              {/* Security */}
              <ProfileSecurity
                twoFactorAuth={twoFactorAuth}
                onUpdate={handlePreferencesUpdate}
                isUpdating={preferencesUpdating}
              />

              {/* Save Button */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleSaveChanges}
                    disabled={!hasActualChanges || profileUpdating || preferencesUpdating}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                      !hasActualChanges || profileUpdating || preferencesUpdating
                        ? 'bg-slate-600 text-slate-400 cursor-default opacity-50'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white hover:shadow-cyan-500/25 transform hover:scale-105 cursor-pointer'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {profileUpdating || preferencesUpdating ? 'Saving...' : 'Save All Changes'}
                  </button>
                  <p className="text-sm text-slate-400 text-center">
                    {hasActualChanges 
                      ? 'You have unsaved changes' 
                      : 'No changes detected'
                    }
                  </p>
                </div>
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