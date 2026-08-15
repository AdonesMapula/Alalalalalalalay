import React from 'react';

export const AlalayLogo = ({ size = 'md', showSubtitle = false, className = '' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Helping Hands Abstract SVG Emblem */}
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded-2xl bg-white border border-blue-100 shadow-sm ${
          isSmall ? 'w-8 h-8 p-1.5' : isLarge ? 'w-12 h-12 p-2.5' : 'w-10 h-10 p-2'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Hands holding / heart connection shape */}
          <path
            d="M50 24C41 12 25 14 18 24C10 35 12 50 25 64L50 88L75 64C88 50 90 35 82 24C75 14 59 12 50 24Z"
            stroke="#093a96"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#eef4ff"
          />
          <path
            d="M34 45C38 40 44 40 48 45L50 47L52 45C56 40 62 40 66 45C70 50 69 57 63 64L50 77L37 64C31 57 30 50 34 45Z"
            fill="#22c55e"
            opacity="0.9"
          />
          <path
            d="M38 34C44 26 56 26 62 34"
            stroke="#0ea5e9"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
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
