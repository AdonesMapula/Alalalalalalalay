import React from 'react';

export const IOSCard = ({
  children,
  className = '',
  onClick,
  glass = false,
  highlight = false,
  padding = 'p-5 sm:p-6',
  hoverable = false,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl sm:rounded-3xl
        ${glass ? 'ios-glass' : 'bg-white'}
        ${highlight ? 'ring-2 ring-[#007AFF] shadow-lg shadow-blue-500/10' : 'border border-[#E5E5EA]/70 ios-card-shadow'}
        ${padding}
        ${hoverable || isClickable ? 'cursor-pointer ios-spring hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
