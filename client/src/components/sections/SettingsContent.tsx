import React from "react";
import { Save, AlertCircle } from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import MonitoringSettings from "./MonitoringSettings";
import { useSettings } from "../../hooks/useSettings";
import { useThemeClasses } from "../ThemeAware";

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

  const { border, bg, buttonPrimary } = useThemeClasses();

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
          themeMode={settings.themeMode}
          dataRefreshInterval={settings.dataRefreshInterval}
          defaultCurrency={settings.defaultCurrency}
          onThemeModeChange={() => updateSetting('themeMode', !settings.themeMode)}
          onDataRefreshIntervalChange={(value) => updateSetting('dataRefreshInterval', value)}
          onDefaultCurrencyChange={(value) => updateSetting('defaultCurrency', value)}
          errors={{
            themeMode: errors.themeMode,
            dataRefreshInterval: errors.dataRefreshInterval,
            defaultCurrency: errors.defaultCurrency
          }}
        />

        {/* Monitoring Settings */}
        <MonitoringSettings
          minProfitThreshold={settings.minProfitThreshold}
          maxGasFee={settings.maxGasFee}
          onMinProfitThresholdChange={(value) => updateSetting('minProfitThreshold', value)}
          onMaxGasFeeChange={(value) => updateSetting('maxGasFee', value)}
          errors={{
            minProfitThreshold: errors.minProfitThreshold,
            maxGasFee: errors.maxGasFee
          }}
        />

        {/* Save Button */}
        <div className={`${bg}/50 backdrop-blur border ${border}/50 rounded-2xl p-6`}>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isUpdating}
                className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
                  !hasChanges || isUpdating
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : `${buttonPrimary} hover:scale-105`
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
                  className="px-6 py-4 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold transition-all duration-300"
                >
                  Reset
                </button>
              )}
            </div>
            
            <p className="text-sm text-slate-400 text-center">
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
