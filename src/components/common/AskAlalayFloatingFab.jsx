import React from 'react';
import { useApp } from '../../context/AppContext';
import logoImg from '../../assets/AIlogos.png';

export const AskAlalayFloatingFab = () => {
  const { askAlalayOpen, setAskAlalayOpen, viewMode, isAuthenticated, t } = useApp();

  // Only show floating button for authenticated citizen users when modal is closed
  if (askAlalayOpen || viewMode !== 'user' || !isAuthenticated) return null;

  return (
    <div className="group fixed bottom-6 right-6 z-40 select-none animate-in fade-in zoom-in-95 duration-200 flex items-center gap-3">
      {/* Ask Me Anything Prompt Bubble — only visible while hovering the owl button */}
      <span
        className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-lg text-xs font-bold text-[#093a96] whitespace-nowrap opacity-0 translate-x-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
      >
        {t('common.askMeAnything')}
      </span>

      <button
        type="button"
        onClick={() => setAskAlalayOpen(true)}
        aria-label="Open Ask ALALAY AI Assistant"
        className="relative w-20 h-20 rounded-full bg-[#093a96] hover:bg-[#072d75] p-1.5 flex items-center justify-center shadow-2xl shadow-blue-900/40 border-2 border-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Pulsing Online Green Beacon */}
        <span className="absolute top-1 right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
        </span>

        {/* ALALAY Circular Logo Emblem */}
        <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:rotate-6 transition-transform duration-300">
          <img
            src={logoImg}
            alt="ALALAY Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </button>
    </div>
  );
};
