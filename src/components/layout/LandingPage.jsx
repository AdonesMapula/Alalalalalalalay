import React from 'react';
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  RotateCw,
  Cpu,
  Sliders,
  FileCheck,
  Building,
  Star,
  ExternalLink,
  ChevronRight,
  Users,
  Coins,
} from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';
import { useApp } from '../../context/AppContext';

export const LandingPage = ({ onGetStarted, onLogin, onOpenAdmin }) => {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#0f172a] select-none flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <AlalayLogo size="md" showSubtitle />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#093a96] transition-colors">{t('landing.nav.features')}</a>
            <a href="#how-it-works" className="hover:text-[#093a96] transition-colors">{t('landing.nav.howItWorks')}</a>
            <a href="#trust-security" className="hover:text-[#093a96] transition-colors">{t('landing.nav.trustSecurity')}</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="text-sm font-bold text-slate-700 hover:text-[#093a96] cursor-pointer"
            >
              {t('landing.logIn')}
            </button>
            <IOSButton
              variant="primary"
              size="sm"
              onClick={onGetStarted}
              className="!px-5 !py-2 font-bold shadow-md shadow-blue-900/15"
            >
              {t('landing.getStarted')}
            </IOSButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 sm:px-12 pt-12 pb-20 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#093a96]" />
              <span>{t('landing.badge.sources')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f172a] leading-[1.15]">
              {t('landing.hero.made')}{' '}
              <span className="text-[#093a96] underline ">
                {t('landing.hero.understandable')}
              </span>{' '}
              {t('landing.hero.and')}{' '}
              <span className="text-[#093a96]">
                {t('landing.hero.personalized')}
              </span>
              {t('landing.hero.suffix') ? ` ${t('landing.hero.suffix')}` : ''}.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              {t('landing.hero.desc')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <IOSButton
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={onGetStarted}
                className="!bg-[#093a96] hover:!bg-[#072d75] shadow-lg shadow-blue-900/20"
              >
                {t('landing.hero.ctaPrimary')}
              </IOSButton>

              <IOSButton
                variant="secondary"
                size="lg"
                onClick={onGetStarted}
                className="!bg-slate-100 text-slate-700 hover:!bg-slate-200"
              >
                {t('landing.hero.ctaSecondary')}
              </IOSButton>
            </div>

            {/* Citizen Reviews / Social Proof */}
            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Citizen"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Citizen"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Citizen"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                />
              </div>

              <div>
                <div className="flex items-center text-amber-500 gap-0.5 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  {t('landing.hero.reviewsTrust')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column Floating App Cards (Exact matching Image 2) */}
          <div className="lg:col-span-5 relative space-y-4">
            {/* Top Main Card: Passport Renewal */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-blue-900/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#093a96] text-white flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                      {t('landing.card.passportRenewal')}
                    </h3>
                    <p className="text-xs text-slate-500">{t('landing.card.personalizedGuide')}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#093a96] text-[10px] font-black tracking-wider uppercase">
                  {t('landing.card.ready')}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#093a96] w-3/4 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-600">
                  {t('landing.card.passportProgress')}
                </p>
              </div>
            </div>

            {/* Bottom 2 Split Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* AI Match */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-blue-900/5 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">{t('landing.card.aiMatch')}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {t('landing.card.aiMatchDesc')}
                </p>
              </div>

              {/* Secure Card with Eligibility Pill */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-blue-900/5 space-y-2 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">{t('landing.card.secureVault')}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {t('landing.card.secureVaultDesc')}
                </p>

                {/* Floating pill badge in image */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] animate-ping" />
                    <span>{t('landing.card.checkingEligibility')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Information Scraped From Logos Strip */}
      <section className="border-y border-slate-200/80 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t('landing.verifiedFrom')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-slate-700 font-bold text-sm">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#093a96]" />
              <span>Gov.ph</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#093a96]" />
              <span>DFA Official</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>PhilHealth</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-700" />
              <span>BIR Portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* "How ALALAY Works" 3-Step Section */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Automated Scraping */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 alalay-card-shadow">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[#093a96] relative">
              <RotateCw className="w-8 h-8" />
              <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#093a96] text-white text-[10px] font-bold uppercase">
                Step 1
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0f172a] pt-2">
              {t('landing.howItWorks.step1.title')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.howItWorks.step1.desc')}
            </p>
          </div>

          {/* Step 2: AI Processing */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 alalay-card-shadow">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[#093a96] relative">
              <Cpu className="w-8 h-8" />
              <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#093a96] text-white text-[10px] font-bold uppercase">
                Step 2
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0f172a] pt-2">
              {t('landing.howItWorks.step2.title')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.howItWorks.step2.desc')}
            </p>
          </div>

          {/* Step 3: Personalized Match */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 alalay-card-shadow">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[#093a96] relative">
              <Sliders className="w-8 h-8" />
              <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#093a96] text-white text-[10px] font-bold uppercase">
                Step 3
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0f172a] pt-2">
              {t('landing.howItWorks.step3.title')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.howItWorks.step3.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Security: Transparent Matching Methodology */}
      <section id="trust-security" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full bg-slate-50/60">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#093a96]" />
            <span>{t('landing.trust.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            {t('landing.trust.title')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('landing.trust.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2 alalay-card-shadow">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">{t('landing.trust.demographics.title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.trust.demographics.desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2 alalay-card-shadow">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">{t('landing.trust.economic.title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.trust.economic.desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2 alalay-card-shadow">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">{t('landing.trust.documents.title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.trust.documents.desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2 alalay-card-shadow">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">{t('landing.trust.citizenship.title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('landing.trust.citizenship.desc')}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 max-w-xl mx-auto">
          {t('landing.trust.footnote')}
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <AlalayLogo size="sm" />
          <p>{t('landing.footer.copyright')}</p>
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-[#093a96] hover:underline cursor-pointer"
            >
              {t('landing.footer.adminPortal')}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
