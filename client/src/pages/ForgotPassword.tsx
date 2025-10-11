import BrandingPanel from '../components/sections/BrandingPanel';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm';
import VerticalSeparator from '../components/ui/VerticalSeparator/VerticalSeparator';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10"></div>
      
      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Branding */}
        <BrandingPanel />

        {/* Vertical Separator */}
        <VerticalSeparator />

        {/* Right Panel - Forgot Password Form */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
