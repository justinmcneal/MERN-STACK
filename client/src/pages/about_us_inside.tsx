import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import AboutFooter from "../components/about/AboutFooter";
import AboutHero from "../components/about/AboutHero";
import AboutMission from "../components/about/AboutMission";
import AboutTeam from "../components/about/AboutTeam";
import AboutTechnology from "../components/about/AboutTechnology";
import AboutInsideHeader from "../components/aboutInside/AboutInsideHeader";
import AboutInsideLayout from "../components/aboutInside/AboutInsideLayout";
import Sidebar from "../components/dashboard/Sidebar";

const AboutUsInside = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(10, 3600000);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      /* Error handled by auth context */
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const toggleNotifications = () => {
    setNotificationOpen((prev) => {
      const next = !prev;
      if (next) {
        setProfileDropdownOpen(false);
      }
      return next;
    });
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => {
      const next = !prev;
      if (next) {
        setNotificationOpen(false);
      }
      return next;
    });
  };

  const closeNotifications = () => setNotificationOpen(false);
  const closeProfileDropdown = () => setProfileDropdownOpen(false);

  return (
    <>
      <AboutInsideLayout>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="About Us" />

        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:bg-transparent lg:backdrop-blur-none" : ""
          }`}
          onClick={() => {
            if (sidebarOpen) {
              setSidebarOpen(false);
            }
          }}
        >
          <AboutInsideHeader
            title="About Us"
            notifications={notifications}
            notificationOpen={notificationOpen}
            onNotificationToggle={toggleNotifications}
            onNotificationClose={closeNotifications}
            profileDropdownOpen={profileDropdownOpen}
            onProfileDropdownToggle={toggleProfileDropdown}
            onProfileDropdownClose={closeProfileDropdown}
            onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            userName={user?.name}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAllNotifications}
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AboutHero />
            <AboutMission />
            <AboutTeam />
            <AboutTechnology />
            <AboutFooter />
          </main>
        </div>
      </AboutInsideLayout>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AboutUsInside;