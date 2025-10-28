import React from "react";
import type { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.cyan.900)/10,theme(colors.slate.950),theme(colors.purple.900)/10)]" aria-hidden="true"></div>
      <div className="relative z-10 flex h-screen">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
