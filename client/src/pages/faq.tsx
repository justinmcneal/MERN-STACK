import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import FAQLayout from "../components/faq/FAQLayout";
import FAQSidebar from "../components/faq/FAQSidebar";
import FAQHeader from "../components/faq/FAQHeader";
import FAQSearchFilters, { type FAQCategoryWithCount } from "../components/faq/FAQSearchFilters";
import FAQList from "../components/faq/FAQList";
import FAQContactBanner from "../components/faq/FAQContactBanner";
import FAQEmptyState from "../components/faq/FAQEmptyState";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  FAQ_NAVIGATION,
} from "../components/faq/constants";

const FAQPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);

  const [activeTab, setActiveTab] = useState("FAQ");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [openFAQItems, setOpenFAQItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications(10, 3600000, { enabled: isAuthenticated });

  const categoriesWithCounts = useMemo<FAQCategoryWithCount[]>(() => {
    return FAQ_CATEGORIES.map((category) => {
      if (category.id === "all") {
        return { ...category, count: FAQ_ITEMS.length };
      }
      const count = FAQ_ITEMS.filter((item) => item.category === category.id).length;
      return { ...category, count };
    });
  }, []);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleFAQ = (question: string) => {
    setOpenFAQItems((prev) =>
      prev.includes(question)
        ? prev.filter((item) => item !== question)
        : [...prev, question]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      /* Error handled by auth context */
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setOpenFAQItems([]);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileDropdownOpen(false);
      setNotificationOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (sidebarOpen) {
      setNotificationOpen(false);
      setProfileDropdownOpen(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const activeCategoryLabel =
    categoriesWithCounts.find((category) => category.id === selectedCategory)?.name ??
    "All Questions";

  return (
    <FAQLayout>
      <FAQSidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        navigation={FAQ_NAVIGATION}
        onTabChange={setActiveTab}
        onNavigate={(path) => navigate(path)}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen
            ? "fixed inset-0 backdrop-blur-5xl bg-black/60 z-40 lg:static lg:backdrop-blur-5xl lg:bg-black/60"
            : ""
        }`}
        onClick={() => {
          if (sidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
        <FAQHeader
          isAuthenticated={isAuthenticated}
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationOpen={notificationOpen}
          onNotificationToggle={() => setNotificationOpen((prev) => !prev)}
          profileDropdownOpen={profileDropdownOpen}
          onProfileDropdownToggle={() => setProfileDropdownOpen((prev) => !prev)}
          notifications={notifications}
          userName={user?.name ?? null}
          onNavigate={(path) => navigate(path)}
          onLogout={handleLogout}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            <FAQSearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categoriesWithCounts}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            {filteredFaqs.length > 0 ? (
              <FAQList faqs={filteredFaqs} openItems={openFAQItems} onToggle={handleToggleFAQ} />
            ) : (
              <FAQEmptyState
                searchQuery={searchQuery}
                activeCategoryName={activeCategoryLabel}
                onClearFilters={handleClearFilters}
              />
            )}

            <FAQContactBanner onContactSupport={() => navigate("/contact-support")} />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </FAQLayout>
  );
};

export default FAQPage;