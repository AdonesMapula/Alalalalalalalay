import React, { useState } from 'react';
import { Landmark, ArrowLeft, Shield, Sparkles, Clock, UserCheck, KeyRound } from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { useApp } from '../../context/AppContext';

export const LoginPage = ({ onContinueToVerify, onCancel, onSignUp, onOpenAdmin }) => {
  const { loginWithSupabase, setTempAdminModalOpen, createTempAdminAccount, setViewMode } = useApp();
  
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'adminSignUp'

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin Sign Up State
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('System Admin');

  const handleLoginSubmit = async (e) => {
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

  const handleAdminSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpFirstName || !signUpLastName || !signUpEmail || !signUpPassword) return;

    setIsLoading(true);
    await createTempAdminAccount({
      firstName: signUpFirstName,
      lastName: signUpLastName,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole,
      durationHours: 24,
      autoLogin: true,
    });
    setIsLoading(false);
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthMode('adminSignUp')}
            className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Sign Up</span>
          </button>

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
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-200/80 shadow-xl shadow-blue-900/5 p-8 sm:p-10 space-y-6 text-center animate-in zoom-in-95 duration-200 mt-6">
        {/* Top Logo Emblem */}
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

        {/* Auth Mode Segmented Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#093a96] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Account Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('adminSignUp')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'adminSignUp'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50'
            }`}
          >
            ⚡ Admin Sign Up
          </button>
        </div>

        {/* CONDITIONAL RENDER: LOGIN FORM */}
        {authMode === 'login' ? (
          <>
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

            {/* Login Form */}
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

              {/* Login Submit Button */}
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
          </>
        ) : (
          /* CONDITIONAL RENDER: ADMIN SIGN UP FORM */
          <form onSubmit={handleAdminSignUpSubmit} className="space-y-4 text-left">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Online Admin Registration</span>
              <p className="text-[11px] text-amber-800">
                Input your sign up email & password. Your admin account will be activated and online immediately upon registration.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={signUpFirstName}
                  onChange={(e) => setSignUpFirstName(e.target.value)}
                  placeholder="e.g. Maria"
                  className="w-full bg-[#f8fafc] text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={signUpLastName}
                  onChange={(e) => setSignUpLastName(e.target.value)}
                  placeholder="e.g. Santos"
                  className="w-full bg-[#f8fafc] text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Sign Up Email *
              </label>
              <input
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="admin@alalay.gov.ph"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Account Password *
              </label>
              <input
                type="password"
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Role
              </label>
              <select
                value={signUpRole}
                onChange={(e) => setSignUpRole(e.target.value)}
                className="w-full bg-[#f8fafc] text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white cursor-pointer"
              >
                <option value="System Admin">System Admin (Full Access)</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Content Moderator">Content Moderator</option>
                <option value="Analyst">Analyst</option>
                <option value="Agency Verifier">Agency Verifier</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account...' : 'Sign Up Admin & Put Online'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 text-xs text-slate-500 space-y-2">
          <div>
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={onSignUp || onContinueToVerify}
              className="font-bold text-[#093a96] hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'adminSignUp' ? 'login' : 'adminSignUp')}
              className="font-bold text-amber-700 hover:underline cursor-pointer inline-flex items-center gap-1 text-[11px]"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{authMode === 'adminSignUp' ? '← Back to Account Login' : 'Admin Sign Up (Input Email & Password) →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
