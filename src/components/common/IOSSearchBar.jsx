import React from 'react';
import { Search, X, Mic, Sparkles } from 'lucide-react';

export const IOSSearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search government benefits, services, agencies...',
  className = '',
  autoFocus = false,
  showAiHint = true,
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 text-[#8E8E93] pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-[#E5E5EA]/70 focus:bg-white text-[#1C1C1E] placeholder:text-[#8E8E93] text-sm rounded-2xl pl-10 pr-10 py-2.5 outline-none ring-2 ring-transparent focus:ring-[#007AFF]/30 border border-transparent focus:border-[#007AFF]/40 ios-spring shadow-inner"
      />

      {value ? (
        <button
          type="button"
          onClick={onClear || (() => onChange(''))}
          className="absolute right-3 p-1 rounded-full bg-slate-400 text-white hover:bg-slate-500 cursor-pointer flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      ) : showAiHint ? (
        <div className="absolute right-3 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[#007AFF] text-[10px] font-semibold tracking-wider uppercase pointer-events-none">
          <Sparkles className="w-2.5 h-2.5" />
          <span>AI Search</span>
        </div>
      ) : null}
    </div>
  );
};
