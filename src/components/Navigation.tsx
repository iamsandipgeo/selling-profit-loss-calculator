import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  LayoutDashboard,
  Calculator,
  ArrowLeftRight,
  Settings2,
  Wrench,
  BookmarkCheck,
  HelpCircle,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'calculator'
  | 'comparison'
  | 'fees'
  | 'tools'
  | 'saved'
  | 'help';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  language: Language;
  savedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
  savedCount,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard' as TabId, label: t.tabDashboard, icon: LayoutDashboard },
    { id: 'calculator' as TabId, label: t.tabCalculator, icon: Calculator },
    { id: 'comparison' as TabId, label: t.tabComparison, icon: ArrowLeftRight },
    { id: 'fees' as TabId, label: t.tabFeeSettings, icon: Settings2 },
    { id: 'tools' as TabId, label: t.tabSmartTools, icon: Wrench },
    {
      id: 'saved' as TabId,
      label: t.tabSaved,
      icon: BookmarkCheck,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    { id: 'help' as TabId, label: t.tabHelp, icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
