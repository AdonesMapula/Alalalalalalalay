import React, { useState } from 'react';
import {
  Globe,
  Database,
  Cpu,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Play,
  RotateCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';
import { IOSCard } from '../common/IOSCard';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getApiKey } from '../../services/geminiService';

export const ScrapingPipelineVisualizer = () => {
  const {
    sources,
    opportunities,
    reviewQueue,
    managedUsers,
    auditLogs,
    runLiveScraper,
    isScrapingLive,
    scrapingProgress,
  } = useApp();

  const totalIndexedDocs = sources.reduce(
    (acc, s) => acc + (s.documents_indexed || s.documentsIndexed || 1),
    0
  );
  const activeSourcesCount = sources.filter(
    (s) => (s.status || '').toLowerCase() === 'active'
  ).length;

  const apiKey = getApiKey();

  const pipelineStages = [
    {
      id: 1,
      title: 'Gov Website URL',
      desc: `${sources.length} Configured Sources`,
      metric: `${activeSourcesCount} Active / ${sources.length} Total`,
      icon: Globe,
      color: '#007AFF',
      status: 'Healthy',
    },
    {
      id: 2,
      title: 'Web Scraper',
      desc: 'Cheerio & Multi-Proxy Engine',
      metric: isScrapingLive ? 'Scraping in Progress...' : 'Ready & Idle',
      icon: RotateCw,
      color: '#5856D6',
      status: isScrapingLive ? 'Running' : 'Healthy',
    },
    {
      id: 3,
      title: 'Content Extractor',
      desc: 'DOM, OG & JSON-LD Parser',
      metric: `${totalIndexedDocs} Document Blocks`,
      icon: Layers,
      color: '#AF52DE',
      status: 'Healthy',
    },
    {
      id: 4,
      title: 'AI Policy Parser',
      desc: `Gemini AI (${apiKey ? 'Connected' : 'Deterministic Mode'})`,
      metric: 'gemini-2.5-flash / Bearer Auth',
      icon: Cpu,
      color: '#FF2D55',
      status: apiKey ? 'Connected' : 'Active',
    },
    {
      id: 5,
      title: 'Opportunity Extractor',
      desc: 'Requirements & Benefits Mapper',
      metric: `${opportunities.length} Published Opportunities`,
      icon: Sparkles,
      color: '#FF9500',
      status: 'Healthy',
    },
    {
      id: 6,
      title: 'Admin Review Guardrail',
      desc: 'Super Admin Verification Check',
      metric: `${reviewQueue.length} Items in Review Queue`,
      icon: ShieldCheck,
      color: '#30B0C7',
      status: reviewQueue.length > 0 ? 'Pending Action' : 'All Clear',
    },
    {
      id: 7,
      title: 'Knowledge Base',
      desc: 'Supabase Vector & Relational Store',
      metric: isSupabaseConfigured ? 'Supabase Live' : 'Local Database',
      icon: Database,
      color: '#34C759',
      status: 'Healthy',
    },
    {
      id: 8,
      title: 'Citizen Matching',
      desc: 'Personalized Eligibility Feeds',
      metric: `${managedUsers.length} Citizen Profiles Evaluated`,
      icon: CheckCircle2,
      color: '#007AFF',
      status: 'Healthy',
    },
  ];

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
              AI Scraping & Verification Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Autonomous
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
            Real-time visual monitoring of government policy ingestion, AI parsing, and guardrail enforcement
          </p>
        </div>

        <IOSButton
          variant="primary"
          size="md"
          icon={Play}
          loading={isScrapingLive}
          onClick={() => runLiveScraper()}
          className="shadow-md shadow-blue-500/20"
        >
          {isScrapingLive ? 'Executing Scraping Pipeline...' : 'Run Live Facebook Scraper Pipeline'}
        </IOSButton>
      </div>

      {/* Live Active Scraping Banner if running */}
      {isScrapingLive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 space-y-3 transform animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <RotateCw className="w-4 h-4 animate-spin text-blue-200" />
              <span>Live Ingestion Active</span>
            </div>
            <span className="text-xs font-mono text-blue-200">{scrapingProgress.percent}% Complete</span>
          </div>

          <div className="w-full h-2 bg-blue-800/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-white ios-spring duration-300"
              style={{ width: `${scrapingProgress.percent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-blue-100 gap-1">
            <span>Stage: <strong>{scrapingProgress.stage}</strong></span>
            <span className="font-mono text-[11px] truncate max-w-md">{scrapingProgress.currentUrl}</span>
          </div>
        </div>
      )}

      {/* 8-Stage Pipeline Nodes Grid with Real Dynamic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => {
          const Icon = stage.icon;

          return (
            <IOSCard
              key={stage.id}
              padding="p-4 sm:p-5"
              className="relative overflow-hidden bg-white border border-slate-200/80 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: stage.color }}
                >
                  <Icon className={`w-5 h-5 ${isScrapingLive ? 'animate-pulse-subtle' : ''}`} />
                </div>
                <span className="text-xs font-bold font-mono text-slate-400">
                  0{stage.id}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1C1C1E]">{stage.title}</h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">{stage.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stage.status}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                  {stage.metric}
                </span>
              </div>
            </IOSCard>
          );
        })}
      </div>

      {/* Live Pipeline Event Stream & Telemetry (Streaming Real Audit Logs) */}
      <IOSCard className="space-y-4 bg-slate-950 text-slate-100 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Live Ingestion Event Stream</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Protocol: HTTPS / DOM / SHA-256</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
              {auditLogs.length} Events Logged
            </span>
          </div>
        </div>

        <div className="font-mono text-xs space-y-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto">
          {/* Live Scraping in-flight log line if active */}
          {isScrapingLive && (
            <div className="text-amber-400 animate-pulse flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                [{new Date().toISOString().replace('T', ' ').slice(0, 19)}] PIPELINE_ACTIVE: {scrapingProgress.stage} ({scrapingProgress.currentUrl})
              </span>
            </div>
          )}

          {/* Real Stream of Audit Logs */}
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.slice(0, 8).map((log, idx) => {
              const timeStr = log.timestamp
                ? log.timestamp.replace('T', ' ').slice(0, 19)
                : new Date().toISOString().replace('T', ' ').slice(0, 19);

              const isError = (log.status || '').toLowerCase().includes('error');
              const colorClass = isError
                ? 'text-rose-400'
                : idx === 0
                ? 'text-emerald-400'
                : idx === 1
                ? 'text-blue-400'
                : idx === 2
                ? 'text-purple-400'
                : 'text-slate-300';

              return (
                <div key={log.id || idx} className={colorClass}>
                  [{timeStr}] {log.action}: {log.target} — {log.details || log.actor || 'Completed'}
                </div>
              );
            })
          ) : (
            <div className="text-slate-500 py-4 text-center">
              No telemetry events recorded yet. Click "Run Live Scraper" above to stream ingestion events.
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};
