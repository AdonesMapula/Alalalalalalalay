import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Layers,
  ListOrdered,
  Building2,
  FileText,
  UploadCloud,
} from 'lucide-react';

/**
 * Helper to convert markdown **bold text** into bold characters (<strong className="font-extrabold text-slate-900">)
 */
export function renderFormattedInlineText(str = '') {
  if (!str) return '';
  const parts = String(str).split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-extrabold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Parses raw AI response text into structured blocks:
 * - headings
 * - checklists (with ✓ and ✗)
 * - step-by-step card sequences
 * - fee / turnaround highlights
 * - sources
 * - standard paragraphs
 */
function parseAiContent(text = '', sourceUrl = '') {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks = [];
  let currentBullets = [];
  let currentSteps = [];
  // Tracks the most recent heading so a numbered "Prerequisites" list (e.g. AI output
  // that numbers requirements instead of bulleting them) still renders as the distinct
  // checklist section rather than being mistaken for the numbered procedure stepper.
  let currentSectionIsPrerequisites = false;

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      const isChecklist = currentBullets.some(
        (b) => b.includes('✓') || b.includes('✗') || b.toLowerCase().includes('verified') || b.toLowerCase().includes('action required')
      );
      blocks.push({
        type: isChecklist ? 'checklist' : 'bullets',
        items: [...currentBullets],
      });
      currentBullets = [];
    }
  };

  const flushSteps = () => {
    if (currentSteps.length > 0) {
      blocks.push({
        type: 'step_cards',
        steps: [...currentSteps],
      });
      currentSteps = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) {
      flushBullets();
      flushSteps();
      continue;
    }

    // Step Match: 1. Step 1 (Title): ..., 1. Step 1: ..., 1. Title: ..., or 1. Content...
    const stepMatch = raw.match(/^(\d+)[\.\)]\s*(?:(?:Step\s*\d+|STEP\s*\d+)\s*[:\-\(]?\s*([^:\)]+)?[\):\-]?\s*)?(.*)/i);
    const isExplicitStepLine = /^(?:Step\s*\d+|\d+\.\s*Step|\d+\.)/i.test(raw);

    // A numbered line inside a "Prerequisites / Required Documents" section is a
    // requirement, not a procedure step — render it in the checklist, not the stepper.
    if (isExplicitStepLine && currentSectionIsPrerequisites) {
      flushSteps();
      currentBullets.push(raw.replace(/^\d+[\.\)]\s*/, ''));
      continue;
    }

    if (isExplicitStepLine && stepMatch) {
      flushBullets();
      const stepNumber = parseInt(stepMatch[1], 10) || currentSteps.length + 1;
      let title = (stepMatch[2] || '').trim();
      let content = (stepMatch[3] || '').trim();

      // If content has a title before colon: e.g. "Prerequisites: Prepare 1 valid ID"
      if (!title && content.includes(':')) {
        const colonSplit = content.split(':');
        title = colonSplit[0].trim();
        content = colonSplit.slice(1).join(':').trim();
      }

      if (!content && title) {
        content = title;
        title = `Step ${stepNumber}`;
      }

      currentSteps.push({
        stepNumber,
        title: title || `Step ${stepNumber}`,
        content: content || raw.replace(/^\d+[\.\)]\s*/, ''),
      });
      continue;
    }

    // Bullet points (•, - , * ) — require a space after the marker so a bold-only
    // heading line like "**Title** (Agency)" isn't mistaken for a "*" bullet.
    if (raw.startsWith('•') || raw.startsWith('- ') || raw.startsWith('* ')) {
      flushSteps();
      currentBullets.push(raw.replace(/^[•\-\*]\s*/, ''));
      continue;
    }

    // Regular line / Heading / Source
    flushBullets();
    flushSteps();

    const lower = raw.toLowerCase();
    if (lower.includes('verified source:') || lower.includes('official portal:') || lower.includes('source:')) {
      blocks.push({
        type: 'source',
        content: raw,
      });
    } else if (raw.startsWith('###') || raw.startsWith('##') || (/:\*{0,2}$/.test(raw) && raw.length < 80)) {
      // Trailing colon may be wrapped in markdown bold (e.g. "**Prerequisites:**"), so
      // strip both before testing/storing so heading detection isn't markdown-fragile.
      const headingText = raw.replace(/^#+\s*/, '').replace(/\*+/g, '').replace(/\:$/, '');
      currentSectionIsPrerequisites = /prerequisite|required (document|credential)/i.test(headingText);
      blocks.push({
        type: 'heading',
        content: headingText,
      });
    } else {
      blocks.push({
        type: 'paragraph',
        content: raw,
      });
    }
  }

  flushBullets();
  flushSteps();

  return blocks;
}

