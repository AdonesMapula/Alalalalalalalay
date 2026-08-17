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
  Zap,
  Bot,
  UserCheck,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSButton } from '../common/IOSButton';
import { IOSBadge } from '../common/IOSBadge';
import { IOSSwitch } from '../common/ToastContainer';
import { IOSSheet } from '../common/IOSSheet';

export const UserProfileView = () => {
  const {
    user,
    setUser,
    categories,
    startOnboardingWizard,
    startGuidedTour,
    addToast,
    language,
    setLanguage,
    t,
  } = useApp();

  const [aiNotifications, setAiNotifications] = useState(true);
  const [docAlerts, setDocAlerts] = useState(true);
  const [shareDataForMatching, setShareDataForMatching] = useState(true);

  const autoApplyCategoryOptions = categories.filter((c) => c.id !== 'all' && c.id !== 'employment');
  const defaultAutoApplyCategories = autoApplyCategoryOptions.map((c) => c.id);
  const selectedAutoApplyCategories = user.autoApplyCategories || defaultAutoApplyCategories;

  const [showAutoApplyConsent, setShowAutoApplyConsent] = useState(false);
  const [pendingAutoApplyMode, setPendingAutoApplyMode] = useState('confirm');

  const handleChangeLanguage = (lang) => {
    setLanguage(lang);
    addToast(
      lang === 'fil' ? 'Nabago ang Wika' : 'Language Changed',
      lang === 'fil' ? 'Naka-set na ngayon sa Filipino ang ALALAY.' : 'ALALAY is now set to English.',
      'success'
    );
  };

  const handleToggleAutoApply = (enabled) => {
    if (!enabled) {
      setUser((prev) => ({ ...prev, autoApplyEnabled: false }));
      addToast('Auto-Apply Disabled', 'ALALAY will no longer auto-queue or submit applications for you.', 'info');
      return;
    }

    // Turning on always requires the citizen to (re)confirm consent and choose a mode,
    // since this authorizes ALALAY to act on real government applications.
    setPendingAutoApplyMode(user.autoApplyMode || 'confirm');
    setShowAutoApplyConsent(true);
  };

  const handleConfirmAutoApplyConsent = () => {
    setUser((prev) => ({
      ...prev,
      autoApplyEnabled: true,
      autoApplyConsentGiven: true,
      autoApplyMode: pendingAutoApplyMode,
      autoApplyCategories:
        prev.autoApplyCategories && prev.autoApplyCategories.length > 0
          ? prev.autoApplyCategories
          : defaultAutoApplyCategories,
    }));
    setShowAutoApplyConsent(false);
    addToast(
      'Auto-Apply Enabled',
      pendingAutoApplyMode === 'autonomous'
        ? "You consented to full automation — ALALAY will submit 95%+ Likely Eligible matches for you and notify you afterward."
        : "ALALAY will queue 95%+ Likely Eligible matches for you — you'll still tap Submit yourself.",
      'success'
    );
  };

  const toggleAutoApplyCategory = (categoryId) => {
    setUser((prev) => {
      const current = prev.autoApplyCategories || defaultAutoApplyCategories;
      const updated = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId];
      return { ...prev, autoApplyCategories: updated };
    });
  };

  const handleToggleAutoApplyJobs = (enabled) => {
    setUser((prev) => ({ ...prev, autoApplyIncludeJobs: enabled }));
  };

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
                {t('profile.eGovVerified')}
              </IOSBadge>
            </div>

            <p className="text-xs text-[#8E8E93] font-mono">
              {t('profile.crn')}: {user.egovId}
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
              {t('profile.replayTour')}
            </IOSButton>
            <IOSButton
              variant="secondary"
              size="sm"
              onClick={startOnboardingWizard}
            >
              {t('profile.reRunOnboarding')}
            </IOSButton>
          </div>
        </div>
      </IOSCard>

      {/* Language */}
      <IOSCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#34C759]" />
          <h2 className="text-base font-bold text-[#1C1C1E]">
            {t('common.language')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChangeLanguage('en')}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t('common.english')}
          </button>
          <button
            type="button"
            onClick={() => handleChangeLanguage('fil')}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              language === 'fil'
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t('common.filipino')}
          </button>
        </div>
      </IOSCard>

      {/* Household & Family Eligibility Status */}
      <IOSCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#FF2D55]" />
            <h2 className="text-base font-bold text-[#1C1C1E]">
              {t('profile.household.title')}
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#007AFF]">{t('profile.household.autoSynced')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">{t('profile.household.employment')}</span>
            <span className="font-bold text-slate-800">{user.employmentStatus}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">{t('profile.household.income')}</span>
            <span className="font-bold text-slate-800">{user.monthlyIncome}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">{t('profile.household.seniorParent')}</span>
            <span className="font-bold text-emerald-700">Yes (Enables PhilHealth RA 10645)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between">
            <span className="text-slate-500">{t('profile.household.civilStatus')}</span>
            <span className="font-bold text-slate-800">{user.civilStatus}</span>
          </div>
        </div>
      </IOSCard>

      {/* Auto-Apply Assistant */}
      <IOSCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#FF9500]" />
          <h2 className="text-base font-bold text-[#1C1C1E]">
            {t('profile.autoApply.title')}
          </h2>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="pr-4">
            <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
              {t('profile.autoApply.enable')}
            </h4>
            <p className="text-[11px] text-[#8E8E93]">
              {t('profile.autoApply.enableDesc')}
            </p>
          </div>
          <IOSSwitch checked={Boolean(user.autoApplyEnabled)} onChange={handleToggleAutoApply} />
        </div>

        {user.autoApplyEnabled && (
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {user.autoApplyMode === 'autonomous' ? (
                  <Bot className="w-4 h-4 text-[#093a96] flex-shrink-0" />
                ) : (
                  <UserCheck className="w-4 h-4 text-[#093a96] flex-shrink-0" />
                )}
                <span className="text-[11px] font-bold text-[#1C1C1E]">
                  {user.autoApplyMode === 'autonomous'
                    ? t('profile.autoApply.modeAutonomous')
                    : t('profile.autoApply.modeConfirm')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingAutoApplyMode(user.autoApplyMode || 'confirm');
                  setShowAutoApplyConsent(true);
                }}
                className="text-[11px] font-bold text-[#007AFF] hover:underline cursor-pointer"
              >
                {t('profile.autoApply.change')}
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1C1C1E]">{t('profile.autoApply.categories')}</h4>
              <p className="text-[11px] text-[#8E8E93]">
                {t('profile.autoApply.categoriesDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {autoApplyCategoryOptions.map((cat) => {
                  const isSelected = selectedAutoApplyCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleAutoApplyCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#007AFF] text-white border-[#007AFF]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="pr-4">
                <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                  {t('profile.autoApply.jobs')}
                </h4>
                <p className="text-[11px] text-[#8E8E93]">
                  {t('profile.autoApply.jobsDesc')}
                </p>
              </div>
              <IOSSwitch checked={Boolean(user.autoApplyIncludeJobs)} onChange={handleToggleAutoApplyJobs} />
            </div>
          </div>
        )}
      </IOSCard>

      {/* Privacy, Consent & Notifications */}
      <IOSCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#5856D6]" />
          <h2 className="text-base font-bold text-[#1C1C1E]">
            {t('profile.privacy.title')}
          </h2>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                {t('profile.privacy.aiDiscovery')}
              </h4>
              <p className="text-[11px] text-[#8E8E93]">
                {t('profile.privacy.aiDiscoveryDesc')}
              </p>
            </div>
            <IOSSwitch checked={aiNotifications} onChange={setAiNotifications} />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                {t('profile.privacy.docAlerts')}
              </h4>
              <p className="text-[11px] text-[#8E8E93]">
                {t('profile.privacy.docAlertsDesc')}
              </p>
            </div>
            <IOSSwitch checked={docAlerts} onChange={setDocAlerts} />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                {t('profile.privacy.consentStatus')}
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Active • Granted on {new Date(user.consentDate).toLocaleDateString()}
              </p>
            </div>
            <IOSBadge variant="green" size="sm">{t('profile.privacy.granted')}</IOSBadge>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center gap-3">
          <IOSButton
            variant="tertiary"
            size="sm"
            icon={Download}
            onClick={handleExportData}
          >
            {t('profile.privacy.exportProfile')}
          </IOSButton>
        </div>
      </IOSCard>

      {/* Auto-Apply Consent Modal — required every time the toggle is turned on or the mode is changed */}
      <IOSSheet
        isOpen={showAutoApplyConsent}
        onClose={() => setShowAutoApplyConsent(false)}
        title={t('profile.consent.title')}
        subtitle={t('profile.consent.subtitle')}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 select-none">
          <button
            type="button"
            onClick={() => setPendingAutoApplyMode('confirm')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
              pendingAutoApplyMode === 'confirm'
                ? 'border-[#007AFF] bg-blue-50/60'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#093a96] flex-shrink-0" />
              <span className="text-sm font-bold text-[#1C1C1E]">{t('profile.consent.confirmEach')}</span>
              <IOSBadge variant="blue" size="sm">{t('profile.consent.recommended')}</IOSBadge>
            </div>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              {t('profile.consent.confirmEachDesc')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPendingAutoApplyMode('autonomous')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
              pendingAutoApplyMode === 'autonomous'
                ? 'border-[#007AFF] bg-blue-50/60'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#093a96] flex-shrink-0" />
              <span className="text-sm font-bold text-[#1C1C1E]">{t('profile.consent.fullAuto')}</span>
            </div>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              {t('profile.consent.fullAutoDesc')}
            </p>
          </button>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              {t('profile.consent.disclaimer')}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <IOSButton variant="secondary" size="md" onClick={() => setShowAutoApplyConsent(false)}>
              {t('profile.consent.cancel')}
            </IOSButton>
            <IOSButton variant="primary" size="md" onClick={handleConfirmAutoApplyConsent}>
              {t('profile.consent.agree')}
            </IOSButton>
          </div>
        </div>
      </IOSSheet>
    </div>
  );
};
