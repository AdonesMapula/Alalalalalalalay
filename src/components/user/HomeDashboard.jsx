import React, { useMemo } from 'react';
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
  Calendar,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlalayLogo } from '../common/AlalayLogo';
import { IOSButton } from '../common/IOSButton';
import { rankAndFilterOpportunities, calculateCitizenAge } from '../../services/rulesEngine';

export const HomeDashboard = () => {
  const {
    opportunities,
    setSelectedOpportunity,
    setActiveTab,
    setSelectedCategory,
    openAskAlalay,
    user,
    documents,
  } = useApp();

  const userAge = calculateCitizenAge(user);
  const isSenior = Boolean(user?.isSeniorCitizen || user?.is_senior_citizen || userAge >= 60);

  // Deterministically rank and match opportunities for this specific citizen's profile
  const rankedOpportunities = useMemo(() => {
    return rankAndFilterOpportunities(opportunities, user, documents);
  }, [opportunities, user, documents]);

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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#093a96] text-xs font-bold border border-blue-200 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{opportunities?.length || 0} Live Ingested Services</span>
            </div>

            {isSenior && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Senior Citizen Mode ({userAge} yrs)</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-snug">
            {isSenior
              ? `Senior Citizen Benefits & Prioritized Care for ${user?.firstName || 'Citizen'}.`
              : 'Let ALALAY find services you qualify for.'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {isSenior
              ? `We automatically match your profile with OSCA Social Pensions, Expanded Senior Citizen discounts (RA 9994), PhilHealth Point-of-Service, and maintenance medicine programs.`
              : 'We continuously monitor government portals to match you with hospitalization assistance, student loans, tuition subsidies, and citizen benefits.'}
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

      {/* Senior Citizen Notification Banner if User is Senior Citizen */}
      {isSenior && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-4 flex-wrap shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Senior Citizen Entitlements Active (Age {userAge})
              </h4>
              <p className="text-[11px] text-amber-800">
                Grounded on Republic Act 9994 (Expanded Senior Citizens Act) & RA 10645 (Mandatory PhilHealth Coverage).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="px-3.5 py-1.5 rounded-full bg-white text-amber-950 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            View Senior Programs →
          </button>
        </div>
      )}

      {/* 2. Categories Slider Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Explore Categories
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {categoryChips.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveTab('explore');
                }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#093a96] text-xs font-bold text-slate-700 hover:text-[#093a96] shadow-2xs hover:shadow-xs transition-all flex-shrink-0 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#093a96] flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended for You Section (Ranked & Matched for Citizen) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
              {isSenior ? 'Recommended for Senior Citizens' : 'Recommended for You'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Intelligently matched and ranked based on your verified credentials, age ({userAge} yrs), citizenship, and Document Locker
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className="text-xs font-bold text-[#093a96] hover:underline cursor-pointer"
          >
            Browse All ({rankedOpportunities.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedOpportunities.map((opp, idx) => {
            const topColor = opp.isSeniorPriority ? '#f59e0b' : topColors[idx % topColors.length];
            const IconComp = iconsList[idx % iconsList.length];
            const rawUrl = opp.officialSource?.url || '';
            const domain = rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : 'gov.ph';

            return (
              <div
                key={opp.id || idx}
                onClick={() => setSelectedOpportunity(opp)}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                  opp.isSeniorPriority ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
                }`}
              >
                {/* Top Accent Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: topColor }}
                />

                <div className="space-y-3 pt-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        opp.isSeniorPriority
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {opp.matchScore || 92}% Match
                    </span>

                    {opp.matchBadge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#093a96] border border-blue-200 truncate max-w-[170px]">
                        {opp.matchBadge}
                      </span>
                    )}

                    <div className="w-8 h-8 rounded-2xl bg-slate-100 flex items-center justify-center text-[#093a96] group-hover:bg-blue-50 transition-colors ml-auto">
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
