import React from 'react';
import { Home, Compass, Sparkles, MessageSquare, FolderLock, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import aiLogoImg from '../../assets/AIlogos.png';

export const BottomTabBar = () => {
  const { activeTab, setActiveTab, openAskAlalay, unreadCount, t } = useApp();

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'explore', label: t('nav.explore'), icon: Compass },
    { id: 'assistant', label: 'ALALAY', icon: Sparkles, isAi: true },
    { id: 'chat-history', label: t('nav.tab.archives'), icon: MessageSquare },
    { id: 'documents', label: t('nav.tab.docs'), icon: FolderLock },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-2xl border-t border-[#E5E5EA] px-3 py-2 flex items-center justify-around safe-area-inset-bottom shadow-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (tab.isAi) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => openAskAlalay()}
              className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] p-0.5 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-active:scale-95 ios-spring">
                <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                  <img src={aiLogoImg} alt="Ask AI" className="w-full h-full object-contain" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#5856D6] mt-1">{t('nav.askAi')}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl ios-spring cursor-pointer relative ${
              isActive ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
            {tab.id === 'notifications' && unreadCount > 0 && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
