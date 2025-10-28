import { useEffect, useState } from "react";
import ContactSupportLayout from "../components/sections/ContactSupportLayout";
import ContactSupportSidebar from "../components/sections/ContactSupportSidebar";
import ContactSupportHeader from "../components/sections/ContactSupportHeader";
import ContactSupportContent from "../components/sections/ContactSupportContent";

const ContactSupportPage = () => {
    const [activeTab, setActiveTab] = useState("Contact Support");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      setProfileDropdownOpen(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <ContactSupportLayout>
      <ContactSupportSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

        {/* Main Content */}
    <div
    className={`flex-1 overflow-y-auto transition-all duration-300
      ${sidebarOpen ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60" : ""}`}
    onClick={() => sidebarOpen && setSidebarOpen(false)}
  >
          
        <ContactSupportHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
        />

        <ContactSupportContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </ContactSupportLayout>
  );
};

export default ContactSupportPage;