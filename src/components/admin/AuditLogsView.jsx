import React from 'react';
import { ShieldCheck, Lock, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSCard } from '../common/IOSCard';
import { IOSBadge } from '../common/IOSBadge';

export const AuditLogsView = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
            System & Privacy Audit Logs
          </h1>
          <IOSBadge variant="blue" icon={<Lock className="w-3 h-3" />}>
            Immutable Trail
          </IOSBadge>
        </div>
        <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
          Cryptographically recorded actions, scraper executions, admin approvals, and AI guardrail enforcements
        </p>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <IOSCard
            key={log.id}
            padding="p-4"
            className="bg-white border border-slate-200/80 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  {log.action}
                </span>
                <span className="font-semibold text-slate-700">Actor: {log.actor}</span>
              </div>
              <span className="text-[#8E8E93] font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 font-medium">
              Target: <span className="text-[#007AFF]">{log.target}</span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
              {log.details}
            </p>
          </IOSCard>
        ))}
      </div>
    </div>
  );
};
