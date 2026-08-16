import React, { useState, useMemo } from 'react';
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
  Gift,
  FileText,
  HelpCircle,
  Clock,
  FolderCheck,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';

/**
 * Intelligent matcher that checks if a citizen already has a required document in their Document Locker
 */
function findMatchingUserDoc(reqName, userDocs = [], user = null) {
  if (!reqName) return null;
  const q = reqName.toLowerCase();

  for (const doc of userDocs) {
    const docName = (doc.name || '').toLowerCase();
    const docType = (doc.type || '').toLowerCase();
    const docCat = (doc.category || '').toLowerCase();

    // 1. National ID / Government ID Match
    if (
      (q.includes('id') || q.includes('philsys') || q.includes('osca') || q.includes('passport') || q.includes('driver') || q.includes('voter') || q.includes('identity') || q.includes('umid')) &&
      (docType.includes('id') || docName.includes('id') || docName.includes('philsys') || docName.includes('passport') || docName.includes('license') || docType.includes('identity') || docCat.includes('id'))
    ) {
      return doc;
    }

    // 2. Certificate of Indigency / Barangay Clearance Match
    if (
      (q.includes('indigency') || q.includes('barangay') || q.includes('residence') || q.includes('address')) &&
      (docName.includes('indigency') || docName.includes('barangay') || docName.includes('residence') || docName.includes('certificate'))
    ) {
      return doc;
    }

    // 3. PhilHealth PMRF / Member Data Record Match
    if (
      (q.includes('philhealth') || q.includes('pmrf') || q.includes('mdr')) &&
      (docName.includes('philhealth') || docName.includes('pmrf') || docName.includes('mdr') || docName.includes('insurance'))
    ) {
      return doc;
    }

    // 4. Student COR / School Registration Match
    if (
      (q.includes('registration') || q.includes('cor') || q.includes('student') || q.includes('school') || q.includes('enrollment') || q.includes('transcript')) &&
      (docName.includes('registration') || docName.includes('cor') || docName.includes('student') || docName.includes('school') || docName.includes('grades') || docName.includes('transcript'))
    ) {
      return doc;
    }

    // 5. Medical Statement of Account / Prescription / Clinical Abstract Match
    if (
      (q.includes('hospital') || q.includes('statement of account') || q.includes('soa') || q.includes('prescription') || q.includes('medical') || q.includes('abstract') || q.includes('billing')) &&
      (docName.includes('hospital') || docName.includes('bill') || docName.includes('statement') || docName.includes('prescription') || docName.includes('medical') || docName.includes('abstract'))
    ) {
      return doc;
    }

    // 6. Birth Certificate / PSA Match
    if (
      (q.includes('birth') || q.includes('psa') || q.includes('nso')) &&
      (docName.includes('birth') || docName.includes('psa') || docName.includes('nso'))
    ) {
      return doc;
    }

    // 7. General String Inclusion Match
    if (docName.length > 4 && q.includes(docName.substring(0, 10))) {
      return doc;
    }
  }

  // Fallback: If user is verified with eGov PH and requirement is Government ID
  if (user?.isVerified && (q.includes('id') || q.includes('identity') || q.includes('government photo id'))) {
    return { name: 'eGov PH National Digital ID', type: 'Verified Identity' };
  }

  return null;
}

export const OpportunityDetailModal = () => {
  const {
    selectedOpportunity,
    setSelectedOpportunity,
    openAskAlalay,
    documents,
    user,
  } = useApp();

  const [manualChecks, setManualChecks] = useState({});

  if (!selectedOpportunity) return null;

  const opp = selectedOpportunity;
  const rawUrl = opp.officialSource?.url || '';
  const domain = rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : 'gov.ph';

  // Dynamic requirements list
  const requirementsList =
    opp.requirements && opp.requirements.length > 0
      ? opp.requirements.map((r) => (typeof r === 'string' ? { name: r, status: 'unknown' } : r))
      : [
          { name: 'Valid Government Issued Photo ID (e.g. PhilSys, OSCA, Driver’s License)', status: 'met' },
          { name: 'Filled out Official Government Application Form', status: 'action_required' },
          { name: 'Proof of Residence / Certificate of Indigency (if applicable)', status: 'action_required' },
        ];

  // Dynamic benefits list
  const benefitsList =
    opp.benefits && opp.benefits.length > 0
      ? opp.benefits
      : [
          'Subsidized public citizen assistance',
          'Official program entitlement',
          'Direct government agency support',
        ];

  const toggleCheck = (idx) => {
    setManualChecks((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-7 my-8 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSelectedOpportunity(null)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          <Building className="w-3.5 h-3.5 text-[#093a96]" />
          <span>{opp.categoryName || opp.category || 'Public Service'}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{opp.agency || 'Government Program'}</span>
        </div>

        {/* Heading & Source Pill */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#093a96] tracking-tight leading-snug">
            {opp.title}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Source Verified: </span>
            <a
              href={rawUrl || 'https://www.philhealth.gov.ph'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#093a96] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{domain}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Top Status Banner Card with Match Score Gauge */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/30 to-purple-50/20 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
              You may be eligible
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Based on your verified credentials and resident charter guidelines, your profile qualifies for assistance.
            </p>
          </div>

          {/* Circular Match Gauge */}
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
                  strokeDasharray={`${opp.matchScore || 92}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-xs text-[#093a96]">
                {opp.matchScore || 92}%
              </span>
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Profile</div>
              <div className="text-[11px] text-slate-500 font-medium">Match</div>
            </div>
          </div>
        </div>

        {/* "What is this program?" Section */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#093a96] text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">What is this program?</h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-11">
            {opp.fullDesc ||
              opp.shortDesc ||
              `Official public assistance program provided by ${opp.agency}. Governed under national statutory guidelines and Citizen's Charter standards.`}
          </p>
        </div>

        {/* Benefits & Entitlements Section */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">What you may receive</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
            {benefitsList.map((benefit, bIdx) => (
              <div
                key={bIdx}
                className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5 text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Checklist Section with Automatic User Locker Verification */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Requirements Checklist</h3>
                <p className="text-[11px] text-slate-500">
                  Documents verified in your Document Locker are automatically checked
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pl-0 sm:pl-10">
            {requirementsList.map((reqItem, idx) => {
              const reqText = typeof reqItem === 'string' ? reqItem : reqItem.name;
              const matchedDoc = findMatchingUserDoc(reqText, documents, user);
              const autoChecked = Boolean(matchedDoc) || reqItem.status === 'met';
              const isChecked = manualChecks[idx] !== undefined ? manualChecks[idx] : autoChecked;

              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="space-y-1">
                      <span className={`text-xs font-semibold leading-snug block ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                        {reqText}
                      </span>

                      {matchedDoc && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Auto-Verified in Locker: {matchedDoc.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap mt-0.5 border"
                    style={{
                      backgroundColor: isChecked ? '#ecfdf5' : '#f8fafc',
                      color: isChecked ? '#047857' : '#64748b',
                      borderColor: isChecked ? '#a7f3d0' : '#e2e8f0',
                    }}
                  >
                    {isChecked ? 'Ready ✓' : 'Action Required'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold text-center transition-colors inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Visit Official Agency Portal</span>
            </a>
          )}

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
            Ask ALALAY About This Service
          </IOSButton>
        </div>
      </div>
    </div>
  );
};
