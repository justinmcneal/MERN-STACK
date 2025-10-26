import React from "react";
import ToggleSwitch from "../ui/ToggleSwitch/ToggleSwitch";
import { useThemeClasses } from "../ThemeAware";

interface GeneralSettingsProps {
  themeMode: boolean;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
  onThemeModeChange: () => void;
  onDefaultCurrencyChange: (value: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP') => void;
  errors?: {
    themeMode?: string;
    defaultCurrency?: string;
  };
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  themeMode,
  defaultCurrency,
  onThemeModeChange,
  onDefaultCurrencyChange,
  errors = {}
}) => {
  const { card, text, textSecondary, border, input } = useThemeClasses();

  return (
    <div className={`${card} backdrop-blur border ${border} rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${text}`}>General Settings</h2>
          <p className={`text-sm ${textSecondary}`}>Customize your interface and basic preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Mode */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${border}`}>
          <div className="flex-1">
            <h3 className={`${text} font-medium mb-1`}>Theme Mode</h3>
            <p className={`text-sm ${textSecondary}`}>Switch between light and dark mode interface</p>
            {errors.themeMode && <p className="text-xs text-red-400 mt-1">{errors.themeMode}</p>}
          </div>
          <ToggleSwitch 
            enabled={themeMode}
            onChange={onThemeModeChange}
          />
        </div>

        {/* Default Currency */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className={`${text} font-medium mb-1`}>Default Currency</h3>
            <p className={`text-sm ${textSecondary}`}>Primary currency for displaying profit/loss values and conversions</p>
            {errors.defaultCurrency && <p className="text-xs text-red-400 mt-1">{errors.defaultCurrency}</p>}
          </div>
          <div className="relative w-full sm:w-64">
            <select 
              value={defaultCurrency}
              onChange={(e) => onDefaultCurrencyChange(e.target.value as 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP')}
              className={`w-full appearance-none px-4 py-2.5 ${input} border rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.defaultCurrency 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'focus:ring-cyan-400/50'
              }`}
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
              <option value="PHP">PHP (₱) - Philippine Peso</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
