import React from "react";
import { Save } from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import MonitoringSettings from "./MonitoringSettings";

interface SettingsContentProps {
  // General Settings
  themeMode: boolean;
  dataRefreshInterval: string;
  defaultCurrency: string;
  onThemeModeChange: () => void;
  onDataRefreshIntervalChange: (value: string) => void;
  onDefaultCurrencyChange: (value: string) => void;
  
  // Monitoring Settings
  minProfitThreshold: number;
  maxGasFee: number;
  onMinProfitThresholdChange: (value: number) => void;
  onMaxGasFeeChange: (value: number) => void;
  
  // Save handler
  onSaveChanges: () => void;
}

const SettingsContent: React.FC<SettingsContentProps> = ({
  themeMode,
  dataRefreshInterval,
  defaultCurrency,
  onThemeModeChange,
  onDataRefreshIntervalChange,
  onDefaultCurrencyChange,
  minProfitThreshold,
  maxGasFee,
  onMinProfitThresholdChange,
  onMaxGasFeeChange,
  onSaveChanges
}) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="space-y-6">
        {/* General Settings */}
        <GeneralSettings
          themeMode={themeMode}
          dataRefreshInterval={dataRefreshInterval}
          defaultCurrency={defaultCurrency}
          onThemeModeChange={onThemeModeChange}
          onDataRefreshIntervalChange={onDataRefreshIntervalChange}
          onDefaultCurrencyChange={onDefaultCurrencyChange}
        />

        {/* Monitoring Settings */}
        <MonitoringSettings
          minProfitThreshold={minProfitThreshold}
          maxGasFee={maxGasFee}
          onMinProfitThresholdChange={onMinProfitThresholdChange}
          onMaxGasFeeChange={onMaxGasFeeChange}
        />

        {/* Save Button */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onSaveChanges}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
            <p className="text-sm text-slate-400 text-center">
              Changes will be applied immediately to your account
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SettingsContent;
