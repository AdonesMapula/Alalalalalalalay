import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, FolderLock, Compass, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';

export const WelcomeModal = () => {
  const { welcomeModalOpen, setWelcomeModalOpen, startGuidedTour, user } = useApp();

  if (!welcomeModalOpen) return null;

  const features = [
    { icon: Compass, title: 'Find Services & Grants', desc: 'Browse verified opportunities tailored to your family status.' },
    { icon: CheckCircle2, title: 'Check Eligibility Instantly', desc: 'See why you qualify and exact requirements before applying.' },
    { icon: FolderLock, title: 'Track Government Documents', desc: 'Get proactive alerts before clearances and IDs expire.' },
    { icon: Sparkles, title: 'Ask ALALAY AI', desc: 'Receive policy explanations grounded strictly in official source circulars.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setWelcomeModalOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 ios-spring transform animate-in zoom-in-95 duration-200 text-center">
        {/* Celebration Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-5 mx-auto animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight mb-2">
          Welcome to ALALAY, {user.firstName}! 🎉
        </h2>
        <p className="text-sm text-[#8E8E93] leading-relaxed mb-6">
          Your personalized government opportunities assistant is ready. We have synchronized your profile with verified official agency sources.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-blue-50 text-[#007AFF] flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1E]">{f.title}</h4>
                  <p className="text-[11px] text-[#8E8E93] leading-snug mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <IOSButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setWelcomeModalOpen(false)}
          >
            Explore Dashboard
          </IOSButton>
          <IOSButton
            variant="primary"
            size="md"
            fullWidth
            icon={ArrowRight}
            onClick={startGuidedTour}
          >
            Take 1-Min Tour
          </IOSButton>
        </div>
      </div>
    </div>
  );
};
