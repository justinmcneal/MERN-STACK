import React from "react";
import { Save, AlertCircle } from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import { useSettings } from "../../hooks/useSettings";

const SettingsContent: React.FC = () => {
  const {
    settings,
    errors,
    isLoading,
    isUpdating,
    hasChanges,
    updateSetting,
    saveSettings,
    validateSettings,
    resetSettings
  } = useSettings();

  const handleSaveChanges = async () => {
    if (!validateSettings()) {
      return;
    }

    const result = await saveSettings();
    if (result.success) {
      // Could show success message here
      console.log('Settings saved successfully');
    }
  };
  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading settings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
  <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="space-y-6">
        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* General Settings */}
        <GeneralSettings
          defaultCurrency={settings.defaultCurrency}
          onDefaultCurrencyChange={(value) => updateSetting('defaultCurrency', value)}
          errors={{
            defaultCurrency: errors.defaultCurrency
          }}
        />

        {/* Save Button */}
        <div className="bg-white/70 backdrop-blur border border-slate-200/60 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isUpdating}
                className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
                  !hasChanges || isUpdating
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 hover:from-blue-400 hover:to-purple-500'
                }`}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Changes
                  </>
                )}
              </button>
              
              {hasChanges && (
                <button
                  onClick={resetSettings}
                  className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-300"
                >
                  Reset
                </button>
              )}
            </div>
            
            <p className="text-sm text-slate-500 text-center">
              {hasChanges 
                ? "You have unsaved changes" 
                : "All changes have been saved"
              }
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsContent;
