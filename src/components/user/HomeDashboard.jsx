import React from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  Shield,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  Coins,
  GraduationCap,
  Briefcase,
  Plane,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';

export const HomeDashboard = () => {
  const {
    opportunities,
    setSelectedOpportunity,
    setActiveTab,
    setSelectedCategory,
    openAskAlalay,
  } = useApp();

  const categoryChips = [
    { id: 'health', name: 'Health', icon: Shield, active: true },
    { id: 'finance', name: 'Finance', icon: Coins },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'travel', name: 'Travel', icon: Plane },
  ];

  // Specific 3 showcase cards matching Image 3
  const showcaseCards = [
    {
      id: 'opp_philhealth_senior',
      title: 'PhilHealth Senior Citizen Benefits',
      agency: 'PhilHealth',
      category: 'Health',
      shortDesc: 'Mandatory health insurance coverage for all senior citizens with subsidized hospital room and board...',
      matchScore: 92,
      matchType: 'check',
      topColor: '#22c55e', // green bar
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Shield,
    },
    {
      id: 'opp_sss_loan',
      title: 'SSS Salary Loan Application',
      agency: 'SSS',
      category: 'Finance',
      shortDesc: 'Low-interest cash loan available to currently contributing members to meet immediate financial needs...',
      matchScore: 85,
      matchType: 'thumbs',
      topColor: '#093a96', // blue bar
      badgeColor: 'bg-blue-50 text-[#093a96] border-blue-200',
      icon: Coins,
    },
    {
      id: 'opp_ched_tulong_dunong',
      title: 'Tertiary Education Subsidy',
      agency: 'CHED',
      category: 'Education',
      shortDesc: 'Financial assistance for underprivileged Filipino students pursuing higher education degrees...',
      matchScore: 78,
      matchType: 'lightbulb',
      topColor: '#f59e0b', // amber bar
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* 1. Large Hero Banner Card matching Image 3 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-purple-50/30 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#093a96] text-xs font-bold border border-blue-200 shadow-2xs">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-snug">
            Let ALALAY find services you qualify for.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            We analyze your profile to match you with benefits, grants, and programs from various agencies.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <IOSButton
              variant="primary"
              size="md"
              icon={Search}
              onClick={() => openAskAlalay()}
              className="!bg-[#093a96] hover:!bg-[#072d75] font-bold shadow-md shadow-blue-900/20"
            >
              Start Scan Now
            </IOSButton>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-5 py-2.5 rounded-full bg-white text-[#0f172a] text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Right Hero Logo Card matching Image 3 */}
        <div className="w-64 h-56 rounded-3xl bg-white border border-slate-200/80 shadow-md p-6 flex flex-col items-center justify-center text-center flex-shrink-0">
          <AlalayLogo size="lg" />
          <p className="text-[11px] text-slate-500 font-semibold mt-3 max-w-[170px] leading-tight">
            Government services made understandable.
          </p>
        </div>
      </div>

      {/* 2. Categories Section matching Image 3 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
            Categories
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {categoryChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(chip.id);
                  setActiveTab('explore');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  chip.active
                    ? 'bg-blue-50 text-[#093a96] border-blue-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chip.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended for You Section matching Image 3 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
            Recommended for You
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcaseCards.map((card) => {
            const matchedOpp = opportunities.find((o) => o.id === card.id) || opportunities[0];

            return (
              <div
                key={card.id}
                onClick={() => setSelectedOpportunity(matchedOpp)}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Top Accent Color Bar in Image 3 */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: card.topColor }}
                />

                <div className="space-y-3 pt-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}
                    >
                      {card.matchScore}% Match
                    </span>

                    <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-[#093a96]">
                      <card.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-500">
                    {card.category} • {card.agency}
                  </p>

                  <h4 className="text-base font-bold text-[#0f172a] group-hover:text-[#093a96] transition-colors leading-snug">
                    {card.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-normal">
                    {card.shortDesc}
                  </p>
                </div>

                {/* Footer with Source Verified & Arrow */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#093a96]" />
                    <span>Source Verified</span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#093a96] group-hover:text-white transition-all flex items-center justify-center text-slate-700">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
