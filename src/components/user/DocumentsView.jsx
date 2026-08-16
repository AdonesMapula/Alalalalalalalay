import React, { useState, useMemo } from 'react';
import {
  FolderLock,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  Lock,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSButton } from '../common/IOSButton';
import { IOSBadge } from '../common/IOSBadge';
import { IOSSegmentedControl } from '../common/IOSSegmentedControl';
import { IOSSheet } from '../common/IOSSheet';
import { auditVaultDocuments, calculateOpportunityDocumentGaps } from '../../services/docAgentService';
import { DocAgentRenewalModal } from './DocAgentRenewalModal';

export const DocumentsView = () => {
  const {
    documents,
    user,
    opportunities,
    setUploadModalOpen,
    replaceDocument,
    deleteDocument,
    activeDocumentForPreview,
    setActiveDocumentForPreview,
    openAskAlalay,
    addToast,
  } = useApp();

  const [filterTab, setFilterTab] = useState('all');
  const [renewalModalDoc, setRenewalModalDoc] = useState(null);
  const [selectedAttributeDoc, setSelectedAttributeDoc] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Run DocAgent Proactive Audit on Vault Documents
  const auditedDocs = useMemo(() => {
    return auditVaultDocuments(documents);
  }, [documents]);

  // Run DocAgent Dynamic Gap-Filling Analysis against all active opportunities
  const gapAnalysis = useMemo(() => {
    return calculateOpportunityDocumentGaps(opportunities, auditedDocs);
  }, [opportunities, auditedDocs]);

  // Vault Statistics
  const validCount = auditedDocs.filter((d) => d.auditStatus === 'Valid').length;
  const expiringCount = auditedDocs.filter((d) => d.auditStatus === 'Expiring Soon').length;
  const expiredCount = auditedDocs.filter((d) => d.auditStatus === 'Expired').length;

  const readinessScore = documents.length > 0
    ? Math.min(100, Math.round((validCount / Math.max(documents.length, 1)) * 100))
    : 0;

  const filterOptions = [
    { id: 'all', label: 'All Vault Files', count: auditedDocs.length },
    {
      id: 'valid',
      label: 'Valid',
      count: validCount,
    },
    {
      id: 'expiring',
      label: 'Expiring Soon',
      count: expiringCount,
    },
    {
      id: 'expired',
      label: 'Expired',
      count: expiredCount,
    },
  ];

  const filteredDocs = auditedDocs.filter((doc) => {
    if (filterTab === 'valid') return doc.auditStatus === 'Valid';
    if (filterTab === 'expiring') return doc.auditStatus === 'Expiring Soon';
    if (filterTab === 'expired') return doc.auditStatus === 'Expired';
    return true;
  });

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      addToast(
        'DocAgent Audit Complete',
        `Evaluated ${auditedDocs.length} vault documents against 2026 Citizen Charters. Readiness: ${readinessScore}%.`,
        'success'
      );
    }, 600);
  };

  const handleRenewSuccess = (docId) => {
    replaceDocument(docId);
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header and Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              DocAgent Document Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#093a96] text-[11px] font-black border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Sentinel Active</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Autonomous OCR parsing, proactive expiration watchdog, and eligibility gap-filling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-[#093a96]' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run DocAgent Audit'}</span>
          </button>

          <IOSButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setUploadModalOpen(true)}
            className="shadow-md shadow-blue-900/20"
          >
            Upload with OCR
          </IOSButton>
        </div>
      </div>

      {/* DocAgent Sentinel Intelligence Overview Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950 via-[#093a96] to-indigo-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Vault Health & Eligibility Readiness
              </h2>
            </div>
            <p className="text-xs text-blue-200">
              {validCount} of {auditedDocs.length} documents fully compliant • Cross-referenced with statutory charters
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">{validCount} Valid</span>
            </div>

            {expiringCount > 0 && (
              <div className="px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{expiringCount} Expiring Soon</span>
              </div>
            )}

            {expiredCount > 0 && (
              <div className="px-3 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{expiredCount} Expired</span>
              </div>
            )}
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-blue-200">
            <span>Overall Document Compliance Score</span>
            <span className="text-emerald-400 font-extrabold">{readinessScore}% Ready</span>
          </div>
          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Proactive Expiration & Renewal Action Alert */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="p-4 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                Proactive DocAgent Expiration Notice
              </h4>
              <p className="text-xs text-amber-900 font-medium">
                {expiringCount > 0 && `${expiringCount} document is expiring within 30 days. `}
                {expiredCount > 0 && `${expiredCount} document is already expired. `}
                Generate a ready-to-print renewal packet to avoid disqualification from public benefits.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const targetDoc = auditedDocs.find((d) => d.isExpiringSoon || d.isExpired) || auditedDocs[0];
              if (targetDoc) setRenewalModalDoc(targetDoc);
            }}
            className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Renewal Packet</span>
          </button>
        </div>
      )}

      {/* Dynamic Gap-Filling & Opportunity Unlocker Cards */}
      {gapAnalysis.oneDocAwayPrograms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                DocAgent Opportunity Unlocker (1 Document Away)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Unlock 100% eligibility by uploading missing credentials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gapAnalysis.oneDocAwayPrograms.slice(0, 2).map((gapItem) => (
              <div
                key={gapItem.opportunityId}
                className="p-4 rounded-3xl bg-white border border-blue-200/90 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#093a96] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#093a96] border border-blue-200">
                      {gapItem.agency}
                    </span>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {gapItem.readinessPercentage}% Ready
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {gapItem.title}
                  </h4>

                  <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-[11px] text-amber-950 space-y-1">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                      Missing Document Required:
                    </span>
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{gapItem.missingRequirements[0] || 'Official Document'}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="text-xs font-bold text-[#093a96] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Upload Missing Item</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const matchedOpp = opportunities.find((o) => o.id === gapItem.opportunityId) || {
                        title: gapItem.title,
                        agency: gapItem.agency,
                        requirements: gapItem.missingRequirements,
                      };
                      const missingReq = gapItem.missingRequirements?.[0] || 'required credentials';
                      const query = `How to get ${missingReq} and complete application for ${gapItem.title}?`;
                      openAskAlalay(matchedOpp, null, query);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#093a96] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>How to Get (15m guide)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <IOSSegmentedControl
          options={filterOptions}
          value={filterTab}
          onChange={setFilterTab}
        />

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>AES-256 Vault Encryption • 100% RLS Protected</span>
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isValid = doc.auditStatus === 'Valid';
          const isExpiring = doc.auditStatus === 'Expiring Soon';
          const isExpired = doc.auditStatus === 'Expired';

          return (
            <IOSCard
              key={doc.id}
              className="flex flex-col justify-between space-y-4 bg-white border border-slate-200/80 group hover:shadow-md transition-all rounded-3xl"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {doc.type}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                      isExpired
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isExpiring
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isExpired ? (
                      <Clock className="w-3 h-3 text-rose-600" />
                    ) : isExpiring ? (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>{doc.urgencyLabel || doc.status}</span>
                  </span>
                </div>

                {/* Thumbnail / Document Representation */}
                <div
                  onClick={() => setActiveDocumentForPreview(doc)}
                  className="h-28 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden relative group/thumb cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={doc.thumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80'}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-all flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                    <Eye className="w-4 h-4" />
                    <span>View Record</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#093a96] transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{doc.issuer}</p>
                </div>
              </div>

              {/* Extracted Attributes Detail Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1.5 text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doc Number:</span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[150px]">
                    {doc.documentNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expiration:</span>
                  <span className={`font-bold ${isExpired ? 'text-rose-700' : isExpiring ? 'text-amber-700' : 'text-slate-800'}`}>
                    {doc.expirationDate || 'Permanent'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">DocAgent OCR:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified ✓</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDocumentForPreview(doc)}
                  className="text-xs font-bold text-[#093a96] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {(isExpiring || isExpired) && (
                    <button
                      type="button"
                      onClick={() => setRenewalModalDoc(doc)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Prepare Renewal Packet"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Renew</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </IOSCard>
          );
        })}
      </div>

      {/* Empty State when no documents */}
      {filteredDocs.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#093a96] flex items-center justify-center mx-auto shadow-inner">
            <FolderLock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Upload your PhilSys ID, Barangay Indigency, or clearances to unlock automatic verification across government programs.
            </p>
          </div>
          <IOSButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setUploadModalOpen(true)}
            className="mx-auto shadow-md shadow-blue-900/20"
          >
            Upload with OCR
          </IOSButton>
        </div>
      )}

      {/* Document Detail Preview Sheet Modal */}
      {activeDocumentForPreview && (
        <IOSSheet
          isOpen={Boolean(activeDocumentForPreview)}
          onClose={() => setActiveDocumentForPreview(null)}
          title={activeDocumentForPreview.name}
          subtitle={`Verified Record • ${activeDocumentForPreview.issuer}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 select-none">
            {/* Thumbnail Preview */}
            <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
              <img
                src={activeDocumentForPreview.thumbnail || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80'}
                alt={activeDocumentForPreview.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Extracted Attributes Inspector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-extrabold text-[#093a96] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DocAgent Verified Metadata:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Document Number:</span>
                  <span className="font-mono font-bold text-slate-900 truncate block">
                    {activeDocumentForPreview.documentNumber}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Expiration Date:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {activeDocumentForPreview.expirationDate || 'Permanent'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Issuing Office:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {activeDocumentForPreview.issuer}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">Encryption Status:</span>
                  <span className="text-emerald-700 font-bold truncate block">
                    AES-256 Encrypted ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setRenewalModalDoc(activeDocumentForPreview);
                  setActiveDocumentForPreview(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Prepare Renewal Packet</span>
              </button>

              <IOSButton
                variant="secondary"
                size="md"
                onClick={() => setActiveDocumentForPreview(null)}
              >
                Close Record
              </IOSButton>
            </div>
          </div>
        </IOSSheet>
      )}

      {/* DocAgent Autonomous Renewal Modal */}
      {renewalModalDoc && (
        <DocAgentRenewalModal
          isOpen={Boolean(renewalModalDoc)}
          onClose={() => setRenewalModalDoc(null)}
          document={renewalModalDoc}
          user={user}
          onRenewSuccess={handleRenewSuccess}
        />
      )}
    </div>
  );
};
