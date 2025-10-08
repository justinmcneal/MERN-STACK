// components/sections/ProfileInformation.tsx
import { User } from "lucide-react";

interface ProfileInformationProps {
  fullName: string;
  email: string;
  joinDate: string;
  selectedAvatar: number;
  avatars: Array<{ id: number; initials: string; gradient: string }>;
  className?: string;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({
  fullName,
  email,
  joinDate,
  selectedAvatar,
  avatars,
  className = ""
}) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Profile Information</h2>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={() => {}}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={() => {}}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
          />
        </div>

        {/* Join Date */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Join Date</label>
          <div className="px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-slate-300">
            {joinDate}
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm text-slate-400 mb-3">Profile Picture</label>

          {/* Centered profile preview */}
          <div className="flex items-center justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatars[selectedAvatar].gradient} flex items-center justify-center shadow-lg`}
            >
              <span className="text-white font-bold text-2xl">
                {avatars[selectedAvatar].initials}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="text-xs text-slate-400 mb-3">
              Ready-made character options
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="flex flex-wrap gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => {}}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center transition-all ${
                    selectedAvatar === avatar.id
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-800 scale-110"
                      : "hover:scale-105 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-white font-bold text-sm">{avatar.initials}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
