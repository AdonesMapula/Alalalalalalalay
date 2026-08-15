import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export const IOSBadge = ({
  variant = 'blue', // blue | green | orange | red | purple | gray | egov
  size = 'md', // sm | md
  children,
  icon,
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-[#eef4ff] text-[#093a96] border-blue-200/80',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-indigo-50 text-[#093a96] border-indigo-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    egov: 'bg-[#093a96]/10 text-[#093a96] border-[#093a96]/20 font-bold',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[11px] font-semibold gap-1',
    md: 'px-3 py-1 text-xs font-bold gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border select-none
        ${variantStyles[variant] || variantStyles.blue}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export const EgovVerifiedBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#eef4ff] text-[#093a96] text-[10px] font-black tracking-wider uppercase border border-blue-200/60">
      <Check className="w-3 h-3 stroke-[3]" />
      <span>EGOV VERIFIED</span>
    </span>
  );
};

export const EligibilityStatusBadge = ({ status }) => {
  if (status === 'Likely Eligible' || status === 'Eligible') {
    return (
      <IOSBadge variant="green" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
        Likely Eligible
      </IOSBadge>
    );
  }
  if (status === 'Possibly Eligible') {
    return (
      <IOSBadge variant="blue" icon={<Sparkles className="w-3.5 h-3.5" />}>
        Possibly Eligible
      </IOSBadge>
    );
  }
  return (
    <IOSBadge variant="orange" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
      {status || 'Needs Review'}
    </IOSBadge>
  );
};

export const SourceVerifiedBadge = ({ domain = 'philhealth.gov.ph' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <ShieldCheck className="w-3.5 h-3.5 text-[#093a96]" />
      <span>Source Verified{domain ? `: ${domain}` : ''}</span>
    </div>
  );
};
