import React from "react";
import { BrandingPanel } from "../components/sections/BrandingPanel";
import { VerticalSeparator } from "../components/ui/VerticalSeparator/VerticalSeparator";
import ChangePasswordForm from "../components/forms/ChangePasswordForm";

const ChangePasswordPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10"></div>
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel - Branding */}
        <BrandingPanel />
        
        {/* Vertical Separator */}
        <VerticalSeparator />
        
        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;