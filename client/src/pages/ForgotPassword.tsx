import { useNavigate } from 'react-router-dom';
import BrandingPanel from '../components/sections/BrandingPanel';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm';
import VerticalSeparator from '../components/ui/VerticalSeparator/VerticalSeparator';
import AuthLayout from '../components/sections/AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <BrandingPanel />
      <VerticalSeparator />
      <div className="flex flex-col justify-center p-8 lg:p-16">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 self-start rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:bg-slate-800/60"
        >
          Back to login
        </button>
        <ForgotPasswordForm />
      </div>
    </AuthLayout>
  );
}
