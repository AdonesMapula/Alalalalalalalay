import React from 'react';
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  FileText,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSButton } from '../common/IOSButton';
import { IOSBadge } from '../common/IOSBadge';

export const OpportunityReviewQueue = () => {
  const {
    reviewQueue,
    approveDetectedOpportunity,
    rejectDetectedOpportunity,
  } = useApp();

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
              AI Detected Opportunities Review Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {reviewQueue.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
            Human-in-the-loop verification: Super Admin must review and approve AI policy extractions before citizen publishing
          </p>
        </div>
      </div>

      {/* Review Queue Items */}
      {reviewQueue.length > 0 ? (
        <div className="space-y-4">
          {reviewQueue.map((item) => (
            <IOSCard
              key={item.id}
              className="space-y-5 bg-white border border-slate-200/90"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: item.categoryColor || '#007AFF' }}
                  >
                    {item.agency}
                  </span>
                  <IOSBadge variant="purple" icon={<Sparkles className="w-3 h-3" />}>
                    AI Extracted ({item.confidence}% Confidence)
                  </IOSBadge>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  Extracted: {new Date(item.extractedAt).toLocaleString()}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#1C1C1E]">
                {item.title}
              </h2>

              {/* Side-by-Side: Extracted Logic vs Raw Source Evidence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: AI Structured Extraction */}
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span>AI Extracted Requirements & Benefits</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Key Benefits:</h5>
                    <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                      {item.extractedBenefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">Mandatory Requirements:</h5>
                    <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1">
                      {item.extractedRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-700 pt-1">
                    Potential Citizen Reach: {item.potentialCitizenReach}
                  </div>
                </div>

                {/* Right: Raw Government Source Evidence */}
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Raw Source Evidence Snippet</span>
                    </div>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-800/80 p-3 rounded-xl border border-slate-700/70 font-mono leading-relaxed">
                    {item.sourceEvidenceSnippet}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Source Verified: {item.sourceUrl}
                  </div>
                </div>
              </div>

              {/* Admin Decision Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <IOSButton
                  variant="destructive"
                  size="sm"
                  icon={XCircle}
                  onClick={() => rejectDetectedOpportunity(item.id)}
                >
                  Reject & Discard
                </IOSButton>

                <IOSButton
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => approveDetectedOpportunity(item.id)}
                  className="shadow-md shadow-blue-500/20"
                >
                  Approve & Publish to Citizens
                </IOSButton>
              </div>
            </IOSCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E]">
            Queue Clean — All Opportunities Reviewed
          </h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
            The AI crawler is actively monitoring sources. New detected circulars will appear here for verification.
          </p>
        </div>
      )}
    </div>
  );
};
