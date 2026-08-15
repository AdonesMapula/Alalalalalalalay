import React, { useState, useEffect } from 'react';
import {
  Check,
  Mail,
  Phone,
  MapPin,
  Cloud,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';
import { EgovVerifiedBadge } from '../common/IOSBadge';
import { useApp } from '../../context/AppContext';

export const OnboardingWizard = ({ onCancel }) => {
  const { user, setUser, completeOnboardingWizard, logout } = useApp();

  // Wizard Steps:
  // 1: Identity Form (Image 1)
  // 2: Syncing Data Radar Animation (Image 4)
  // 3: Security & Complete
  const [step, setStep] = useState(1);

  // Form State matching Image 1
  const [firstName, setFirstName] = useState(user.firstName || 'Adones');
  const [lastName, setLastName] = useState(user.lastName || 'Santos');
  const [middleName, setMiddleName] = useState(user.middleName || 'Mendoza');
  const [email, setEmail] = useState(user.email || 'adones.santos@egov.ph');
  const [mobileNumber, setMobileNumber] = useState(user.phone || '+63 917 842 1099');
  const [currentAddress, setCurrentAddress] = useState(user.address || 'Unit 402, Katipunan Ave, Quezon City, Metro Manila');

  // Syncing Simulation State (Image 4)
  const [syncStage, setSyncStage] = useState(1);

  useEffect(() => {
    if (step === 2) {
      const timer1 = setTimeout(() => setSyncStage(2), 1200);
      const timer2 = setTimeout(() => setSyncStage(3), 2400);
      const timer3 = setTimeout(() => {
        setUser((prev) => ({
          ...prev,
          firstName,
          lastName,
          middleName,
          fullName: `${firstName} ${middleName} ${lastName}`,
          email,
          phone: mobileNumber,
          address: currentAddress,
        }));
        completeOnboardingWizard();
      }, 3600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-6 sm:p-10 select-none">
      {/* Top Header Logo */}
      <div className="w-full flex justify-center py-2">
        <AlalayLogo size="md" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-lg w-full my-auto space-y-8">
        {/* STEP 1: Verify Your Identity (Image 1) */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Top Stepper */}
            <div className="flex items-center justify-center gap-12 text-xs font-semibold">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-[#093a96] text-white flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[#093a96] font-bold">Identity</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-slate-600">Security</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-slate-600">Complete</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Verify Your Identity
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Review the details retrieved from your eGov account. You can update your contact information if needed.
              </p>
            </div>

            {/* Form Card (Exact match to Image 1) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative">
              {/* EGOV VERIFIED Badge */}
              <div className="flex justify-end">
                <EgovVerifiedBadge />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100" />

              {/* Email with mail icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-slate-800 text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96]"
                  />
                </div>
              </div>

              {/* Mobile with phone icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-white text-slate-800 text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96]"
                  />
                </div>
              </div>

              {/* Address with location icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Address
                </label>
                <div className="relative flex items-start">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-2 text-center">
              <IOSButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setStep(2)}
                className="!bg-[#093a96] hover:!bg-[#072d75] py-3.5 font-bold shadow-md shadow-blue-900/15"
              >
                Continue to Security
              </IOSButton>

              <button
                type="button"
                onClick={() => (onCancel ? onCancel() : logout())}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer block mx-auto pt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Syncing Data (Image 4) */}
        {step === 2 && (
          <div className="text-center space-y-8 py-8 animate-in fade-in duration-300">
            {/* Glowing Radar Pulse Animation matching Image 4 */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              {/* Outer soft glowing ambient ring */}
              <div className="absolute inset-0 rounded-full bg-indigo-100/60 blur-xl animate-pulse-ring" />
              <div className="absolute inset-3 rounded-full bg-indigo-50/80 border border-indigo-200/50" />

              {/* Inner Circle with Cloud + Sync */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center gap-1.5 text-[#093a96]">
                <Cloud className="w-5 h-5 fill-blue-50" />
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                Syncing Data
              </h2>
              <p className="text-xs text-slate-500">Connecting to eGov...</p>
            </div>

            {/* Checklist items matching Image 4 */}
            <div className="max-w-xs mx-auto text-left space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-[#093a96] font-bold">
                <div className="w-4 h-4 rounded-full bg-[#093a96] text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>Secure connection established</span>
              </div>

              <div
                className={`flex items-center gap-2.5 ${
                  syncStage >= 2 ? 'text-[#093a96] font-bold' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    syncStage >= 2 ? 'bg-[#093a96] text-white' : 'border border-slate-300'
                  }`}
                >
                  {syncStage >= 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </div>
                <span>Verifying account details</span>
              </div>

              <div
                className={`flex items-center gap-2.5 ${
                  syncStage >= 3 ? 'text-[#093a96] font-bold' : 'text-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    syncStage >= 3 ? 'bg-[#093a96] text-white' : 'border border-slate-200'
                  }`}
                >
                  {syncStage >= 3 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </div>
                <span>Retrieving identity documents</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel Simulation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-[11px] text-slate-400 font-medium text-center">
        Republic of the Philippines • Verified eGov Simulation Portal
      </div>
    </div>
  );
};
