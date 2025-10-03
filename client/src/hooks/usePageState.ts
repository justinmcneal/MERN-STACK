import { useState, useCallback } from 'react';

interface PageState {
  activeTab: string;
  sidebarOpen: boolean;
  profileDropdownOpen: boolean;
  setActiveTab: (activeTab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setProfileDropdownOpen: (open: boolean) => void;
  closeAllDropdowns: () => void;
}

export function usePageState(initialTab: string = ''): PageState {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const closeAllDropdowns = useCallback(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, []);

  return {
    activeTab,
    sidebarOpen,
    profileDropdownOpen,
    setActiveTab,
    setSidebarOpen,
    setProfileDropdownOpen,
    closeAllDropdowns,
  };
}

export default usePageState;
