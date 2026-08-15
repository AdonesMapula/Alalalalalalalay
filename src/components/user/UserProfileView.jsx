import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Building,
  HeartHandshake,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSButton } from '../common/IOSButton';
import { IOSBadge } from '../common/IOSBadge';
import { IOSSwitch } from '../common/ToastContainer';

export const UserProfileView = () => {
  const {
    user,
    setUser,
    startOnboardingWizard,
    startGuidedTour,
    addToast,
  } = useApp();

  const [aiNotifications, setAiNotifications] = useState(true);
  const [docAlerts, setDocAlerts] = useState(true);
  const [shareDataForMatching, setShareDataForMatching] = useState(true);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alalay_profile_${user.firstName}_santos.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Profile Exported', 'Your encrypted profile data was downloaded as JSON.', 'success');
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <IOSCard className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1C1C1E]">{user.fullName}</h1>
              <IOSBadge variant="green" icon={<CheckCircle2 className="w-3 h-3" />}>
                eGov Citizen Verified
              </IOSBadge>
            </div>

            <p className="text-xs text-[#8E8E93] font-mono">
              Common Reference Number: {user.egovId}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{user.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Quezon City, NCR</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <IOSButton
              variant="tertiary"
              size="sm"
              icon={RotateCcw}
              onClick={startGuidedTour}
            >
              Replay Tour
            </IOSButton>
            <IOSButton
              variant="secondary"
              size="sm"
              onClick={startOnboardingWizard}
            >
              Re-run Onboarding
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Household & Family Eligibility Status */}
      <IOSCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#FF2D55]" />
            <h2 className="text-base font-bold text-[#1C1C1E]">
              Household & Demographic Parameters
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#007AFF]">Auto-synced</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">Employment Status:</span>
            <span className="font-bold text-slate-800">{user.employmentStatus}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">Income Bracket:</span>
            <span className="font-bold text-slate-800">{user.monthlyIncome}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">Senior Parent Dependent:</span>
            <span className="font-bold text-emerald-700">Yes (Enables PhilHealth RA 10645)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">Civil Status:</span>
            <span className="font-bold text-slate-800">{user.civilStatus}</span>
          </div>
        </div>
      </IOSCard>

      {/* Privacy, Consent & Notifications */}
      <IOSCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#5856D6]" />
          <h2 className="text-base font-bold text-[#1C1C1E]">
            Privacy, Consent & Data Governance
          </h2>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                Proactive AI Opportunity Discovery
              </h4>
              <p className="text-[11px] text-[#8E8E93]">
                Allow ALALAY to continuously evaluate new government circulars against your documents
              </p>
            </div>
            <IOSSwitch checked={aiNotifications} onChange={setAiNotifications} />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                Expiring Document Alerts
              </h4>
              <p className="text-[11px] text-[#8E8E93]">
                Receive proactive reminders before clearances and cards expire
              </p>
            </div>
            <IOSSwitch checked={docAlerts} onChange={setDocAlerts} />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                RA 10173 Privacy Consent Status
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Active • Granted on {new Date(user.consentDate).toLocaleDateString()}
              </p>
            </div>
            <IOSBadge variant="green" size="sm">Granted</IOSBadge>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center gap-3">
          <IOSButton
            variant="tertiary"
            size="sm"
            icon={Download}
            onClick={handleExportData}
          >
            Export Profile JSON
          </IOSButton>
        </div>
      </IOSCard>
    </div>
  );
};
