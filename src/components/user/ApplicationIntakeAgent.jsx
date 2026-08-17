import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  ChevronRight,
  CheckCircle2,
  Circle,
  Printer,
  Save,
  Download,
  ArrowLeft,
  Sparkles,
  User,
  FileText,
  FolderOpen,
  MessageCircle,
  AlertCircle,
  SkipForward,
  Check,
  Clock,
  ExternalLink,
  RefreshCw,
  ClipboardCheck,
  UploadCloud,
  X,
  File,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INTAKE_PROGRAMS,
  buildIntakeSession,
  getActiveGapFields,
  processUserReply,
  generateOpeningGreeting,
  getSessionStats,
  INTAKE_FORM_TEMPLATES,
  generateDocFormattedHtml,
  downloadApplicationAsDoc,
  printApplicationDocument,
} from '../../services/applyAiService';
import { getDocumentPlaceholderThumbnail } from '../../services/docAgentService';
import { parseUploadedImage } from '../../services/imageParserService';
import { parseResumeFileOrPreset } from '../../services/resumeParserService';
import logoImg from '../../assets/logos.png';

// =============================================================================
// SOURCE BADGE — shows where a field value came from
// =============================================================================
const SourceBadge = ({ source }) => {
  const config = {
    profile: { label: 'From Profile', color: 'bg-blue-100 text-blue-700', icon: User },
    documents: { label: 'From Vault', color: 'bg-emerald-100 text-emerald-700', icon: FolderOpen },
    conversation: { label: 'You told me', color: 'bg-violet-100 text-violet-700', icon: MessageCircle },
    'auto-skipped': { label: 'Not applicable', color: 'bg-slate-100 text-slate-500', icon: SkipForward },
  };
  const c = config[source] || config.profile;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {c.label}
    </span>
  );
};

