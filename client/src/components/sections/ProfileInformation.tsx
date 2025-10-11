// components/sections/ProfileInformation.tsx
import { useEffect, useState, useRef } from "react";
import { User, Upload, X, Camera } from "lucide-react";
import { ProfilePictureService } from "../../services/profilePictureService";

interface ProfileInformationProps {
  fullName: string;
  email: string;
  joinDate: string;
  selectedAvatar: number;
  avatars: Array<{ id: number; initials: string; gradient: string }>;
  profilePicture?: string | null;
  onUpdate?: (data: { name?: string; email?: string; avatar?: number; profilePicture?: string }) => void;
  isUpdating?: boolean;
  className?: string;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({
  fullName,
  email,
  joinDate,
  selectedAvatar,
  avatars,
  profilePicture,
  onUpdate,
  isUpdating = false,
  className = ""
}) => {
  const [localName, setLocalName] = useState(fullName);
  const [localEmail] = useState(email); // Email is read-only
  const [localAvatar, setLocalAvatar] = useState(selectedAvatar);
  const [nameError, setNameError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(fullName);
  }, [fullName]);

  useEffect(() => {
    setLocalAvatar(selectedAvatar);
  }, [selectedAvatar]);

  const validateName = (name: string): boolean => {
    if (!name || name.length < 10) {
      setNameError('Name must be at least 10 characters long');
      return false;
    }
    if (name.length > 50) {
      setNameError('Name must not exceed 50 characters');
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      setNameError('Name can only contain letters, spaces, hyphens, and apostrophes');
      return false;
    }
    setNameError('');
    return true;
  };

  // Email validation removed - email changes are disabled

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalName(value);
    validateName(value);
    
    // Update pending changes immediately on change
    if (value !== fullName && validateName(value)) {
      onUpdate?.({ name: value });
    }
  };

  const handleEmailChange = () => {
    // Email changes are disabled for security reasons
    // Do nothing - prevent any changes to email
    return;
  };

  const handleAvatarChange = (avatarId: number) => {
    setLocalAvatar(avatarId);
    
    // Clear any uploaded profile picture when avatar is selected
    if (previewUrl) {
      ProfilePictureService.revokePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadError('');
    
    // Notify parent component about avatar change and clear profile picture
    onUpdate?.({ avatar: avatarId, profilePicture: '' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = ProfilePictureService.validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error!);
      return;
    }

    setUploadError('');
    
    // Create preview
    const url = ProfilePictureService.createPreviewUrl(file);
    setPreviewUrl(url);

    // Upload file
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const response = await ProfilePictureService.uploadProfilePicture(file);
      
      // Update parent component with new profile picture URL
      onUpdate?.({ profilePicture: response.data.profilePicture });
      
      // Clean up preview URL
      if (previewUrl) {
        ProfilePictureService.revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      ProfilePictureService.revokePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadError('');
    
    // Notify parent component to remove the profile picture
    onUpdate?.({ profilePicture: '' });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleNameBlur = () => {
    if (localName !== fullName && validateName(localName)) {
      onUpdate?.({ name: localName });
    }
  };

  const handleEmailBlur = () => {
    // Email changes are disabled for security reasons
    // Do nothing - prevent any changes to email
    return;
  };
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
            value={localName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            disabled={isUpdating}
            className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
              nameError ? 'border-red-500 focus:ring-red-400/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
            }`}
          />
          {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={localEmail}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={true}
              className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-slate-300 cursor-not-allowed opacity-75"
              title="Email address cannot be changed for security reasons"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Email address cannot be changed for security reasons
          </p>
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

          {/* Profile Picture Display */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {/* Current Profile Picture */}
              {profilePicture || previewUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-600">
                  <img
                    src={previewUrl || profilePicture || ''}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatars[localAvatar].gradient} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-2xl">
                    {avatars[localAvatar].initials}
                  </span>
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <button
                onClick={handleUploadClick}
                disabled={isUploading || isUpdating}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Upload Controls */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={handleUploadClick}
              disabled={isUploading || isUpdating}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
            
            {(profilePicture || previewUrl) && (
              <button
                onClick={handleRemoveImage}
                disabled={isUploading || isUpdating}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Avatar Options */}
          <div className="text-center mb-4">
            <div className="text-xs text-slate-400 mb-3">
              Or choose a ready-made avatar
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarChange(avatar.id)}
                  disabled={isUpdating || isUploading}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center transition-all disabled:opacity-50 ${
                    localAvatar === avatar.id
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
