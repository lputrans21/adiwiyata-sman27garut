import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Scale,
  Sparkles,
  ShieldAlert,
  FileCode
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TabsNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      number: 'Menu 5',
      label: 'Laporan Realtime',
      icon: LayoutDashboard,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'absensi-umum' as ActiveTab,
      number: 'Menu 1',
      label: 'Absensi Umum',
      icon: UserCheck,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'absensi-sub' as ActiveTab,
      number: 'Menu 2',
      label: 'Absensi Sub Bidang',
      icon: Users,
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'timbangan' as ActiveTab,
      number: 'Menu 3',
      label: 'Timbangan Sampah',
      icon: Scale,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'produk' as ActiveTab,
      number: 'Menu 4',
      label: 'Produk yang Dihasilkan',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'admin' as ActiveTab,
      number: 'Menu 6',
      label: 'Sub Menu Admin',
      icon: ShieldAlert,
      color: 'from-rose-500 to-red-600',
      badge: isAdmin ? 'Aktif' : 'Password: dead4left'
    },
    {
      id: 'script-hub' as ActiveTab,
      number: 'Code.gs',
      label: 'Google Apps Script',
      icon: FileCode,
      color: 'from-slate-700 to-slate-900',
      badge: 'Hub'
    }
  ];

  return (
    <nav className="bg-white/95 border-b border-emerald-100 sticky top-0 z-20 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-emerald-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/40'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80 bg-slate-50/80 border border-slate-200/60'
                }`}
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                    isActive
                      ? 'bg-black/20 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.number}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-600'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : tab.id === 'admin' && isAdmin
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
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
