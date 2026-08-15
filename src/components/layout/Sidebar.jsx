import React from 'react';
import {
  Home,
  Compass,
  FileText,
  User,
  Settings,
  HelpCircle,
  Bot,
  Shield,
  Activity,
  Building2,
  ListChecks,
  FileSpreadsheet,
} from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const {
    viewMode,
    activeTab,
    setActiveTab,
    adminTab,
    setAdminTab,
    openAskAlalay,
    reviewQueue,
    logout,
  } = useApp();

  const citizenNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'sources', label: 'Sources', icon: Building2 },
    { id: 'pipeline', label: 'Scraping Pipeline', icon: FileSpreadsheet },
    { id: 'review', label: 'AI Review Queue', icon: ListChecks, badge: reviewQueue.length },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 p-6 bg-white border-r border-slate-200/80 min-h-screen select-none justify-between">
      {/* Top Branding matching Image 3 */}
      <div className="space-y-8">
        <AlalayLogo size="sm" showSubtitle />

        {/* Navigation items */}
        <nav className="space-y-2">
          {viewMode === 'user' ? (
            citizenNav.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#093a96] text-white shadow-sm shadow-blue-900/20'
                      : 'text-slate-600 hover:text-[#093a96] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })
          ) : (
            adminNav.map((item) => {
              const isActive = adminTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Sidebar Controls & Ask ALALAY button (Image 3 & 5) */}
      <div className="space-y-3 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Log Out
          </button>
        </div>

        {/* Big Bottom "Ask ALALAY" Button */}
        {viewMode === 'user' && (
          <button
            type="button"
            onClick={() => openAskAlalay()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#093a96] hover:bg-[#072d75] text-white text-xs font-bold shadow-md shadow-blue-900/15 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Bot className="w-4 h-4" />
            <span>Ask ALALAY</span>
          </button>
        )}
      </div>
    </aside>
  );
};
