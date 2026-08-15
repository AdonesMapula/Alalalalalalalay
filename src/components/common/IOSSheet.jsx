import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const IOSSheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  height = 'max-h-[90vh]',
  showDragHandle = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Sheet Container */}
      <div
        className={`
          relative w-full ${maxWidth} ${height}
          bg-[#F2F2F7] sm:bg-white
          rounded-t-[32px] sm:rounded-3xl
          border border-[#E5E5EA]
          ios-modal-shadow
          flex flex-col
          overflow-hidden
          z-10
          ios-spring
          transform animate-in slide-in-from-bottom-8 duration-300
        `}
      >
        {/* iOS Drag Handle for mobile */}
        {showDragHandle && (
          <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 rounded-full bg-[#AEAEB2]/60" />
          </div>
        )}

        {/* Sheet Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E5EA]/70 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            {title && <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1E]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#8E8E93] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#E5E5EA]/80 hover:bg-[#D1D1D6] text-[#1C1C1E] cursor-pointer ios-spring flex items-center justify-center flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