// =============================================================================
// PHASE 1 — PROGRAM SELECTOR
// =============================================================================
const ProgramSelector = ({ onSelect, preselectedId }) => {
  useEffect(() => {
    if (preselectedId) {
      const prog = INTAKE_PROGRAMS.find((p) => p.id === preselectedId);
      if (prog) onSelect(prog);
    }
  }, [preselectedId, onSelect]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#093a96] to-[#1d4ed8] flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Apply with AI Agent</h1>
            <p className="text-xs text-slate-500 font-medium">No forms. Just a conversation.</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-[#093a96]/8 to-indigo-50 rounded-2xl border border-blue-100">
          <p className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#093a96]">How it works:</span> Pick a program below. The AI agent will
            interview you, fill the form in the background using your profile + documents, and produce a
            print-ready application — in about 2 minutes.
          </p>
        </div>
      </div>

      {/* Program Cards */}
      <div className="px-6 pb-8 grid grid-cols-1 gap-4">
        {INTAKE_PROGRAMS.map((program) => (
          <button
            key={program.id}
            type="button"
            onClick={() => onSelect(program)}
            className="group w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-stretch">
              {/* Color stripe */}
              <div
                className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${program.gradient} rounded-l-2xl`}
              />

              <div className="flex-1 p-4 pr-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{program.icon}</span>
                      <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#093a96] transition-colors">
                        {program.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{program.agency}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{program.tagline}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#093a96] flex-shrink-0 mt-1 transition-colors" />
                </div>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-xl"
                    style={{ background: `${program.color}18`, color: program.color }}
                  >
                    {program.benefit}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{program.estimatedMinutes} min
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {program.gapFieldsCount} question{program.gapFieldsCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Auto-filled from your profile:</span>
                  {program.profileFieldsUsed.map((f) => (
                    <span key={f} className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// LIVE FORM PREVIEW PANEL (right side during conversation)
// =============================================================================
const LiveFormPreview = ({ session, currentFieldId }) => {
  if (!session) return null;
  const template = session.template;
  const filled = session.filledFields;

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-700 truncate">{template.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {template.fields.map((field) => {
          const entry = filled[field.id];
          const isCurrent = field.id === currentFieldId;
          const isFilled = Boolean(entry?.value);
          const isWaiting = !isFilled && !isCurrent;

          return (
            <div
              key={field.id}
              className={`rounded-xl border transition-all duration-500 overflow-hidden ${
                isCurrent
                  ? 'border-[#093a96] shadow-sm shadow-blue-100 bg-white ring-1 ring-[#093a96]/20'
                  : isFilled
                  ? 'border-slate-200 bg-white'
                  : 'border-dashed border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-[#093a96]' : 'text-slate-400'}`}>
                    {field.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isFilled && <SourceBadge source={entry.source} />}
                    {isCurrent && (
                      <span className="text-[10px] bg-[#093a96] text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Filling...
                      </span>
                    )}
                  </div>
                </div>

                {isFilled ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-800 break-words leading-snug">
                      {entry.value || '—'}
                    </p>
                  </div>
                ) : isCurrent ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#093a96] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#093a96] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#093a96] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] text-[#093a96] font-semibold">Waiting for your answer...</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 font-medium italic">Not yet answered</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {session && (
        <div className="px-4 py-3 border-t border-slate-200 bg-white">
          {(() => {
            const stats = getSessionStats(session);
            const pct = Math.round((stats.total / stats.templateTotal) * 100);
            return (
              <>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Form Progress</span>
                  <span className="text-[10px] font-bold text-[#093a96]">{stats.total}/{stats.templateTotal} fields</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-[#093a96] to-blue-400 h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// AGENT MESSAGE RENDERER — formats the agent's messages nicely
// =============================================================================
const AgentMessage = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-800">
      {lines.map((line, i) => {
        const raw = line.trim();
        if (!raw) return <div key={i} className="h-1" />;
        if (raw.startsWith('✅') || raw.startsWith('⚠️')) {
          return (
            <p key={i} className="font-bold text-slate-900">
              {raw}
            </p>
          );
        }
        if (raw.startsWith('**') && raw.endsWith('**')) {
          return (
            <p key={i} className="font-bold text-[#093a96]">
              {raw.replace(/\*\*/g, '')}
            </p>
          );
        }
        return <p key={i}>{raw}</p>;
      })}
    </div>
  );
};

// =============================================================================
// PHASE 2 — CONVERSATIONAL INTAKE
// =============================================================================
const IntakeConversation = ({ program, session: initialSession, user, onComplete, onBack }) => {
  const [session, setSession] = useState(initialSession);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentFieldId, setCurrentFieldId] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize with opening greeting
  useEffect(() => {
    const greeting = generateOpeningGreeting(initialSession, user);
    const activeGaps = getActiveGapFields(initialSession);
    const firstField = activeGaps[0];

    setMessages([{ id: 1, role: 'agent', text: greeting }]);
    setCurrentFieldId(firstField?.id || null);

    if (activeGaps.length === 0) {
      // All fields already filled — skip to complete
      setTimeout(() => onComplete(initialSession), 500);
    }
  }, [initialSession, user, onComplete]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // ── Auto-fill intake form fields using Document & Image Parser ─────────────
  const handleApplyResumeAutofill = async (file) => {
    if (!file) return;
    setIsParsingResume(true);
    try {
      const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name);
      let p = null;

      if (isImage) {
        p = await parseUploadedImage(file);
      } else {
        const res = await parseResumeFileOrPreset(file);
        if (res.success && res.data) {
          p = res.data;
        }
      }

      if (p) {
        const updatedFilled = { ...session.filledFields };
        let filledCount = 0;

        session.template.fields.forEach((field) => {
          if (updatedFilled[field.id]?.value) return; // already filled

          let candidateVal = '';
          const fid = field.id.toLowerCase();
          const flabel = field.label.toLowerCase();

          if (fid.includes('name') || flabel.includes('name')) {
            candidateVal = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
          } else if (fid.includes('email') || flabel.includes('email')) {
            candidateVal = p.email;
          } else if (
            fid.includes('phone') ||
            fid.includes('contact') ||
            fid.includes('mobile') ||
            flabel.includes('phone') ||
            flabel.includes('mobile')
          ) {
            candidateVal = p.phone;
          } else if (fid.includes('address') || flabel.includes('address')) {
            candidateVal = p.address;
          } else if (
            fid.includes('birthday') ||
            fid.includes('birthdate') ||
            fid.includes('dob') ||
            flabel.includes('birth')
          ) {
            candidateVal = p.dateOfBirth;
          } else if (fid.includes('gender') || flabel.includes('gender') || flabel.includes('sex')) {
            candidateVal = p.gender;
          } else if (fid.includes('civil') || flabel.includes('status') || flabel.includes('marital')) {
            candidateVal = p.civilStatus;
          } else if (
            fid.includes('employ') ||
            fid.includes('job') ||
            fid.includes('work') ||
            flabel.includes('occupation') ||
            flabel.includes('employment')
          ) {
            candidateVal = p.headline || (p.experience ? p.experience.split('\n')[0] : 'Employed');
          } else if (fid.includes('educ') || flabel.includes('school') || flabel.includes('attainment')) {
            candidateVal = p.education ? p.education.split('\n')[0] : 'College Graduate';
          } else if (fid.includes('skill') || flabel.includes('skill')) {
            candidateVal = Array.isArray(p.skills) ? p.skills.slice(0, 5).join(', ') : p.skills;
          }

          if (candidateVal) {
            updatedFilled[field.id] = {
              value: candidateVal,
              source: 'documents',
              confidence: p.confidenceScore || 95,
              filledAt: new Date().toISOString(),
            };
            filledCount++;
          }
        });

        const newSession = {
          ...session,
          filledFields: updatedFilled,
        };
        const remainingGaps = getActiveGapFields(newSession);
        newSession.isComplete = remainingGaps.length === 0;

        setSession(newSession);
        setCurrentFieldId(remainingGaps[0]?.id || null);
        setShowResumeModal(false);

        const agentMsg =
          filledCount > 0
            ? `✅ **Document parsed!**\n\nI auto-filled **${filledCount} form field${
                filledCount !== 1 ? 's' : ''
              }** from your uploaded ${isImage ? 'image' : 'file'}.\n\n${
                remainingGaps.length > 0
                  ? `Let's answer the remaining ${remainingGaps.length} question${
                      remainingGaps.length !== 1 ? 's' : ''
                    }:`
                  : 'All form fields are now complete! Proceeding to document preview...'
              }`
            : `✅ Document parsed (${p.fullName || 'Citizen'}), but all standard fields were already filled. Let's continue!`;

        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'agent', text: agentMsg },
        ]);

        if (newSession.isComplete) {
          setTimeout(() => onComplete(newSession), 1200);
        }
      }
    } catch (err) {
      console.warn('Document Autofill Error:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isThinking) return;

    setInputValue('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'citizen', text }]);
    setIsThinking(true);

    try {
      const result = await processUserReply(session, text);
      setSession(result.session);

      const activeGaps = getActiveGapFields(result.session);
      setCurrentFieldId(activeGaps[0]?.id || null);

      if (result.agentMessage) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'agent', text: result.agentMessage, fieldFilled: result.fieldFilled },
        ]);
      }

      if (result.isComplete) {
        setTimeout(() => onComplete(result.session), 1200);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'agent', text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isThinking, session, onComplete]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeGaps = getActiveGapFields(session);
  const stats = getSessionStats(session);
  const progressPct = Math.round((stats.total / stats.templateTotal) * 100);

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* ── LEFT: Conversation ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base">{program.icon}</span>
                <span className="text-sm font-extrabold text-slate-900 truncate">{program.shortTitle}</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Agent Active
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-[#093a96] to-blue-400 h-1 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">
                  {stats.total}/{stats.templateTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Resume/Document Auto-Fill Action */}
          <button
            type="button"
            onClick={() => setShowResumeModal(true)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#093a96] text-[11px] font-bold border border-blue-200 transition-all cursor-pointer shadow-2xs"
            title="Upload an image or document to auto-fill application fields"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#093a96]" />
            <span>Auto-Fill from Document</span>
          </button>
        </div>

        {/* Document Auto-Fill Selector Modal Banner */}
        {showResumeModal && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm animate-in fade-in space-y-3 z-10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#093a96]">
                <Sparkles className="w-4 h-4 text-[#093a96]" />
                <span>Instant Image & Document Auto-Fill</span>
              </div>
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="p-1 rounded-lg hover:bg-white/80 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload a document image (PNG, JPG, WebP) or file (PDF, DOCX, TXT) to parse and auto-fill this application.
            </p>

            {/* Direct file upload dropzone */}
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleApplyResumeAutofill(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                disabled={isParsingResume}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-blue-50 border-2 border-dashed border-blue-300 text-xs font-bold text-[#093a96] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {isParsingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#093a96]" />
                    <span>Analyzing & parsing document...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Click to select or drop image / document file</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'citizen' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'agent' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#093a96] to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img src={logoImg} alt="Alalay" className="w-4 h-4 object-contain opacity-90" onError={(e) => { e.target.style.display='none'; }} />
                </div>
              )}
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'agent'
                    ? 'bg-white border border-slate-200 rounded-tl-sm'
                    : 'bg-[#093a96] text-white rounded-br-sm'
                }`}
              >
                {msg.role === 'agent' ? (
                  <>
                    <AgentMessage text={msg.text} />
                    {msg.fieldFilled && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Filled: {msg.fieldFilled.label}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
              </div>
              {msg.role === 'citizen' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#093a96] to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Processing your answer...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 bg-white">
          {activeGaps.length > 0 && !isThinking && (
            <div className="mb-2 px-1">
              <p className="text-[10px] text-slate-400 font-medium">
                Currently filling: <span className="text-[#093a96] font-bold">{activeGaps[0]?.label}</span>
              </p>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                disabled={isThinking || session.isComplete}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#093a96]/30 focus:border-[#093a96] transition-all bg-slate-50 disabled:opacity-50 min-h-[46px]"
                style={{ overflow: 'hidden' }}
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking || session.isComplete}
              className="w-11 h-11 rounded-2xl bg-[#093a96] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-900/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">Press Enter to send • You can answer in Filipino or English</p>
        </div>
      </div>

      {/* ── RIGHT: Live Form Preview (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 overflow-hidden">
        <LiveFormPreview session={session} currentFieldId={currentFieldId} />
      </div>
    </div>
  );
};

// =============================================================================
// PHASE 3 — FORM REVIEW + PRINT
// =============================================================================
const FormReview = ({ program, session, user, onBack, onSave, isSaving }) => {
  const [editableFields, setEditableFields] = useState(() => {
    const map = {};
    session.template.fields.forEach((f) => {
      map[f.id] = session.filledFields[f.id]?.value || '';
    });
    return map;
  });
  const [editingId, setEditingId] = useState(null);
  const stats = getSessionStats(session);

  const handlePrint = () => {
    printApplicationDocument(
      {
        name: session.template.title,
        programTitle: program.title,
        issuer: program.agency,
        template: session.template,
        applicationData: editableFields,
        filledFields: session.filledFields,
      },
      user
    );
  };

  const handleDownloadDoc = () => {
    downloadApplicationAsDoc(
      {
        name: session.template.title,
        programTitle: program.title,
        issuer: program.agency,
        template: session.template,
        applicationData: editableFields,
        filledFields: session.filledFields,
      },
      user
    );
  };

  const sourceColor = {
    profile: 'border-l-blue-400',
    documents: 'border-l-emerald-400',
    conversation: 'border-l-violet-400',
    'auto-skipped': 'border-l-slate-300',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-extrabold text-slate-900">Application Complete</h2>
          </div>
          <p className="text-xs text-slate-500">{session.template.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onSave(editableFields)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-emerald-600" />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDownloadDoc}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Download formatted DOC file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span> .DOC
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#093a96] text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-900/20"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Application
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'From Profile', value: stats.fromProfile, color: 'blue', icon: User },
              { label: 'From Vault', value: stats.fromDocuments, color: 'emerald', icon: FolderOpen },
              { label: 'From Interview', value: stats.fromConversation, color: 'violet', icon: MessageCircle },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`p-3 rounded-2xl bg-${s.color}-50 border border-${s.color}-100 text-center`}>
                  <Icon className={`w-4 h-4 text-${s.color}-500 mx-auto mb-1`} />
                  <div className={`text-xl font-extrabold text-${s.color}-700`}>{s.value}</div>
                  <div className={`text-[10px] font-semibold text-${s.color}-500`}>{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold">
            <span className="text-slate-400 font-medium">Field source:</span>
            {[
              { color: 'bg-blue-400', label: 'Profile' },
              { color: 'bg-emerald-400', label: 'Document Vault' },
              { color: 'bg-violet-400', label: 'Your answer' },
              { color: 'bg-slate-300', label: 'Not applicable' },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-700">Filled Application Fields</h3>
            {session.template.fields.map((field) => {
              const entry = session.filledFields[field.id];
              const src = entry?.source || 'profile';
              const isEditing = editingId === field.id;

              return (
                <div
                  key={field.id}
                  className={`bg-white border border-slate-200 rounded-xl overflow-hidden border-l-4 ${sourceColor[src] || 'border-l-slate-200'}`}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <SourceBadge source={src} />
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setEditingId(field.id)}
                            className="text-[10px] text-[#093a96] font-bold hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editableFields[field.id]}
                          onChange={(e) => setEditableFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
                          className="flex-1 text-sm text-slate-900 border border-[#093a96] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#093a96]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-[#093a96] text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 break-words">
                        {editableFields[field.id] || <span className="text-slate-300 italic font-normal">—</span>}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Guide */}
          <div className="bg-gradient-to-br from-slate-900 to-[#093a96]/90 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">How to Submit This Application</h3>
            </div>
            <ol className="space-y-3">
              {session.template.submissionGuide.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs leading-relaxed text-white/90">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <a
              href={INTAKE_PROGRAMS.find((p) => p.id === session.benefitId)?.officialUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit official portal
            </a>
          </div>

          {/* Anti-fraud notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">Anti-Fraud Advisory:</span> All legitimate government applications are{' '}
              <span className="font-bold">100% free</span>. Never pay processing fees to third-party Facebook pages or
              unofficial fixer desks. Submit only at official agency offices or <code>.gov.ph</code> portals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PRINT STYLESHEET (injected into <head>)
// =============================================================================
const PrintStyle = () => (
  <style>{`
    @media print {
      body * { visibility: hidden !important; }
      #alalay-printable, #alalay-printable * { visibility: visible !important; }
      #alalay-printable {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        padding: 24px !important;
        font-family: Arial, sans-serif !important;
        background: white !important;
      }
    }
  `}</style>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const ApplicationIntakeAgent = ({ preselectedBenefitId = null }) => {
  const { user, documents, addToast, uploadNewDocument, updateDocument, setActiveTab, setActiveDocumentForPreview } = useApp();
  const [phase, setPhase] = useState('select'); // 'select' | 'intake' | 'review'
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [session, setSession] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleProgramSelect = (program) => {
    const newSession = buildIntakeSession(program.id, user, documents);
    setSelectedProgram(program);
    setSession(newSession);
    setPhase('intake');
  };

  const handleIntakeComplete = (completedSession) => {
    setSession(completedSession);
    setPhase('review');
  };

  const handleSave = async (editableFields) => {
    if (!selectedProgram || !session) return;
    setIsSaving(true);
    try {
      const docName = `${selectedProgram.shortTitle || selectedProgram.title} Application Form`;
      const docId = session.documentId || `doc_app_${selectedProgram.id}_${Date.now()}`;

      // Check if this application document already exists in vault
      const existingDoc = documents.find(
        (d) => d.id === session.documentId || (d.programId === selectedProgram.id && d.isApplicationForm)
      );

      const docPayload = {
        id: existingDoc ? existingDoc.id : docId,
        name: docName,
        type: 'Application Form',
        category: selectedProgram.category || 'Government Application',
        issuer: selectedProgram.agency,
        documentNumber: existingDoc?.documentNumber || `APP-${selectedProgram.id.toUpperCase().slice(0, 5)}-${Date.now().toString().slice(-4)}`,
        expirationDate: 'Permanent',
        fileSize: '1.2 MB',
        fileType: 'DOC Form',
        status: 'Valid',
        verifiedBadge: 'AI Intake Completed ✓',
        uploadedAt: existingDoc ? 'Updated via AI Intake Agent' : 'Created via AI Intake Agent',
        isApplicationForm: true,
        programId: selectedProgram.id,
        programTitle: selectedProgram.title,
        programIcon: selectedProgram.icon,
        programAgency: selectedProgram.agency,
        template: session.template,
        applicationData: editableFields,
        attributes: editableFields,
        filledFields: Object.fromEntries(
          (session.template?.fields || []).map((f) => [
            f.id,
            {
              value: editableFields[f.id] || '',
              source: session.filledFields[f.id]?.source || 'conversation',
            },
          ])
        ),
        thumbnail: getDocumentPlaceholderThumbnail('Application Form'),
      };

      docPayload.docContent = generateDocFormattedHtml(docPayload, user);

      if (existingDoc && updateDocument) {
        updateDocument(existingDoc.id, docPayload);
      } else if (uploadNewDocument) {
        uploadNewDocument(docPayload, { silent: true });
      }

      setSession((prev) => ({
        ...prev,
        documentId: docPayload.id,
      }));

      addToast(
        'Application Saved',
        `Saved "${docName}" to your Documents vault. You can view or edit it anytime from the Documents tab.`,
        'success',
        6000
      );
    } catch {
      addToast('Could not save application', 'Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToSelect = () => {
    setPhase('select');
    setSelectedProgram(null);
    setSession(null);
  };

  const handleBackToIntake = () => {
    setPhase('intake');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <PrintStyle />

      {phase === 'select' && (
        <ProgramSelector onSelect={handleProgramSelect} preselectedId={preselectedBenefitId} />
      )}

      {phase === 'intake' && session && selectedProgram && (
        <IntakeConversation
          program={selectedProgram}
          session={session}
          user={user}
          onComplete={handleIntakeComplete}
          onBack={handleBackToSelect}
        />
      )}

      {phase === 'review' && session && selectedProgram && (
        <FormReview
          program={selectedProgram}
          session={session}
          user={user}
          onBack={handleBackToIntake}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default ApplicationIntakeAgent;
