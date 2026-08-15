import React from 'react';
import { Info, ShieldAlert, Sparkles } from 'lucide-react';

export const SimulationBanner = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        <span className="flex h-2 w-2 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <p className="font-medium flex-1 truncate">
          <strong className="font-semibold text-amber-800">Simulation Mode — eGov Integration Preview:</strong> Real eGov database is not connected. Demonstrating AI policy verification and citizen matching.
        </p>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-semibold tracking-wide text-amber-900 uppercase">
          Prototype
        </span>
      </div>
    </div>
  );
};
