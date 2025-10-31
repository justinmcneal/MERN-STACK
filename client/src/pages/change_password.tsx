import { useNavigate } from "react-router-dom";
import BrandingPanel from "../components/sections/BrandingPanel";
import VerticalSeparator from "../components/ui/VerticalSeparator/VerticalSeparator";
import ChangePasswordForm from "../components/forms/ChangePasswordForm";
import AuthLayout from "../components/sections/AuthLayout";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <BrandingPanel />
      <VerticalSeparator />
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 self-start rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:bg-slate-800/60"
        >
          Back to dashboard
        </button>
        <ChangePasswordForm />
      </div>
    </AuthLayout>
  );
};

export default ChangePasswordPage;