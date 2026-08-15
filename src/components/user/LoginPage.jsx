import React, { useState } from 'react';
import { Landmark, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logos.png';
import { useApp } from '../../context/AppContext';

export const LoginPage = ({ onContinueToVerify, onCancel, onSignUp }) => {
  const { loginWithSupabase, verifyEgovOtp } = useApp();
  
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'egov'

  // Standard Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // eGov PH Login Flow State
  const [egovStep, setEgovStep] = useState(1); // 1: Email Input | 2: OTP Passcode Input
  const [egovEmail, setEgovEmail] = useState('');
  const [egovOtp, setEgovOtp] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await loginWithSupabase(email, password);
    setIsLoading(false);

    if (result.success) {
      // User is redirected by AppContext state
    } else if (onContinueToVerify) {
      onContinueToVerify();
    }
  };

  const handleEgovEmailSubmit = (e) => {
    e.preventDefault();
    if (!egovEmail) return;
    setEgovStep(2);
  };

  const handleEgovOtpSubmit = async (e) => {
    e.preventDefault();
    if (!egovEmail || !egovOtp) return;

    setIsLoading(true);
    await verifyEgovOtp(egovEmail, egovOtp);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col items-center justify-center p-4 sm:p-6 select-none relative">
      {/* Top bar controls */}
      {onCancel && (
        <div className="absolute top-6 left-6 flex items-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#093a96] cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-200/80 shadow-xl shadow-blue-900/5 p-8 sm:p-10 space-y-6 text-center animate-in zoom-in-95 duration-200 mt-6">
        {/* Top Logo Emblem using logos.png */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200/80 shadow-xs p-2.5 flex flex-col items-center justify-center overflow-hidden">
            <img
              src={logoImg}
              alt="ALALAY Logo"
              className="w-12 h-12 object-contain"
            />
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

        {/* 1. STANDARD LOGIN FORM */}
        {authMode === 'login' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('egov');
                  setEgovStep(1);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-sm font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Landmark className="w-4 h-4" />
                <span>Sign in with eGov PH</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a href="#forgot" className="text-[11px] text-[#093a96] hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#093a96] hover:bg-[#072d75] text-white text-sm font-bold shadow-md shadow-blue-900/15 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* 2. EGOV PH EMAIL & OTP FLOW */}
        {authMode === 'egov' && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-[#093a96] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#093a96] flex-shrink-0" />
                <span className="font-bold">eGov PH Single Sign-On</span>
              </div>
              <span className="text-[10px] font-bold bg-[#093a96] text-white px-2 py-0.5 rounded-full">
                Step {egovStep}/2
              </span>
            </div>

            {/* Step 1: Input Email */}
            {egovStep === 1 ? (
              <form onSubmit={handleEgovEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    eGov Verified Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={egovEmail}
                    onChange={(e) => setEgovEmail(e.target.value)}
                    placeholder="e.g. adones.santos@egov.ph"
                    className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the registered email associated with your verified eGov account.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#141870] hover:bg-[#0c1055] text-white text-sm font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Continue to OTP Verification →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer text-center block"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Input 6-char OTP Passcode */
              <form onSubmit={handleEgovOtpSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      6-Character Passcode / OTP *
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      eGov Gateway Active
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={egovOtp}
                      onChange={(e) => setEgovOtp(e.target.value.toUpperCase())}
                      placeholder="e.g. 891024"
                      className="w-full bg-[#f4f5f8] text-slate-800 text-center tracking-widest font-mono text-lg font-bold rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the 6-character OTP passcode assigned to your profile.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#141870] hover:bg-[#0c1055] text-white text-sm font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEgovStep(1)}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer text-center block"
                  >
                    ← Change Email ({egovEmail})
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
