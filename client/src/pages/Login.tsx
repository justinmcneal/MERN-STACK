import BrandingPanel from '../components/sections/BrandingPanel';
import LoginForm from '../components/forms/LoginForm';
import VerticalSeparator from '../components/ui/VerticalSeparator/VerticalSeparator';
import AuthLayout from '../components/sections/AuthLayout';

export default function Login() {
  return (
    <AuthLayout>
      <BrandingPanel />
      <VerticalSeparator />
      <div className="flex flex-col justify-center p-8 lg:p-16">
        <LoginForm />
      </div>
    </AuthLayout>
  );
}