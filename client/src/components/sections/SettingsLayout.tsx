import React from "react";
import type { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter antialiased">
      <div className="relative z-50 flex h-screen">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
