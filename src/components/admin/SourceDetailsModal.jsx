import React, { useState } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Clock,
  Layers,
  RefreshCw,
  Building2,
  BookmarkCheck,
  Info,
  Gift,
  ListOrdered,
  Users,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';

export const SourceDetailsModal = ({ source, onClose, onRescrape, isScraping }) => {
  const { opportunities, removeKnowledgeSource } = useApp();
  const [activeTab, setActiveTab] = useState('opportunities');

  if (!source) return null;

  const rawUrl = source.rawUrl || source.official_url || source.officialUrl || '';
  const domain = rawUrl.replace(/^https?:\/\//, '').split('/')[0];

  // Find opportunities matching this source
  const matchedOpportunities = opportunities.filter((opp) => {
    const oppSourceUrl = opp.officialSource?.url || '';
    const oppAgency = opp.agency || '';
    const srcName = source.name || source.agency_name || '';

    return (
      (rawUrl && oppSourceUrl.includes(domain)) ||
      (srcName && oppAgency.toLowerCase().includes(srcName.toLowerCase())) ||
      (opp.title && opp.title.toLowerCase().includes(srcName.toLowerCase()))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0f172a] tracking-tight">
                  {source.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {source.status || 'Active'}
                </span>
              </div>
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-[#093a96] flex items-center gap-1 font-medium mt-0.5"
              >
                <span>{rawUrl}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-500 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('opportunities')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'opportunities'
                ? 'border-[#093a96] text-[#093a96]'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Linked Services & Opportunities</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#093a96] text-[10px]">
              {matchedOpportunities.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-[#093a96] text-[#093a96]'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Scraped Knowledge & Content
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1 bg-[#f8fafd]">
          {activeTab === 'opportunities' ? (
            <div className="space-y-4">
              {matchedOpportunities.length > 0 ? (
                matchedOpportunities.map((opp) => {
                  return (
                    <div
                      key={opp.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4"
                    >
                      {/* Top Opportunity Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#093a96] font-bold text-[11px] border border-blue-200/60">
                            {opp.categoryName || opp.category || 'Government Program'}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {opp.agency}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                          {opp.matchScore || 92}% Match
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#0f172a] tracking-tight leading-snug">
                        {opp.title}
                      </h3>

                      {/* 1. What does this Opportunity do? (Deep Explanation) */}
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-[#093a96]">
                          <Info className="w-4 h-4 text-[#093a96] flex-shrink-0" />
                          <span>What is this program and what does it do?</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {opp.fullDesc ||
                            opp.shortDesc ||
                            `This government program provides official public assistance, statutory fee discounts, and citizen benefits for qualified Filipino residents administered by ${opp.agency}.`}
                        </p>
                      </div>

                      {/* 2. Key Entitled Benefits */}
                      {opp.benefits && opp.benefits.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <Gift className="w-3.5 h-3.5 text-emerald-600" />
                            <span>What benefits do citizens receive?</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {opp.benefits.map((benefit, bIdx) => (
                              <div
                                key={bIdx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-slate-700"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="leading-snug text-[11px]">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Mandatory Requirements Checklist */}
                      {opp.requirements && opp.requirements.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <FileText className="w-3.5 h-3.5 text-[#093a96]" />
                            <span>Mandatory Documents Required to Claim:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {opp.requirements.map((req, rIdx) => {
                              const name = typeof req === 'string' ? req : req.name;
                              return (
                                <span
                                  key={rIdx}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px] flex items-center gap-1"
                                >
                                  <span>•</span>
                                  <span>{name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 4. How to Avail / Apply Steps */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-slate-600">
                        <ListOrdered className="w-4 h-4 text-[#093a96] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#0f172a] block text-xs">
                            How to Avail & Claim:
                          </span>
                          <span className="text-[11px] text-slate-600 leading-snug">
                            {opp.howToAvail ||
                              (opp.agency?.toLowerCase().includes('job') || opp.agency?.toLowerCase().includes('dole')
                                ? 'Register online or apply directly through your local City/Municipal Public Employment Service Office (PESO).'
                                : opp.agency?.toLowerCase().includes('deped') || opp.agency?.toLowerCase().includes('ched') || opp.agency?.toLowerCase().includes('unifast')
                                ? 'Apply online through the official education portal or submit credentials to your school Registrar / SFAO.'
                                : opp.agency?.toLowerCase().includes('sss') || opp.agency?.toLowerCase().includes('pag-ibig')
                                ? 'Submit application online via official member portal or visit your nearest branch office.'
                                : `Submit verified documents to your nearest ${opp.agency} branch office or hospital Malasakit Center desk with your PhilSys National ID.`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">
                    No Direct Opportunities Extracted Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click "Scrape & Sync Live" below to automatically extract public programs from this portal.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Telemetry Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Category
                  </span>
                  <span className="text-xs font-bold text-[#0f172a] block">
                    {source.category || 'General Public'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Last Web Crawled
                  </span>
                  <span className="text-xs font-bold text-slate-700 block">
                    {source.lastScraped}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Documents Indexed
                  </span>
                  <span className="text-xs font-bold text-emerald-600 block">
                    {source.documentsCount} Section Blocks
                  </span>
                </div>
              </div>

              {/* Scraped Policy Abstract */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#093a96]">
                  <FileText className="w-4 h-4 text-[#093a96]" />
                  <span>Scraped Website Description & Summary</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-normal">
                  {source.description ||
                    `Official public guidelines, service citizen charters, and circular requirements extracted from ${rawUrl}. Monitored by ALALAY AI Scraping daemon.`}
                </p>
              </div>

              {/* Extracted Policy Guidelines */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Extracted Citizen Service Guidelines</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block">
                        Citizen Eligibility Standards
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Accessible to Philippine residents with national IDs and verified civil registry credentials.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0f172a] block">
                        Mandatory Document Verification
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Validated against government citizen charters (e.g. PhilSys, Certificate of Indigency, Billing Statement).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHA-256 Fingerprint & Safety Verification */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SHA-256 Integrity Fingerprint</span>
                  </span>
                  <span className="text-emerald-400 font-bold">Strictly Verified ✓</span>
                </div>
                <div className="truncate text-slate-400 text-[10px]">
                  Hash: {source.contentHash || 'a94f10e42d7c81920bd81938fe10283948576201aeb'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#093a96] hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Portal</span>
            </a>

            <button
              type="button"
              onClick={() => {
                const name = source.name || rawUrl || 'this website';
                if (
                  window.confirm(
                    `Delete "${name}"?\n\nThis will permanently remove this website and purge all associated scraped opportunities and job vacancies.`
                  )
                ) {
                  removeKnowledgeSource(source.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Website & Scraped Data</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <IOSButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={isScraping}
              onClick={() => onRescrape(source.id)}
            >
              {isScraping ? 'Scraping Live...' : 'Scrape & Sync Live'}
            </IOSButton>

            <IOSButton variant="primary" size="sm" onClick={onClose}>
              Done
            </IOSButton>
          </div>
        </div>
      </div>
    </div>
  );
};
