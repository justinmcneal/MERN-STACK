import React from "react";
import type { ReactNode } from "react";
import { useThemeClasses } from "../ThemeAware";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const { gradient } = useThemeClasses();

  return (
    <div className={`min-h-screen ${gradient} text-white font-inter antialiased`}>
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10 dark:from-cyan-900/10 dark:via-slate-950 dark:to-purple-900/10 light:from-blue-900/5 light:via-slate-50 light:to-purple-900/5"></div>
      
      <div className="relative z-50 flex h-screen">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
