import React from 'react';
import { Bell, Shield, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header = () => {
  const {
    user,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    unreadCount,
    t,
  } = useApp();

  return (
    <header className="px-6 sm:px-10 pt-5 pb-3 flex items-center justify-between gap-4 select-none flex-shrink-0">
      {/* Greeting Title matching Image 3 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
          {t('header.greeting')}, <span className="text-[#093a96]">{user.firstName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          {t('header.subtitle')}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell in circle container */}
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`relative w-10 h-10 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all ${
            activeTab === 'notifications' ? 'ring-2 ring-[#093a96]' : ''
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* User Profile Avatar matching Image 3 */}
        <div
          onClick={() => setActiveTab('profile')}
          className="cursor-pointer"
        >
          <img
            src={user.avatarUrl}
            alt={user.firstName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm hover:scale-105 transition-all"
          />
        </div>
      </div>
    </header>
  );
};
