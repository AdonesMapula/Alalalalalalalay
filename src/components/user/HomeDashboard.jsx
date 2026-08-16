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
  ExternalLink,
  Globe,
  Radio,
  Zap,
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
    { id: 'health', name: 'Health & Medical', icon: HeartPulse },
    { id: 'education', name: 'Education & Loans', icon: GraduationCap },
    { id: 'finance', name: 'Finance & Grants', icon: Coins },
    { id: 'social', name: 'Social Welfare', icon: Shield },
    { id: 'employment', name: 'Employment & Labor', icon: Briefcase },
  ];

  const topColors = ['#22c55e', '#093a96', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  const iconsList = [HeartPulse, GraduationCap, Coins, Shield, Briefcase, Sparkles];

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* 1. Large Hero Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-purple-50/30 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#093a96] text-xs font-bold border border-blue-200 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{opportunities?.length || 0} Live Ingested Services</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-snug">
            Let ALALAY find services you qualify for.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            We continuously monitor government portals to match you with hospitalization assistance, student loans, tuition subsidies, and citizen benefits.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <IOSButton
              variant="primary"
              size="md"
              icon={Search}
              onClick={() => openAskAlalay()}
              className="!bg-[#093a96] hover:!bg-[#072d75] font-bold shadow-md shadow-blue-900/20"
            >
              Ask ALALAY Scan
            </IOSButton>

            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className="px-5 py-2.5 rounded-full bg-white text-[#0f172a] text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore All ({opportunities?.length || 0})</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Hero Logo Card */}
        <div className="w-64 h-56 rounded-3xl bg-white border border-slate-200/80 shadow-md p-6 flex flex-col items-center justify-center text-center flex-shrink-0">
          <AlalayLogo size="lg" />
        </div>
      </div>

      {/* 2. Categories Slider Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
            Categories & Service Sectors
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            View All Services
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-[#093a96] shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-[#093a96]" />
                <span>{chip.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended for You Section (All Real Scraped Opportunities) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
              Recommended for You
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verified programs dynamically fetched from official government websites & public feeds
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            Browse All ({opportunities.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp, idx) => {
            const topColor = topColors[idx % topColors.length];
            const IconComp = iconsList[idx % iconsList.length];
            const rawUrl = opp.officialSource?.url || '';
            const domain = rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : 'gov.ph';

            return (
              <div
                key={opp.id || idx}
                onClick={() => setSelectedOpportunity(opp)}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Top Accent Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: topColor }}
                />

                <div className="space-y-3 pt-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {opp.matchScore || 92}% Match
                    </span>

                    <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-[#093a96] group-hover:bg-blue-50 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-500">
                    {opp.categoryName || opp.category || 'General'} • {opp.agency || 'Government'}
                  </p>

                  <h4 className="text-base font-bold text-[#0f172a] group-hover:text-[#093a96] transition-colors leading-snug">
                    {opp.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-normal">
                    {opp.shortDesc || opp.fullDesc || 'Verified government assistance and citizen support program.'}
                  </p>
                </div>

                {/* Footer with Source Verified & Arrow */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium truncate max-w-[180px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate text-[11px]">{domain}</span>
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
