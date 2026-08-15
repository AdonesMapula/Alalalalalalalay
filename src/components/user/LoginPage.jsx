import React, { useState } from 'react';
import { Landmark, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { useApp } from '../../context/AppContext';

export const LoginPage = ({ onContinueToVerify, onCancel, onSignUp, onOpenAdmin }) => {
  const { loginWithSupabase } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await loginWithSupabase(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.isAdmin && onOpenAdmin) {
        onOpenAdmin();
      }
    } else {
      onContinueToVerify();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col items-center justify-center p-4 sm:p-6 select-none relative">
      {/* Top bar controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#093a96] cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}

        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            Super Admin Portal →
          </button>
        )}
      </div>

      {/* Main Login Card matching reference design */}
      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-200/80 shadow-xl shadow-blue-900/5 p-8 sm:p-10 space-y-6 text-center animate-in zoom-in-95 duration-200 mt-6">
        {/* Top Logo Emblem inside rounded box */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200/80 shadow-xs p-3 flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
            >
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
            <span className="text-[9px] font-black text-[#093a96] tracking-tight mt-0.5">
              ALALAY
            </span>
          </div>
        </div>

        {/* Brand Titles */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#093a96] tracking-tight">
            ALALAY
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Government services made understandable.
          </p>
        </div>

        {/* Primary CTA: "Sign in with eGov PH" */}
        <div>
          <button
            type="button"
            onClick={onContinueToVerify}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-sm font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Landmark className="w-4 h-4" />
            <span>Sign in with eGov PH</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            or sign in with email
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Dynamic Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#f8fafc] text-slate-800 text-sm rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f8fafc] text-slate-800 text-sm rounded-xl px-4 py-3 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all placeholder:text-slate-400"
            />
            <div className="text-right pt-1.5">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-semibold text-[#093a96] hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Dynamic Login Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-2xl bg-[#093a96] hover:bg-[#072d75] disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-2 text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onSignUp || onContinueToVerify}
            className="font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
