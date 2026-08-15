import React from 'react';

export const IOSSegmentedControl = ({
  options = [], // [{ id: 'all', label: 'All', icon?: Icon }]
  value,
  onChange,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center p-1 rounded-2xl bg-[#E5E5EA]/80 backdrop-blur-md select-none w-full sm:w-auto
        ${className}
      `}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl font-medium cursor-pointer ios-spring
              ${size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'}
              ${
                isActive
                  ? 'bg-white text-[#1C1C1E] shadow-sm font-semibold'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5'
              }
            `}
          >
            {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="truncate">{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-black/10 text-gray-600'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
