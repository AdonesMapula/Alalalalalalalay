import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  FileText,
  Clock,
  HeartPulse,
  Coins,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askAlalayAI } from '../../services/geminiService';
import { calculateCitizenAge } from '../../services/rulesEngine';
import logoImg from '../../assets/AIlogos.png';

import { AiMessageRenderer } from '../common/AiMessageRenderer';

/**
 * Rich Step-by-Step and Multi-Paragraph Formatter for Dedicated Page View
 */
const FullPageMessageRenderer = ({ text, sourceUrl, matchedOpportunities = [], onUploadDocument }) => {
  return (
    <AiMessageRenderer
      text={text}
      sourceUrl={sourceUrl}
      matchedOpportunities={matchedOpportunities}
      onUploadDocument={onUploadDocument}
      size="md"
    />
  );
};

export const AskAlalayPageView = () => {
  const {
    user,
    documents,
    opportunities,
    sources,
    chatArchives = [],
    saveChatArchive,
    loadedChatSession,
    setLoadedChatSession,
    addToast,
    openUploadForRequirement,
  } = useApp();

  const userAge = calculateCitizenAge(user);
  const isSenior = Boolean(user?.isSeniorCitizen || user?.is_senior_citizen || userAge >= 60);

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize from loadedChatSession or start fresh session
  useEffect(() => {
    if (loadedChatSession && loadedChatSession.messages && loadedChatSession.messages.length > 0) {
      setMessages(loadedChatSession.messages);
      setCurrentSessionId(loadedChatSession.id);
    } else {
      const newId = `session_page_${Date.now()}`;
      setCurrentSessionId(newId);
      setMessages([
        {
          id: 'msg_page_init',
          sender: 'ai',
          text: `Hello ${user?.firstName || 'Citizen'}! I am ALALAY, your official Philippine Citizen Assistance AI.

${
  isSenior
    ? `🌟 **Senior Citizen Mode Active (Age ${userAge})**: I can assist you with OSCA Social Pensions, PhilHealth RA 10645 Free Hospitalization, 20% statutory discounts, and maintenance medicines.`
    : `I can help you navigate step-by-step procedures for hospital subsidies (PhilHealth/Malasakit), SSS & Pag-IBIG loans, tertiary scholarships, and social welfare programs.`
}

Ask me anything below or select a recommended topic from the sidebar.`,
          time: 'Just now',
          sourceUrl: 'https://www.gov.ph',
        },
      ]);
    }
  }, [loadedChatSession, user?.firstName, isSenior, userAge]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Topic Shortcuts
  const topicPresets = [
    {
      id: 'medical',
      label: '🏥 Hospital Subsidies & PhilHealth',
      prompt: 'How can I get assistance for hospital bills through PhilHealth and Malasakit Center?',
      icon: HeartPulse,
    },
    {
      id: 'sss_loan',
      label: '💼 SSS Calamity & Salary Loans',
      prompt: 'What are the interest rates, terms, and requirements for SSS loans?',
      icon: Coins,
    },
    {
      id: 'senior_care',
      label: '👴 Senior Citizen Free Healthcare',
      prompt: 'What are the complete free healthcare and pension benefits for senior citizens under RA 9994 and RA 10645?',
      icon: Award,
    },
    {
      id: 'scholarship',
      label: '🎓 UniFAST & Tertiary Subsidies',
      prompt: 'What are the steps to apply for CHED Tulong Dunong and UniFAST tertiary education subsidies?',
      icon: GraduationCap,
    },
    {
      id: 'dswd_aics',
      label: '🤝 DSWD Crisis Cash Assistance',
      prompt: 'How to apply for DSWD AICS emergency medical and cash assistance?',
      icon: Users,
    },
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputQuery.trim();
    if (!text) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedList = [...messages, userMsg];
    setMessages(updatedList);
    setInputQuery('');
    setIsTyping(true);

    try {
      const replyText = await askAlalayAI(text, {
        contextType: 'citizen_inquiry',
        user,
        opportunities,
        sources,
        userDocs: documents,
        conversationHistory: messages,
      });

      // Filter matched opportunities
      const matched = opportunities
        .filter((o) => {
          const t = `${o.title} ${o.agency} ${o.category}`.toLowerCase();
          const q = text.toLowerCase();
          return (
            (q.includes('hospital') && t.includes('health')) ||
            (q.includes('loan') && t.includes('loan')) ||
            (q.includes('senior') && t.includes('senior')) ||
            (q.includes('student') && t.includes('education'))
          );
        })
        .slice(0, 2);

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sourceUrl: 'https://www.gov.ph',
      };

      const finalMessages = [...updatedList, aiMsg];
      setMessages(finalMessages);

      // Auto-save consultation to Chat Archives
      if (saveChatArchive) {
        saveChatArchive({
          id: currentSessionId || `session_page_${Date.now()}`,
          title: `Inquiry: ${text.slice(0, 45)}...`,
          category: 'Citizen Consultation',
          categoryColor: '#093a96',
          timestamp: new Date().toISOString(),
          dateFormatted:
            new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }) +
            ' • ' +
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          preview: replyText.replace(/[#*•]/g, '').slice(0, 140) + '...',
          messageCount: finalMessages.length,
          sourceUrl: 'https://www.gov.ph',
          messages: finalMessages,
        });
      }
    } catch (err) {
      const errMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: 'ALALAY is currently checking official guidelines. Please check with your nearest Malasakit Center desk or government agency portal.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResponseFeedback = (messageId, value) => {
    const updatedMessages = messages.map((message) => {
      if (message.id !== messageId) return message;
      return { ...message, feedback: message.feedback === value ? null : value };
    });

    setMessages(updatedMessages);

    // Keep feedback in the saved chat when this conversation already exists.
    if (
      saveChatArchive &&
      currentSessionId &&
      updatedMessages.some((message) => message.sender === 'user')
    ) {
      const latestAiMessage = [...updatedMessages].reverse().find((message) => message.sender === 'ai');
      saveChatArchive({
        id: currentSessionId,
        title: loadedChatSession?.title || `Inquiry: ${latestAiMessage?.text?.slice(0, 45) || 'Consultation'}...`,
        preview: latestAiMessage?.text?.replace(/[#*•]/g, '').slice(0, 140) || '',
        messageCount: updatedMessages.length,
        sourceUrl: latestAiMessage?.sourceUrl || 'https://www.gov.ph',
        messages: updatedMessages,
      });
    }
  };

  const handleStartNewChat = () => {
    const newId = `session_page_${Date.now()}`;
    setCurrentSessionId(newId);
    if (setLoadedChatSession) setLoadedChatSession(null);
    setMessages([
      {
        id: `msg_page_new_${Date.now()}`,
        sender: 'ai',
        text: `New consultation started. How can I assist you with government services today, ${user?.firstName || 'Citizen'}?`,
        time: 'Just now',
        sourceUrl: 'https://www.gov.ph',
      },
    ]);
    addToast('New Consultation', 'Started a fresh AI conversation session.', 'info');
  };

  const handleExportTranscript = () => {
    const transcriptText = `ALALAY CITIZEN AI CONSULTATION TRANSCRIPT
Citizen: ${user?.firstName || ''} ${user?.lastName || ''} (${user?.email || ''})
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
------------------------------------------------------------

${messages
  .map((m) => `[${m.time || 'Time'}] ${m.sender === 'ai' ? 'ALALAY AI' : 'CITIZEN'}:\n${m.text}\n`)
  .join('\n------------------------------------------------------------\n')}
`;

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alalay_consultation_${currentSessionId || Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Transcript Exported', 'Downloaded complete consultation transcript.', 'success');
  };

  return (
    <div className="h-full flex flex-col select-none max-w-7xl w-full mx-auto space-y-2.5 min-h-0 overflow-hidden">
      {/* Top Compact Header Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shadow-sm flex-shrink-0">
            <img src={logoImg} alt="ALALAY" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                ALALAY Citizen Consultation Workspace
              </h1>
              {isSenior && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold flex-shrink-0">
                  Senior Citizen Mode ({userAge} yrs)
                </span>
              )}
            </div>
            <p className="text-[11px] text-blue-200 truncate font-medium">
              Based on official Philippine government guidelines, Malasakit Center rules, and statutory circulars.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleStartNewChat}
            className="px-3 py-1.5 rounded-xl bg-white text-[#093a96] hover:bg-blue-50 text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={handleExportTranscript}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            title="Download Transcript"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace (Card Height Fixed, Only Middle Conversation Scrolls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 items-stretch overflow-hidden">
        {/* LEFT COLUMN: TOPIC SHORTCUTS & RECENT CONSULTATIONS (col-span-4) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col space-y-2.5 h-full min-h-0 overflow-y-auto pr-1">
          {/* Quick Consultation Topics */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#093a96]" />
              <span>Recommended Topics</span>
            </h3>

            <div className="space-y-1.5">
              {topicPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSendMessage(preset.prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#f8fafd] hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white text-[#093a96] flex items-center justify-center shadow-2xs group-hover:bg-[#093a96] group-hover:text-white transition-colors">
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#093a96] truncate">
                        {preset.label}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consultation History Sidebar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#093a96]" />
                <span>Recent Consultations ({chatArchives.length})</span>
              </h3>
            </div>

            {chatArchives.length > 0 ? (
              <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                {chatArchives.slice(0, 8).map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => {
                      if (setLoadedChatSession) setLoadedChatSession(arch);
                      setMessages(arch.messages || []);
                      setCurrentSessionId(arch.id);
                      addToast('Loaded Consultation', `Loaded: "${arch.title}"`, 'info');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer space-y-0.5 ${
                      currentSessionId === arch.id
                        ? 'bg-blue-50/80 border-[#093a96] text-[#093a96]'
                        : 'bg-[#f8fafd] border-slate-200/80 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{arch.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{arch.dateFormatted || arch.timestamp}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                No past consultations yet.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: FIXED CARD HEIGHT WITH FIXED HEADER & FIXED INPUT (ONLY CONVERSATION SCROLLS) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-full min-h-0 overflow-hidden">
          {/* 1. Fixed Card Header (Always in view) */}
          <div className="p-3.5 sm:px-5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-blue-200 p-0.5 flex items-center justify-center flex-shrink-0 shadow-xs">
                <img src={logoImg} alt="ALALAY AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm">
                  {loadedChatSession?.title || 'Interactive Citizen Q&A Stream'}
                </h3>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Based on Verified Government Guidelines</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#093a96]">
              {messages.length} Messages
            </span>
          </div>

          {/* 2. Scrollable Middle Conversation Area (ONLY THIS SECTION SCROLLS) */}
          <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#f8fafd]">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-white border border-blue-200 p-0.5 flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
                      <img src={logoImg} alt="ALALAY AI" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[82%] p-4 rounded-2xl ${
                      isAi
                        ? 'bg-white border border-slate-200/90 text-slate-800 shadow-sm'
                        : 'bg-[#093a96] text-white shadow-md font-medium'
                    }`}
                  >
                    {isAi ? (
                      <>
                        <FullPageMessageRenderer
                          text={msg.text}
                          sourceUrl={msg.sourceUrl}
                          matchedOpportunities={msg.matchedOpportunities}
                          onUploadDocument={openUploadForRequirement}
                        />
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {msg.feedback ? 'Thanks for the feedback.' : 'Was this helpful?'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleResponseFeedback(msg.id, 'good')}
                              aria-label="Good response"
                              aria-pressed={msg.feedback === 'good'}
                              title="Good response"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                msg.feedback === 'good'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResponseFeedback(msg.id, 'bad')}
                              aria-label="Not a helpful response"
                              aria-pressed={msg.feedback === 'bad'}
                              title="Not a helpful response"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                msg.feedback === 'bad'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                    )}

                    <span
                      className={`text-[10px] mt-1.5 block text-right font-medium ${
                        isAi ? 'text-slate-400' : 'text-blue-200'
                      }`}
                    >
                      {msg.time || 'Just now'}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-white border border-blue-200 p-0.5 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <img src={logoImg} alt="ALALAY AI" className="w-full h-full object-contain animate-bounce" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-xs flex items-center gap-2 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 ml-1">
                    Checking application steps & official guidelines...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Fixed Card Bottom Input Footer (Always in view, enclosed neatly inside card) */}
          <div className="p-3 sm:p-3.5 bg-white border-t border-slate-200/90 flex-shrink-0 z-10 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-3.5 flex items-center gap-2 transition-all focus-within:bg-white focus-within:border-[#093a96] focus-within:ring-2 focus-within:ring-blue-100"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100/80 text-[#093a96] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about hospital subsidies, SSS loans, tuition grants, or procedural steps..."
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 outline-none font-medium placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-2 rounded-xl bg-[#093a96] hover:bg-[#072d75] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 flex-shrink-0 shadow-md shadow-blue-900/15"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
