import React from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle, Compass, FolderLock, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';

export const GuidedTour = () => {
  const { guidedTourActive, guidedTourStep, nextTourStep, prevTourStep, endGuidedTour } = useApp();

  if (!guidedTourActive) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'Welcome to ALALAY Dashboard',
      description: 'Your personalized home for discovering verified Philippine government opportunities, benefits, and statutory discounts.',
      tag: 'Step 1 of 7: Dashboard',
    },
    {
      step: 2,
      title: 'Explore Categories',
      description: 'Browse curated programs across Health, Finance, Education, Housing, Social Services, and Discounts with ease.',
      tag: 'Step 2 of 7: Categories',
    },
    {
      step: 3,
      title: 'AI Recommendations',
      description: 'ALALAY automatically compares your profile & documents with government circulars to surface personalized matches.',
      tag: 'Step 3 of 7: Matching',
    },
    {
      step: 4,
      title: 'Transparent Eligibility Status',
      description: 'Instantly view whether you are Likely Eligible, what requirements you already meet, and what documents are missing.',
      tag: 'Step 4 of 7: Eligibility',
    },
    {
      step: 5,
      title: 'Ask ALALAY Contextual Assistant',
      description: 'Have questions about a policy? The AI assistant answers strictly using official scraped sources and cites government URLs.',
      tag: 'Step 5 of 7: AI Assistant',
    },
    {
      step: 6,
      title: 'Secure Citizen Document Vault',
      description: 'Keep track of your National ID, PhilHealth MDR, clearances, and receive proactive alerts before documents expire.',
      tag: 'Step 6 of 7: Documents',
    },
    {
      step: 7,
      title: 'Manage Profile & Privacy Consent',
      description: 'Review your retrieved eGov credentials, update family dependents, and control data privacy preferences.',
      tag: 'Step 7 of 7: Profile',
    },
  ];

  const current = tourSteps[guidedTourStep - 1] || tourSteps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={endGuidedTour}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      {/* Tour Card */}
      <div className="relative z-10 max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 ios-spring transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#007AFF] text-xs font-bold uppercase tracking-wider">
            {current.tag}
          </span>
          <button
            type="button"
            onClick={endGuidedTour}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] mb-3">
          {current.title}
        </h3>

        <p className="text-sm sm:text-base text-[#8E8E93] leading-relaxed mb-6">
          {current.description}
        </p>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((s) => (
              <div
                key={s.step}
                className={`h-2 rounded-full ios-spring ${
                  s.step === guidedTourStep
                    ? 'w-6 bg-[#007AFF]'
                    : s.step < guidedTourStep
                    ? 'w-2 bg-blue-200'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {guidedTourStep > 1 && (
              <IOSButton
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={prevTourStep}
              >
                Back
              </IOSButton>
            )}
            <IOSButton
              variant="primary"
              size="sm"
              icon={guidedTourStep === 7 ? CheckCircle : ArrowRight}
              onClick={nextTourStep}
            >
              {guidedTourStep === 7 ? 'Get Started' : 'Next'}
            </IOSButton>
          </div>
        </div>
      </div>
    </div>
  );
};
