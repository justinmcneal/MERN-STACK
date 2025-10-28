import BrandingPanel from '../components/sections/BrandingPanel';
import RegisterForm from '../components/forms/RegisterForm';
import VerticalSeparator from '../components/ui/VerticalSeparator/VerticalSeparator';
import AuthLayout from '../components/sections/AuthLayout';

export default function Register() {
  return (
    <AuthLayout>
      <BrandingPanel />
      <VerticalSeparator />
      <div className="flex flex-col justify-center p-8 lg:p-16">
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}