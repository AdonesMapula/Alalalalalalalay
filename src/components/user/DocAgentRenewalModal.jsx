import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Copy,
  Check,
  Printer,
  Clock,
  Coins,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Building,
  MapPin,
  X,
} from 'lucide-react';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';
import { generateRenewalPacket } from '../../services/docAgentService';

export const DocAgentRenewalModal = ({
  isOpen,
  onClose,
  document,
  user,
  onRenewSuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const renewalPacket = generateRenewalPacket(document, user);

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(renewalPacket.requestLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ALALAY DocAgent - ${document.name} Renewal Request</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; }
              pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
              .header { border-bottom: 2px solid #093a96; padding-bottom: 12px; margin-bottom: 24px; }
              .seal { font-weight: bold; color: #093a96; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="seal">PHILIPPINES eGOV / ALALAY AUTONOMOUS CITIZEN VAULT</div>
              <div>Official Document Re-issuance & Renewal Form</div>
            </div>
            <pre>${renewalPacket.requestLetter}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <IOSSheet
      isOpen={isOpen}
      onClose={onClose}
      title="DocAgent Renewal Generator"
      subtitle={`Autonomous Renewal Packet for ${document.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 select-none">
        {/* Header Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-950">
                Document Renewal Action Plan
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                DocAgent Verified
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              DocAgent has generated an official, legally grounded re-issuance request letter and submission checklist for your local issuing office.
            </p>
          </div>
        </div>

        {/* Turnaround Time & Fee Notice Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Estimated Turnaround
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {renewalPacket.turnaroundTime}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
                Statutory Fee Waiver
              </span>
              <span className="text-xs font-bold text-emerald-900 truncate block">
                100% Free (RA 11261 / Indigent)
              </span>
            </div>
          </div>
        </div>

        {/* Required Submission Checklist */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[11px] font-extrabold text-[#093a96] flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Prerequisites for Submission:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {renewalPacket.checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-white border border-slate-200/80 text-[11px] font-medium text-slate-700 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] flex-shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Request Letter Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#093a96]" />
              <span>Pre-Filled Official Request Letter</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLetter}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Form'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-2.5 py-1 rounded-lg bg-[#093a96] text-white hover:bg-[#072d75] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                <span>Print Packet</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-800 max-h-56 overflow-y-auto no-scrollbar shadow-inner whitespace-pre-wrap">
            {renewalPacket.requestLetter}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
          <IOSButton variant="secondary" size="md" onClick={onClose}>
            Close
          </IOSButton>
          <IOSButton
            variant="primary"
            size="md"
            icon={Check}
            onClick={() => {
              if (onRenewSuccess) onRenewSuccess(document.id);
              onClose();
            }}
          >
            Mark as Renewed in Vault
          </IOSButton>
        </div>
      </div>
    </IOSSheet>
  );
};
