import React from 'react';
import {
  ArrowRight,
  Shield,
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
} from 'lucide-react';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';

export const LandingPage = ({ onGetStarted, onLogin, onOpenAdmin }) => {
  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#0f172a] select-none flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <AlalayLogo size="md" showSubtitle />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#093a96] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#093a96] transition-colors">How it Works</a>
            <a href="#trust-security" className="hover:text-[#093a96] transition-colors">Trust & Security</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="text-sm font-bold text-slate-700 hover:text-[#093a96] cursor-pointer"
            >
              Log In
            </button>
            <IOSButton
              variant="primary"
              size="sm"
              onClick={onGetStarted}
              className="!px-5 !py-2 font-bold shadow-md shadow-blue-900/15"
            >
              Get Started
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
              <span>Official Information Sources</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f172a] leading-[1.15]">
              Government services made{' '}
              <span className="text-[#093a96] underline decoration-blue-200 decoration-wavy decoration-2">
                understandable
              </span>{' '}
              and{' '}
              <span className="text-[#093a96]">
                personalized
              </span>
              .
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              Navigate bureaucratic processes effortlessly. ALALAY uses AI to decode official requirements, match them to your unique profile, and guide you step-by-step.
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
                Get Started Free
              </IOSButton>

              <IOSButton
                variant="secondary"
                size="lg"
                onClick={onGetStarted}
                className="!bg-slate-100 text-slate-700 hover:!bg-slate-200"
              >
                View Demo
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
                  Trusted by 10,000+ citizens
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
                      Passport Renewal
                    </h3>
                    <p className="text-xs text-slate-500">Personalized Guide</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#093a96] text-[10px] font-black tracking-wider uppercase">
                  READY
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#093a96] w-3/4 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-600">
                  3 of 4 documents verified. Next step: Schedule appointment.
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
                <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">AI Match</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tailored exactly to your profile.
                </p>
              </div>

              {/* Secure Card with Eligibility Pill */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-blue-900/5 space-y-2 relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">Secure Vault</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Data encrypted at rest.
                </p>

                {/* Floating pill badge in image */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] animate-ping" />
                    <span>Checking eligibility...</span>
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
            VERIFIED INFORMATION SCRAPED FROM
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
            How ALALAY Works
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We handle the complex bureaucratic parsing so you don't have to. Three simple steps to clarity.
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
              Automated Scraping
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We continuously scan official government portals to ensure our database reflects the most current requirements and forms.
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
              AI Processing
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our legal-grade AI models digest dense bureaucratic jargon and translate it into plain, conversational language.
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
              Personalized Match
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell us a bit about your situation, and ALALAY filters the generic rules to show only the exact steps you personally need to take.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <AlalayLogo size="sm" />
          <p>© 2026 ALALAY Philippines. All official information verified from approved government sources.</p>
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-[#093a96] hover:underline cursor-pointer"
            >
              Super Admin Portal →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
