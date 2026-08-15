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
  FileText,
  BadgeCheck,
  FolderLock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';
import { EgovVerifiedBadge } from '../common/IOSBadge';
import { useApp } from '../../context/AppContext';

export const OnboardingWizard = ({ onCancel }) => {
  const { user, setUser, completeOnboardingWizard, logout } = useApp();

  // Wizard Steps:
  // 1: Identity Form (Personal Details auto-filled from Admin)
  // 2: Security & Data Privacy Consent
  // 3: Document Retrieval & Synchronizing Super Admin Documents
  const [step, setStep] = useState(1);

  // Form State initialized dynamically from user details saved by the admin (NO hardcoded fallback)
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || '');
  const [middleName, setMiddleName] = useState(user?.middleName || user?.middle_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [currentAddress, setCurrentAddress] = useState(user?.address || '');

  // Step 2 Permissions State
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [eGovSyncAuthorized, setEGovSyncAuthorized] = useState(true);

  // Step 3 Syncing Simulation State
  const [syncStage, setSyncStage] = useState(1);
  const [syncComplete, setSyncComplete] = useState(false);

  // Auto-fill state if user object updates
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.first_name || '');
      setLastName(user.lastName || user.last_name || '');
      setMiddleName(user.middleName || user.middle_name || '');
      setEmail(user.email || '');
      setMobileNumber(user.phone || '');
      setCurrentAddress(user.address || '');
    }
  }, [user]);

  // Step 3 sync progression
  useEffect(() => {
    if (step === 3) {
      setSyncStage(1);
      setSyncComplete(false);
      const timer1 = setTimeout(() => setSyncStage(2), 1000);
      const timer2 = setTimeout(() => setSyncStage(3), 2000);
      const timer3 = setTimeout(() => {
        setSyncStage(4);
        setSyncComplete(true);
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  // Retrieve ONLY the documents saved by Super Admin for this user (NO hardcoded fallback)
  const adminSavedDocs = (user?.documents && user.documents.length > 0) ? user.documents : [];

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      firstName,
      lastName,
      middleName,
      fullName: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
      email,
      phone: mobileNumber,
      address: currentAddress,
    }));
    setStep(2);
  };

  const handleFinishOnboarding = () => {
    completeOnboardingWizard(adminSavedDocs);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Top Header Logo */}
      <div className="w-full flex justify-center py-2">
        <AlalayLogo size="md" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-lg w-full my-auto space-y-6">
        {/* TOP STEPPER PROGRESS BAR */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 text-xs font-semibold">
          {/* Step 1: Identity */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => step > 1 && setStep(1)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold transition-all ${
              step >= 1 ? 'bg-[#093a96] text-white' : 'bg-slate-100 border border-slate-300 text-slate-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <span className={`text-[11px] ${step >= 1 ? 'text-[#093a96] font-bold' : 'text-slate-500'}`}>Identity</span>
          </div>

          {/* Step 2: Security */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => step > 2 && setStep(2)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold transition-all ${
              step >= 2 ? 'bg-[#093a96] text-white' : 'bg-slate-100 border border-slate-300 text-slate-600'
            }`}>
              {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </div>
            <span className={`text-[11px] ${step >= 2 ? 'text-[#093a96] font-bold' : 'text-slate-500'}`}>Security</span>
          </div>

          {/* Step 3: Documents */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm font-bold transition-all ${
              step >= 3 ? 'bg-[#093a96] text-white' : 'bg-slate-100 border border-slate-300 text-slate-600'
            }`}>
              {syncComplete ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
            </div>
            <span className={`text-[11px] ${step >= 3 ? 'text-[#093a96] font-bold' : 'text-slate-500'}`}>Documents</span>
          </div>
        </div>

        {/* STEP 1: VERIFY YOUR IDENTITY (AUTOFILLED FROM ADMIN) */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Verify Your Identity
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Review your official details registered by the administrator. You may update your contact information before proceeding.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Admin Verified Records
                </span>
                <EgovVerifiedBadge />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Maria"
                    className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
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
                    placeholder="e.g. Santos"
                    className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Mendoza"
                  className="w-full bg-[#f4f5f8] text-slate-800 text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-[#093a96] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 border-t border-slate-100" />

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-white text-slate-800 text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] transition-all"
                  />
                </div>
              </div>

              {/* Mobile */}
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
                    placeholder="+63 917 000 0000"
                    className="w-full bg-white text-slate-800 text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] transition-all"
                  />
                </div>
              </div>

              {/* Address */}
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
                    placeholder="Barangay, City, Province"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-center">
              <IOSButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="!bg-[#093a96] hover:!bg-[#072d75] py-3.5 font-bold shadow-md shadow-blue-900/15"
              >
                Continue to Step 2: Security & Permissions →
              </IOSButton>

              <button
                type="button"
                onClick={() => (onCancel ? onCancel() : logout())}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer block mx-auto pt-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SECURITY & DATA PRIVACY CONSENT */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Security & Data Consent
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Configure your digital identity protection and authorize document verification.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-left">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-[#093a96] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#093a96] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Republic Act 10173 Protected</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Your personal information is encrypted and processed in strict compliance with the Philippine Data Privacy Act.
                  </p>
                </div>
              </div>

              {/* Toggle 1: Biometric */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-slate-800 block">Biometric & Passcode Protection</span>
                  <p className="text-[11px] text-slate-500">Require eGov OTP passcode validation for sensitive clearance downloads.</p>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#093a96] rounded cursor-pointer"
                />
              </div>

              {/* Toggle 2: eGov Sync Authorization */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-bold text-slate-800 block">Super Admin Vault Synchronization</span>
                  <p className="text-[11px] text-slate-500">Allow ALALAY to retrieve and sync all verified documents saved by the administrator.</p>
                </div>
                <input
                  type="checkbox"
                  checked={eGovSyncAuthorized}
                  onChange={(e) => setEGovSyncAuthorized(e.target.checked)}
                  className="w-5 h-5 accent-[#093a96] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-center">
              <IOSButton
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setStep(3)}
                className="!bg-[#093a96] hover:!bg-[#072d75] py-3.5 font-bold shadow-md shadow-blue-900/15"
              >
                Authorize & Fetch Documents (Step 3) →
              </IOSButton>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer block mx-auto pt-1"
              >
                ← Back to Identity Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENT RETRIEVAL & SYNCHRONIZING SUPER ADMIN DOCUMENTS */}
        {step === 3 && (
          <div className="text-center space-y-6 py-2 animate-in fade-in duration-300">
            {/* Glowing Radar Pulse Animation */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-100/60 blur-xl animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full bg-blue-50/80 border border-blue-200/50" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center gap-1.5 text-[#093a96]">
                <Cloud className="w-5 h-5 fill-blue-50" />
                {syncComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#093a96]" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                {syncComplete ? 'Documents Synchronized!' : 'Fetching Documents from Super Admin...'}
              </h2>
              <p className="text-xs text-slate-500">
                {syncComplete
                  ? `Retrieved ${adminSavedDocs.length} verified documents from the Super Admin vault.`
                  : 'Retrieving official government clearances and ID cards from the database...'}
              </p>
            </div>

            {/* Checklist Progression */}
            <div className="max-w-sm mx-auto text-left space-y-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2.5 text-[#093a96] font-bold">
                <div className="w-4 h-4 rounded-full bg-[#093a96] text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>eGov secure gateway connected</span>
              </div>

              <div className={`flex items-center gap-2.5 ${syncStage >= 2 ? 'text-[#093a96] font-bold' : 'text-slate-400'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  syncStage >= 2 ? 'bg-[#093a96] text-white' : 'border border-slate-300'
                }`}>
                  {syncStage >= 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </div>
                <span>Account identity and OTP verified</span>
              </div>

              <div className={`flex items-center gap-2.5 ${syncStage >= 3 ? 'text-[#093a96] font-bold' : 'text-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  syncStage >= 3 ? 'bg-[#093a96] text-white' : 'border border-slate-200'
                }`}>
                  {syncStage >= 3 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                </div>
                <span>Fetched {adminSavedDocs.length} documents saved by Super Admin</span>
              </div>
            </div>

            {/* RETRIEVED DOCUMENTS CARDS */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 text-left space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-[#093a96]" />
                  <span>Retrieved Verified Documents ({adminSavedDocs.length})</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Vault Ready
                </span>
              </div>

              {adminSavedDocs.length > 0 ? (
                <div className="space-y-2">
                  {adminSavedDocs.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {doc.type || 'Government ID'} • {doc.fileSize || doc.size || '1.4 MB'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        <span>Admin Verified</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200/80">
                  No documents were uploaded by the admin for this account yet. You can upload verification documents directly inside your vault anytime.
                </div>
              )}
            </div>

            {/* Complete Setup Action */}
            <div className="pt-2">
              <IOSButton
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!syncComplete}
                onClick={handleFinishOnboarding}
                className="!bg-[#093a96] hover:!bg-[#072d75] disabled:opacity-50 py-3.5 font-bold shadow-md shadow-blue-900/15"
              >
                {syncComplete ? 'Complete Setup & Open Citizen Dashboard' : 'Syncing Vault Documents...'}
              </IOSButton>
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
