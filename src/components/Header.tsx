import React from 'react';
import { Language, PlatformId } from '../types';
import { translations } from '../utils/translations';
import { demoPresets } from '../data/presets';
import { 
  Calculator, 
  RotateCcw, 
  Printer, 
  Languages, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedPlatform: PlatformId;
  onPlatformChange: (platform: PlatformId) => void;
  onLoadPreset: (presetId: string) => void;
  onReset: () => void;
  onOpenPrint: () => void;
  activePresetId: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  selectedPlatform,
  onPlatformChange,
  onLoadPreset,
  onReset,
  onOpenPrint,
  activePresetId,
}) => {
  const t = translations[language];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {t.appName}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  India 🇮🇳
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Platform Switcher, Presets, Language & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Active Platform Quick Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <span className="text-slate-500 px-2 hidden sm:inline">Active:</span>
              <button
                type="button"
                onClick={() => onPlatformChange('meesho')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPlatform === 'meesho'
                    ? 'bg-fuchsia-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Meesho
              </button>
              <button
                type="button"
                onClick={() => onPlatformChange('amazon')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPlatform === 'amazon'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Amazon
              </button>
              <button
                type="button"
                onClick={() => onPlatformChange('flipkart')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedPlatform === 'flipkart'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Flipkart
              </button>
            </div>

            {/* Category Presets Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                aria-label={t.presetLabel}
                value={activePresetId}
                onChange={(e) => onLoadPreset(e.target.value)}
                className="bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
              >
                <option value="" disabled>
                  {t.presetLabel}
                </option>
                {demoPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {language === 'bn' ? preset.nameBn : preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  language === 'bn'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="বাংলায় দেখুন"
              >
                বাংলা
              </button>
            </div>

            {/* Print / Export Action */}
            <button
              type="button"
              onClick={onOpenPrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              title={t.printBtn}
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">{t.printBtn}</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1.5 transition-colors"
              title={t.resetBtn}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.resetBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
