import React from "react";
import type { ReactNode } from "react";
import { useThemeClasses } from "../ThemeAware";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const { gradient, text, bg } = useThemeClasses();

  return (
    <div className={`min-h-screen ${bg} ${text} font-inter antialiased`}>
      {/* Background (dark-only gradient) */}
      <div className={`${gradient === 'bg-white' ? 'hidden' : 'fixed inset-0'} bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10`}></div>
      
      <div className="relative z-50 flex h-screen">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
