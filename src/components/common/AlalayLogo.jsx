import React from 'react';
import logoImg from '../../assets/logos.png';

export const AlalayLogo = ({ size = 'md', showSubtitle = false, className = '' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Helping Hands Logo Emblem from assets */}
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden ${
          isSmall ? 'w-8 h-8 p-1' : isLarge ? 'w-12 h-12 p-1.5' : 'w-10 h-10 p-1'
        }`}
      >
        <img
          src={logoImg}
          alt="ALALAY Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-[#093a96] leading-none ${
              isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'
            }`}
          >
            ALALAY
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 leading-tight">
            AI Government Assistant
          </p>
        )}
      </div>
    </div>
  );
};
