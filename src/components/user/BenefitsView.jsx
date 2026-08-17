import React, { useMemo, useState } from 'react';
import { Award, History, CheckCircle2, X, ChevronDown, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { rankAndFilterOpportunities } from '../../services/rulesEngine';

export const BenefitsView = () => {
  const {
    opportunities,
    documents,
    user,
    autoApplyQueue,
    setSelectedOpportunity,
    setActiveTab,
    dismissAutoApply,
    markBenefitAcquired,
    clearAutoApplyHistory,
    clearAcquiredBenefits,
    t,
  } = useApp();

  const [showApplied, setShowApplied] = useState(true);

  const rankedOpportunities = useMemo(
    () => rankAndFilterOpportunities(opportunities, user, documents),
    [opportunities, user, documents]
  );

  // Benefits the citizen has confirmed actually receiving.
  const acquiredEntries = useMemo(() => {
    return (autoApplyQueue || [])
      .filter((entry) => entry.status === 'acquired')
      .map((entry) => ({ ...entry, opp: rankedOpportunities.find((o) => o.id === entry.oppId) }))
      .filter((entry) => entry.opp)
      .sort((a, b) => new Date(b.acquiredAt || 0) - new Date(a.acquiredAt || 0));
  }, [autoApplyQueue, rankedOpportunities]);

  // Benefits Auto-Apply has submitted on the citizen's behalf, not yet confirmed received.
  const appliedEntries = useMemo(() => {
    return (autoApplyQueue || [])
      .filter((entry) => entry.status === 'applied')
      .map((entry) => ({ ...entry, opp: rankedOpportunities.find((o) => o.id === entry.oppId) }))
      .filter((entry) => entry.opp)
      .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
  }, [autoApplyQueue, rankedOpportunities]);

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('benefits.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('benefits.subtitle')}
        </p>
      </div>

      {/* Benefits You Have (Acquired / Received) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">
              {t('home.acquiredBenefits.title')} ({acquiredEntries.length})
            </h2>
            <p className="text-[11px] text-slate-500">{t('home.acquiredBenefits.desc')}</p>
          </div>
        </div>

        {acquiredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {acquiredEntries.map((entry) => (
              <div
                key={entry.oppId}
                onClick={() => setSelectedOpportunity(entry.opp)}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:border-amber-300 flex items-start justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-[#1C1C1E] truncate">{entry.opp.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {entry.opp.agency || 'Government Service'} • Received{' '}
                    {entry.acquiredAt
                      ? new Date(entry.acquiredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'recently'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                    <Award className="w-3 h-3" />
                    <span>{t('home.acquiredBenefits.received')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAutoApply(entry.oppId);
                    }}
                    aria-label="Remove from benefits received"
                    className="w-6 h-6 rounded-lg bg-white border border-amber-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyBenefitsState
            icon={Award}
            title={t('benefits.empty.receivedTitle')}
            desc={t('benefits.empty.receivedDesc')}
          />
        )}

        {acquiredEntries.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => clearAcquiredBenefits()}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold transition-colors cursor-pointer"
            >
              {t('home.autoApply.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Applied Benefits (submitted, awaiting confirmation) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="w-full p-4 sm:p-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowApplied((prev) => !prev)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <h2 className="text-sm font-black text-[#0f172a]">
                {t('home.autoApply.historyTitle')} ({appliedEntries.length})
              </h2>
              <p className="text-[11px] text-slate-500">{t('home.autoApply.historyDesc')}</p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            {appliedEntries.length > 0 && (
              <button
                type="button"
                onClick={() => clearAutoApplyHistory()}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold transition-colors cursor-pointer"
              >
                {t('home.autoApply.clearAll')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowApplied((prev) => !prev)}
              aria-label={showApplied ? 'Collapse applied benefits' : 'Expand applied benefits'}
              className="cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showApplied ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showApplied && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
            {appliedEntries.length > 0 ? (
              <div className="space-y-2">
                {appliedEntries.map((entry) => (
                  <div
                    key={entry.oppId}
                    onClick={() => setSelectedOpportunity(entry.opp)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 flex items-center justify-between gap-3 flex-wrap cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1C1C1E] truncate">{entry.opp.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {entry.opp.agency || 'Government Service'} • Applied{' '}
                        {entry.appliedAt
                          ? new Date(entry.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'recently'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('home.autoApply.applied')}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markBenefitAcquired(entry.oppId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        {t('home.autoApply.markReceived')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAutoApply(entry.oppId);
                        }}
                        aria-label="Remove from history"
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBenefitsState
                icon={History}
                title={t('benefits.empty.appliedTitle')}
                desc={t('benefits.empty.appliedDesc')}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setActiveTab('explore')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#093a96] text-sm font-bold border border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>{t('benefits.exploreCta')}</span>
        </button>
      </div>
    </div>
  );
};

const EmptyBenefitsState = ({ icon: Icon, title, desc }) => (
  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
    <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    <p className="text-xs text-slate-500 max-w-sm mx-auto">{desc}</p>
  </div>
);