/**
 * Interactive Compact Stepper Card Deck Component
 * Allows users to view steps as cards (either one-by-one or expanded grid) to eliminate lengthy vertical scrolling
 */
const StepCardsDeck = ({ steps = [], size = 'md' }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState(steps.length > 2 ? 'compact' : 'all'); // 'compact' (one at a time) or 'all' (grid cards)

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="my-2 rounded-2xl bg-white border border-blue-100/90 shadow-sm overflow-hidden select-none">
      {/* Top Stepper Header Bar */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 px-3.5 py-2.5 border-b border-blue-100/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#093a96] text-white flex items-center justify-center text-[10px] font-black">
            <ListOrdered className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-extrabold text-[#093a96] tracking-tight uppercase">
            Step-by-Step Procedure ({steps.length} Steps)
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'compact' ? 'all' : 'compact')}
          className="px-2.5 py-1 rounded-xl bg-white border border-blue-200/80 hover:bg-blue-50 text-[10px] font-bold text-[#093a96] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
        >
          <Layers className="w-3 h-3" />
          <span>{viewMode === 'compact' ? 'View All Cards' : 'One Card at a Time'}</span>
        </button>
      </div>

      {viewMode === 'compact' ? (
        /* SINGLE CARD COMPACT VIEW WITH STEPPER CONTROLS */
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {steps.map((s, idx) => {
              const isActive = idx === activeStepIndex;
              const isPast = idx < activeStepIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#093a96] text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{s.stepNumber || idx + 1}</span>
                  <span className="hidden sm:inline truncate max-w-[80px]">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Card Content */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafd] border border-blue-100/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-[#093a96] text-[10px] font-black uppercase tracking-wider">
                Step {currentStep.stepNumber || activeStepIndex + 1} of {steps.length}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Action Step
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-[#093a96] pt-0.5">
              {renderFormattedInlineText(currentStep.title)}
            </h4>

            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-medium">
              {renderFormattedInlineText(currentStep.content)}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeStepIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-[11px] font-extrabold text-slate-500">
              {activeStepIndex + 1} / {steps.length}
            </span>

            <button
              type="button"
              onClick={() => setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))}
              disabled={activeStepIndex === steps.length - 1}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeStepIndex === steps.length - 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                  : 'bg-[#093a96] hover:bg-[#072d75] text-white shadow-2xs'
              }`}
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* ALL CARDS EXPANDED GRID VIEW */
        <div className="p-3 sm:p-4 space-y-2.5">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#f8fafd] border border-blue-100 hover:border-blue-300 shadow-2xs transition-all flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#093a96] text-white flex items-center justify-center font-black text-[11px] flex-shrink-0 mt-0.5 shadow-2xs">
                {s.stepNumber || idx + 1}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-xs font-extrabold text-[#093a96]">
                  {renderFormattedInlineText(s.title)}
                </div>
                <div className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-medium">
                  {renderFormattedInlineText(s.content)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Master AI Message Renderer with Interactive Step Cards, Checklists, & Highlighting
 */
export const AiMessageRenderer = ({
  text = '',
  sourceUrl = '',
  matchedOpportunities = [],
  onOpenOpportunity = null,
  onUploadDocument = null,
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const blocks = parseAiContent(text, sourceUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSmall = size === 'sm';

  return (
    <div className={`space-y-3 leading-relaxed text-slate-800 relative group ${isSmall ? 'text-xs' : 'text-xs sm:text-sm'}`}>
      {/* Quick Copy Float Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-0 right-0 p-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center gap-1 text-[10px] font-bold z-10 shadow-2xs"
        title="Copy response text"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {blocks.map((block, idx) => {
        // 1. SECTION HEADINGS
        if (block.type === 'heading') {
          return (
            <div
              key={idx}
              className={`font-black text-[#093a96] pt-1.5 pb-1 border-b border-blue-100 flex items-center gap-1.5 ${
                isSmall ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{renderFormattedInlineText(block.content)}</span>
            </div>
          );
        }

        // 2. INTERACTIVE STEP-BY-STEP CARDS DECK
        if (block.type === 'step_cards') {
          return <StepCardsDeck key={idx} steps={block.steps} size={size} />;
        }

        // 3. DOCUMENT CHECKLIST CARDS (✓ and ✗)
        if (block.type === 'checklist') {
          return (
            <div key={idx} className="grid grid-cols-1 gap-1.5 pt-0.5">
              {block.items.map((item, bIdx) => {
                const isMet = item.includes('✓') || item.toLowerCase().includes('verified in vault') || item.toLowerCase().includes('verified in profile');
                const isAction = item.includes('✗') || item.toLowerCase().includes('action required') || item.toLowerCase().includes('missing');
                const cleanItem = item.replace(/^[•\-\*]\s*/, '');
                const requirementName = cleanItem.replace(/—\s*(✓|✗).*$/, '').trim();

                return (
                  <div
                    key={bIdx}
                    className={`p-2.5 rounded-xl border flex flex-col gap-2 text-[11px] sm:text-xs font-medium transition-all shadow-2xs ${
                      isMet
                        ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
                        : isAction
                        ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isMet ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : isAction ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] flex-shrink-0" />
                        )}
                        <span className="truncate leading-snug">{renderFormattedInlineText(requirementName)}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                          isMet
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isAction
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isMet ? '✓ In Vault' : isAction ? 'Action Required' : 'Requirement'}
                      </span>
                    </div>

                    {isAction && onUploadDocument && (
                      <button
                        type="button"
                        onClick={() => onUploadDocument(requirementName)}
                        className="self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Upload Document</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

        // 4. BULLET POINTS
        if (block.type === 'bullets') {
          return (
            <div key={idx} className="space-y-1.5 pt-0.5">
              {block.items.map((item, bIdx) => {
                const hasMoney = item.includes('₱');
                return (
                  <div
                    key={bIdx}
                    className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] sm:text-xs ${
                      hasMoney
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-semibold'
                        : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] flex-shrink-0 mt-1.5" />
                    <span className="leading-snug">{renderFormattedInlineText(item)}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        // 5. OFFICIAL SOURCE CITATION
        if (block.type === 'source') {
          const matchUrl = block.content.match(/(https?:\/\/[^\s\)]+)/);
          const cleanUrl = matchUrl ? matchUrl[1] : sourceUrl || 'https://www.gov.ph';
          const domain = cleanUrl.replace(/^https?:\/\//, '').split('/')[0];

          return (
            <div
              key={idx}
              className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 flex-wrap gap-2"
            >
              <div className="flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Verified Government Charter Citation</span>
              </div>
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#093a96] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{domain}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          );
        }

        // 6. STANDARD PARAGRAPHS
        return (
          <p key={idx} className="leading-relaxed text-slate-800 font-normal">
            {renderFormattedInlineText(block.content)}
          </p>
        );
      })}
    </div>
  );
};
