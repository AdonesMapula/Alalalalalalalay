import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSButton } from '../common/IOSButton';
import { IOSCard } from '../common/IOSCard';

export const ScrapingPipelineVisualizer = () => {
  const { runLiveScrapeSimulation, isScrapingLive, scrapingProgress } = useApp();

  const pipelineStages = [
    { id: 1, title: 'Gov Website URL', desc: 'Approved Agency Portals (.gov.ph)', icon: Globe, color: '#007AFF' },
    { id: 2, title: 'Web Scraper', desc: 'Automated Headless Crawler', icon: RotateCw, color: '#5856D6' },
    { id: 3, title: 'Content Extractor', desc: 'Clean DOM & PDF Circulars', icon: Layers, color: '#AF52DE' },
    { id: 4, title: 'AI Policy Parser', desc: 'LLM Benefit & Rule Understanding', icon: Cpu, color: '#FF2D55' },
    { id: 5, title: 'Opportunity Extractor', desc: 'Structured Requirements & Terms', icon: Sparkles, color: '#FF9500' },
    { id: 6, title: 'Admin Review Guardrail', desc: 'Super Admin Verification Check', icon: ShieldCheck, color: '#30B0C7' },
    { id: 7, title: 'Knowledge Base', desc: 'Supabase Vector & Relational Store', icon: Database, color: '#34C759' },
    { id: 8, title: 'Citizen Matching', desc: 'Personalized Eligibility Feeds', icon: CheckCircle2, color: '#007AFF' },
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
          onClick={() => runLiveScrapeSimulation()}
          className="shadow-md shadow-blue-500/20"
        >
          {isScrapingLive ? 'Executing Scraping Pipeline...' : 'Run Pipeline Simulation'}
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

      {/* 8-Stage Pipeline Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineStages.map((stage, idx) => {
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
                  <span>Healthy</span>
                </span>
                <span className="text-slate-400 font-mono">99.8% uptime</span>
              </div>
            </IOSCard>
          );
        })}
      </div>

      {/* Live Pipeline Event Stream & Telemetry */}
      <IOSCard className="space-y-4 bg-slate-950 text-slate-100 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Live Ingestion Event Stream</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Protocol: HTTPS / DOM / PDF-A Parser</span>
        </div>

        <div className="font-mono text-xs space-y-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
          <div className="text-emerald-400">
            [2026-08-15 08:52:10] CRAWL_NODE_01: Ingested https://www.philhealth.gov.ph/benefits/senior_citizen/ (SHA256: a94f10e42d7c)
          </div>
          <div className="text-blue-400">
            [2026-08-15 08:52:12] AI_PARSER: Extracted 4 mandatory requirements, 4 benefits, 0 policy conflicts.
          </div>
          <div className="text-purple-400">
            [2026-08-15 08:52:15] VECTOR_INDEX: Synced 18 embedding chunks to Supabase pgvector knowledge store.
          </div>
          <div className="text-emerald-400">
            [2026-08-15 08:52:18] MATCH_ENGINE: Evaluated 1,420 registered citizen profiles. 94% match flagged for citizen Adones Santos.
          </div>
          <div className="text-slate-400">
            [2026-08-15 08:52:20] GUARDRAIL_DAEMON: Strict traceability check passed. 0 unverified claims.
          </div>
        </div>
      </IOSCard>
    </div>
  );
};
