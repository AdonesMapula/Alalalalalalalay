import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSButton } from '../common/IOSButton';
import { IOSBadge } from '../common/IOSBadge';
import { IOSSegmentedControl } from '../common/IOSSegmentedControl';
import { IOSSheet } from '../common/IOSSheet';

export const DocumentsView = () => {
  const {
    documents,
    setUploadModalOpen,
    replaceDocument,
    deleteDocument,
    activeDocumentForPreview,
    setActiveDocumentForPreview,
  } = useApp();

  const [filterTab, setFilterTab] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Files', count: documents.length },
    {
      id: 'valid',
      label: 'Valid',
      count: documents.filter((d) => d.status === 'Valid').length,
    },
    {
      id: 'expiring',
      label: 'Expiring Soon',
      count: documents.filter((d) => d.status === 'Expiring Soon').length,
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    if (filterTab === 'valid') return doc.status === 'Valid';
    if (filterTab === 'expiring') return doc.status === 'Expiring Soon';
    return true;
  });

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header and Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
              Citizen Document Vault
            </h1>
            <IOSBadge variant="blue" icon={<Lock className="w-3 h-3" />}>
              Encrypted
            </IOSBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
            Official government credentials and clearances used for automatic opportunity verification
          </p>
        </div>

        <IOSButton
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setUploadModalOpen(true)}
          className="shadow-md shadow-blue-500/20"
        >
          Upload Document
        </IOSButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <IOSSegmentedControl
          options={filterOptions}
          value={filterTab}
          onChange={setFilterTab}
        />

        <div className="text-xs text-slate-500">
          Total Vault Size: <strong>5.4 MB</strong> • 100% RLS Protected
        </div>
      </div>

      {/* Expiring Soon Alert Banner */}
      {documents.some((d) => d.status === 'Expiring Soon') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Attention Needed:</strong> Your NBI Clearance expires in 18 days (Sep 02, 2026). Upload an updated copy to keep loan & scholarship eligibility active.
            </div>
          </div>
          <IOSButton
            variant="tertiary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="!bg-white !text-amber-900 border-amber-300"
          >
            Upload Renewal
          </IOSButton>
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isValid = doc.status === 'Valid';
          const isExpiring = doc.status === 'Expiring Soon';

          return (
            <IOSCard
              key={doc.id}
              className="flex flex-col justify-between space-y-4 bg-white border border-slate-200/80 group"
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {doc.type}
                  </span>

                  {isExpiring ? (
                    <IOSBadge variant="orange" icon={<AlertTriangle className="w-3 h-3" />}>
                      Expires in 18d
                    </IOSBadge>
                  ) : (
                    <IOSBadge variant="green" icon={<CheckCircle2 className="w-3 h-3" />}>
                      Valid
                    </IOSBadge>
                  )}
                </div>

                {/* Thumbnail / Document Representation */}
                <div
                  onClick={() => setActiveDocumentForPreview(doc)}
                  className="h-28 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden relative group/thumb cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={doc.thumbnail}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 ios-spring"
                  />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 ios-spring flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                    <Eye className="w-4 h-4" />
                    <span>View Record</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1C1C1E] line-clamp-1 group-hover:text-[#007AFF] ios-spring">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-[#8E8E93] truncate mt-0.5">{doc.issuer}</p>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doc No:</span>
                  <span className="font-mono font-medium text-slate-800 truncate max-w-[140px]">
                    {doc.documentNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expiration:</span>
                  <span className={`font-semibold ${isExpiring ? 'text-amber-700' : 'text-slate-800'}`}>
                    {doc.expirationDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Source:</span>
                  <span className="text-[#007AFF] font-medium">
                    {doc.isEgovRetrieved ? 'eGov Synced' : 'Citizen Upload'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDocumentForPreview(doc)}
                  className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {isExpiring && (
                    <button
                      type="button"
                      onClick={() => replaceDocument(doc.id)}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Renew Document"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center mx-auto">
            <FolderLock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Documents in Vault</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              There are no documents uploaded yet. Verified documents synchronized from the administrator or added by you will appear here.
            </p>
          </div>
          <IOSButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setUploadModalOpen(true)}
            className="mx-auto"
          >
            Upload Document
          </IOSButton>
        </div>
      )}

      {/* Document Preview Sheet Modal */}
      {activeDocumentForPreview && (
        <IOSSheet
          isOpen={Boolean(activeDocumentForPreview)}
          onClose={() => setActiveDocumentForPreview(null)}
          title={activeDocumentForPreview.name}
          subtitle={activeDocumentForPreview.issuer}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 select-none">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white max-h-80 flex items-center justify-center p-4">
              <img
                src={activeDocumentForPreview.thumbnail}
                alt={activeDocumentForPreview.name}
                className="max-h-72 object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold">{activeDocumentForPreview.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Number:</span>
                <span className="font-mono font-bold">{activeDocumentForPreview.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Date:</span>
                <span>{activeDocumentForPreview.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiration Date:</span>
                <span className="font-bold text-[#007AFF]">{activeDocumentForPreview.expirationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Verification:</span>
                <span className="font-semibold text-emerald-700">{activeDocumentForPreview.verifiedBadge}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <IOSButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setActiveDocumentForPreview(null)}
              >
                Close Preview
              </IOSButton>
            </div>
          </div>
        </IOSSheet>
      )}
    </div>
  );
};
