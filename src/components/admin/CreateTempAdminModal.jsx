import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  KeyRound,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';

export const CreateTempAdminModal = () => {
  const {
    tempAdminModalOpen,
    setTempAdminModalOpen,
    createTempAdminAccount,
  } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('System Admin');
  const [durationHours, setDurationHours] = useState(24);
  const [otpCode, setOtpCode] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const [autoLogin, setAutoLogin] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(randomOtp);
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    await createTempAdminAccount({
      firstName,
      lastName,
      email,
      role,
      durationHours: Number(durationHours),
      otpCode,
      autoLogin,
    });

    // Reset Form
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('System Admin');
    setDurationHours(24);
    setAutoLogin(false);
    setTempAdminModalOpen(false);
  };

  const durationOptions = [
    { label: '12 Hours', value: 12 },
    { label: '24 Hours', value: 24 },
    { label: '48 Hours', value: 48 },
    { label: '7 Days', value: 168 },
    { label: '30 Days', value: 720 },
  ];

  return (
    <IOSSheet
      isOpen={tempAdminModalOpen}
      onClose={() => setTempAdminModalOpen(false)}
      title="Create Temporary Admin Account"
      subtitle="Register time-bounded administrator credentials with instant activation & security passcodes"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 select-none">
        {/* Banner Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>Time-Bounded Security Access</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                Temp Admin
              </span>
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Temporary admin accounts grant privileged access for audits, debugging, or temporary moderation. Credentials automatically deactivate upon expiration.
            </p>
          </div>
        </div>

        {/* 1. Admin Info Fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#093a96]" />
            <span>1. Admin Account Information</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Juan"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Dela Cruz"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="temp.admin@gov.ph"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Privilege Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all cursor-pointer"
              >
                <option value="System Admin">System Admin (Full Access)</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Content Moderator">Content Moderator</option>
                <option value="Analyst">Analyst</option>
                <option value="Agency Verifier">Agency Verifier</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Access Duration Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Temporary Access Expiration Duration</span>
            </span>
            <span className="text-[11px] font-bold text-amber-700">
              Valid for {durationHours} Hour{durationHours > 1 ? 's' : ''}
            </span>
          </label>

          <div className="grid grid-cols-5 gap-2">
            {durationOptions.map((opt) => {
              const selected = durationHours === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDurationHours(opt.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    selected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-900/10'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 6-Character Temporary Security Passcode */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#093a96]">
              <KeyRound className="w-4 h-4 text-[#093a96]" />
              <span>3. Temporary 6-Char OTP Passcode</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateOtp}
              className="text-[11px] font-bold text-[#093a96] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Generate New OTP</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                className="w-full font-mono font-black text-center text-xl tracking-widest bg-white rounded-xl px-4 py-2 border border-indigo-200 focus:border-[#093a96] outline-none text-[#093a96] shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyOtp}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-xs font-bold text-[#093a96] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Auto Login Toggle */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <input
            type="checkbox"
            id="autoLoginCheck"
            checked={autoLogin}
            onChange={(e) => setAutoLogin(e.target.checked)}
            className="w-4 h-4 rounded text-[#093a96] focus:ring-[#093a96] border-slate-300 cursor-pointer"
          />
          <label htmlFor="autoLoginCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
            Automatically sign in as this temporary admin immediately after creation
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <IOSButton
            variant="secondary"
            size="md"
            onClick={() => setTempAdminModalOpen(false)}
          >
            Cancel
          </IOSButton>

          <IOSButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            icon={UserCheck}
            className="!bg-amber-600 hover:!bg-amber-700 font-bold shadow-md shadow-amber-950/20"
          >
            Activate Temporary Admin Account
          </IOSButton>
        </div>
      </form>
    </IOSSheet>
  );
};
