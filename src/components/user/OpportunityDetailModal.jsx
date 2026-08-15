import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Plus,
  Activity,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';

export const OpportunityDetailModal = () => {
  const {
    selectedOpportunity,
    setSelectedOpportunity,
    openAskAlalay,
  } = useApp();

  const [checkedItems, setCheckedItems] = useState({});

  if (!selectedOpportunity) return null;

  const opp = selectedOpportunity;

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 my-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSelectedOpportunity(null)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Breadcrumb matching Image 5 */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Building className="w-3.5 h-3.5 text-[#093a96]" />
          <span>{opp.categoryName || 'Healthcare'}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>Senior Benefits</span>
        </div>

        {/* Heading & Source Pill matching Image 5 */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#093a96] tracking-tight">
            {opp.title}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#093a96]" />
            <span>Source Verified: </span>
            <a
              href={opp.officialSource?.url || 'https://philhealth.gov.ph'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#093a96] font-bold hover:underline"
            >
              philhealth.gov.ph
            </a>
          </div>
        </div>

        {/* Top Status Banner Card with Circular 92% Gauge matching Image 5 */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/30 to-purple-50/20 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
              You may be eligible
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Based on your profile data, you meet the primary criteria for mandatory coverage.
            </p>
          </div>

          {/* Circular 92% Gauge */}
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-blue-200/80 shadow-xs flex-shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#093a96]"
                  strokeDasharray="92, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-xs text-[#093a96]">
                {opp.matchScore}%
              </span>
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Profile</div>
              <div className="text-[11px] text-slate-500 font-medium">Match</div>
            </div>
          </div>
        </div>

        {/* "What is this?" Section matching Image 5 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#093a96] text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">What is this?</h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-11">
            The PhilHealth Senior Citizen coverage provides mandatory health insurance for all Filipino citizens aged 60 and above. It ensures you have access to financial assistance for hospital room and board, operating room charges, professional fees, and select outpatient services without needing to pay monthly premiums, provided you are not currently employed or receiving regular income.
          </p>
        </div>

        {/* Two Column Grid: "Why you may qualify" vs "What you may receive" matching Image 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Why you may qualify */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#0f172a]">Why you may qualify</h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#093a96] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a]">Age Requirement</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your profile indicates you are 62 years old (Minimum 60).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#093a96] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a]">Residency</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified resident of the Philippines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-bold leading-none text-xs">...</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a]">Income Status</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Need to verify if currently receiving regular income.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: What you may receive (4 tiles matching Image 5) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#0f172a]">What you may receive</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-center space-y-1 flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-xl bg-white text-[#093a96] flex items-center justify-center font-bold shadow-2xs">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0f172a] pt-1">Inpatient Care</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-center space-y-1 flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-xl bg-white text-[#093a96] flex items-center justify-center font-bold shadow-2xs">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0f172a] pt-1">Outpatient Meds</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-center space-y-1 flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-xl bg-white text-[#093a96] flex items-center justify-center font-bold shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0f172a] pt-1">Konsulta Package</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 text-center space-y-1 flex flex-col items-center justify-center">
                <div className="w-7 h-7 rounded-xl bg-white text-[#093a96] flex items-center justify-center font-bold shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#0f172a] pt-1">No Balance Billing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Checklist Section matching Image 5 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-[#0f172a]">Requirements</h3>

          <div className="space-y-3">
            {[
              'Filled out PhilHealth Member Registration Form (PMRF)',
              'Valid OSCA (Office of Senior Citizen Affairs) ID or valid government ID',
              '1x1 ID Picture',
            ].map((reqText, idx) => {
              const isChecked = checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex items-center gap-3 cursor-pointer transition-all"
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#093a96] text-white'
                        : 'border border-slate-300 bg-slate-50'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {reqText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-2">
          <IOSButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setSelectedOpportunity(null);
              openAskAlalay(opp);
            }}
            className="!bg-[#093a96] hover:!bg-[#072d75] py-3.5 font-bold shadow-md shadow-blue-900/15"
          >
            Ask ALALAY About This Opportunity
          </IOSButton>
        </div>
      </div>
    </div>
  );
};
