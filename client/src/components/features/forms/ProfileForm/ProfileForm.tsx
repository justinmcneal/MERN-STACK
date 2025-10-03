import React from 'react';
import { User, Save, Shield } from 'lucide-react';
import Input from '../../../ui/Input/Input';
import Checkbox from '../../../ui/Checkbox/Checkbox';
import ToggleSwitch from '../../../ui/ToggleSwitch/ToggleSwitch';
import Button from '../../../ui/Button/Button';
import Card from '../../../ui/Card/Card';

export interface ProfileFormValues {
  fullName: string;
  email: string;
  joinDate: string;
  selectedAvatar: number;
  tokensTracked: {
    ETH: boolean;
    BTC: boolean;
    MATIC: boolean;
    USDT: boolean;
    BNB: boolean;
  };
  dashboardPopup: boolean;
  emailNotifications: boolean;
  profitThreshold: number;
  twoFactorAuth: boolean;
}

interface ProfileFormProps {
  values: ProfileFormValues;
  onChange: (field: keyof ProfileFormValues, value: any) => void;
  onSave: () => void;
  loading?: boolean;
  className?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  values,
  onChange,
  onSave,
  loading = false,
  className = ''
}) => {
  const avatars = [
    { id: 0, initials: "JW", gradient: "from-cyan-400 to-purple-500" },
    { id: 1, initials: "AT", gradient: "from-emerald-400 to-cyan-500" },
    { id: 2, initials: "PT", gradient: "from-pink-400 to-orange-500" },
    { id: 3, initials: "BT", gradient: "from-blue-400 to-indigo-500" },
    { id: 4, initials: "GT", gradient: "from-yellow-400 to-red-500" },
    { id: 5, initials: "MT", gradient: "from-purple-400 to-pink-500" }
  ];

  const handleTokenToggle = (token: keyof typeof values.tokensTracked) => {
    onChange('tokensTracked', {
      ...values.tokensTracked,
      [token]: !values.tokensTracked[token]
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Information */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            <p className="text-slate-400 text-sm">Update your personal details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={values.fullName}
            onChange={(value) => onChange('fullName', value)}
            required
          />

          <Input
            type="email"
            label="Email Address"
            value={values.email}
            onChange={(value) => onChange('email', value)}
            required
          />
        </div>

        <div className="mt-6">
          <p className="text-slate-400 text-sm mb-4">Choose your avatar</p>
          <div className="flex gap-3">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => onChange('selectedAvatar', avatar.id)}
                className={`
                  w-12 h-12 rounded-full bg-gradient-to-r ${avatar.gradient} 
                  flex items-center justify-center text-white font-semibold text-sm
                  border-2 transition-all
                  ${values.selectedAvatar === avatar.id 
                    ? 'border-cyan-400 shadow-lg scale-110' 
                    : 'border-transparent hover:border-slate-500'
                  }
                `}
                type="button"
              >
                {avatar.initials}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Preferences</h2>
            <p className="text-slate-400 text-sm">Customize your trading experience</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tokens Tracked */}
          <div>
            <p className="text-slate-300 font-medium mb-4">Tracked Tokens</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(values.tokensTracked).map(([token, checked]) => (
                <Checkbox
                  key={token}
                  label={token}
                  checked={checked}
                  onChange={() => handleTokenToggle(token as keyof typeof values.tokensTracked)}
                />
              ))}
            </div>
          </div>

          {/* Other Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 font-medium">Dashboard Popup</p>
                <p className="text-slate-400 text-sm">Show welcome popup on dashboard</p>
              </div>
              <ToggleSwitch
                enabled={values.dashboardPopup}
                onChange={(enabled) => onChange('dashboardPopup', enabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 font-medium">Email Notifications</p>
                <p className="text-slate-400 text-sm">Receive notifications via email</p>
              </div>
              <ToggleSwitch
                enabled={values.emailNotifications}
                onChange={(enabled) => onChange('emailNotifications', enabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 font-medium">Two-Factor Authentication</p>
                <p className="text-slate-400 text-sm">Add extra security to your account</p>
              </div>
              <ToggleSwitch
                enabled={values.twoFactorAuth}
                onChange={(enabled) => onChange('twoFactorAuth', enabled)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700/50">
            <Button
              onClick={onSave}
              variant="primary"
              loading={loading}
              className="min-w-[120px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileForm;
