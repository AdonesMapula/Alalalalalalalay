import React from 'react';
import { useApp } from '../../context/AppContext';
import logoImg from '../../assets/AIlogos.png';

export const AskAlalayFloatingFab = () => {
  const { askAlalayOpen, setAskAlalayOpen, viewMode, isAuthenticated } = useApp();

  // Only show floating button for authenticated citizen users when modal is closed
  if (askAlalayOpen || viewMode !== 'user' || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none animate-in fade-in zoom-in-95 duration-200">
      <button
        type="button"
        onClick={() => setAskAlalayOpen(true)}
        aria-label="Open Ask ALALAY AI Assistant"
        className="group relative w-14 h-14 rounded-full bg-[#093a96] hover:bg-[#072d75] p-1 flex items-center justify-center shadow-2xl shadow-blue-900/40 border-2 border-white cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Pulsing Online Green Beacon */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>

        {/* ALALAY Circular Logo Emblem */}
        <div className="w-full h-full rounded-full bg-white p-0.25 flex items-center justify-center overflow-hidden shadow-sm group-hover:rotate-6 transition-transform duration-300">
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
