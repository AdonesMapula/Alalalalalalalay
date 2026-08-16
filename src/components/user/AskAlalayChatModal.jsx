import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Bot,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  FileText,
  Building2,
  DollarSign,
  Coins,
  ChevronRight,
  ArrowUpRight,
  Compass,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askAlalayAI } from '../../services/geminiService';
import logoImg from '../../assets/AIlogos.png';

/**
 * Intelligent Opportunity Matcher from AI Text & Database
 * Directly links recommended programs in AI messages to their full Opportunity Detail Card
 */
function findMatchingOpportunities(aiText = '', allOpportunities = []) {
  if (!aiText) return [];

  const textLower = aiText.toLowerCase();
  const matched = [];
  const matchedIds = new Set();

  const oppList = Array.isArray(allOpportunities) ? allOpportunities : [];

  // Helper to add if not already added
  const tryAdd = (item) => {
    if (item && !matchedIds.has(item.id)) {
      matchedIds.add(item.id);
      matched.push(item);
    }
  };

  // 1. Prioritized Direct Matching by specific program keywords mentioned in AI text
  if (textLower.includes('sss') || textLower.includes('salary loan')) {
    const sssOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('sss') || (o.agency || '').toLowerCase().includes('sss'));
    if (sssOpp) tryAdd(sssOpp);
    else {
      tryAdd({
        id: 'opp_sss_salary_loan_dyn',
        title: 'SSS Salary & Calamity Loan Assistance',
        agency: 'Social Security System (SSS)',
        category: 'finance',
        categoryName: 'Finance & Loans',
        categoryColor: '#093a96',
        shortDesc: 'Low-interest short-term cash loan up to 2 months average salary with 10% annual interest rate and 24-month repayment terms.',
        fullDesc: 'The SSS Member Loan Program allows active contributing members (employed, self-employed, voluntary, and OFW) to borrow cash to meet short-term financial needs. Qualified members can borrow up to one or two months of their average monthly salary credit.',
        matchScore: 95,
        matchStatus: 'Likely Eligible',
        confidence: '99% Confident',
        deadline: 'Open Year-Round Online',
        isApproved: true,
        benefits: [
          'Cash loan proceeds up to 2 months average salary credit',
          'Low 10% annual interest rate computed on diminishing balance',
          'Flexible 24-month installment schedule via payroll or online auto-debit',
          'Instant electronic disbursement via My.SSS and UMID-ATM / Bank Card',
        ],
        whyYouQualify: [
          { text: 'Active SSS member with at least 36 posted monthly contributions', status: 'met' },
          { text: 'PhilSys National ID or UMID verified', status: 'met' },
        ],
        requirements: [
          { name: 'Valid Government Issued Photo ID (UMID / PhilSys ID)', status: 'met', sourceRef: 'SSS Loan Policy Circular' },
          { name: 'Active My.SSS Online Portal Account', status: 'met', sourceRef: 'My.SSS Member Portal' },
        ],
        missingItems: [],
        officialSource: {
          agency: 'Social Security System (SSS)',
          url: 'https://www.sss.gov.ph',
          pageTitle: 'SSS Member Loans Guidelines and Application',
        },
      });
    }
  }

  if (textLower.includes('pag-ibig') || textLower.includes('multi-purpose') || textLower.includes('mpl')) {
    const mplOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('multi-purpose') || (o.title || '').toLowerCase().includes('mpl') || (o.agency || '').toLowerCase().includes('pag-ibig'));
    if (mplOpp) tryAdd(mplOpp);
  }

  if (textLower.includes('dswd') || textLower.includes('aics') || textLower.includes('emergency cash')) {
    const dswdOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('aics') || (o.title || '').toLowerCase().includes('dswd') || (o.agency || '').toLowerCase().includes('dswd'));
    if (dswdOpp) tryAdd(dswdOpp);
  }

  if (textLower.includes('unifast') || textLower.includes('tertiary education subsidy') || textLower.includes('tes') || textLower.includes('tulong dunong')) {
    const unifastOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('tertiary') || (o.title || '').toLowerCase().includes('tulong dunong') || (o.agency || '').toLowerCase().includes('ched'));
    if (unifastOpp) tryAdd(unifastOpp);
  }

  if (textLower.includes('philhealth') || textLower.includes('senior citizen')) {
    const seniorOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('senior') || (o.agency || '').toLowerCase().includes('philhealth'));
    if (seniorOpp) tryAdd(seniorOpp);
  }

  if (textLower.includes('tupad') || textLower.includes('dole') || textLower.includes('spes')) {
    const doleOpp = oppList.find((o) => (o.title || '').toLowerCase().includes('tupad') || (o.title || '').toLowerCase().includes('spes') || (o.agency || '').toLowerCase().includes('dole'));
    if (doleOpp) tryAdd(doleOpp);
  }

  // 2. Fallback to general substring matches for any custom scraped opportunities from admin
  oppList.forEach((opp) => {
    const titleLower = (opp.title || '').toLowerCase();
    if (textLower.includes(titleLower) && !matchedIds.has(opp.id)) {
      tryAdd(opp);
    }
  });

  return matched.slice(0, 4);
}

import { AiMessageRenderer } from '../common/AiMessageRenderer';

/**
 * Message Content Formatter: uses AiMessageRenderer for rich step cards and visual components
 */
const FormattedAiMessage = ({ text, sourceUrl, matchedOpportunities = [], onOpenOpportunity }) => {
  return (
    <AiMessageRenderer
      text={text}
      sourceUrl={sourceUrl}
      matchedOpportunities={matchedOpportunities}
      onOpenOpportunity={onOpenOpportunity}
      size="sm"
    />
  );
};

export const AskAlalayChatModal = () => {
  const {
    askAlalayOpen,
    setAskAlalayOpen,
    askAlalayOpportunity,
    askAlalayInitialPrompt,
    setAskAlalayInitialPrompt,
    setSelectedOpportunity,
    setActiveTab,
    user,
    opportunities,
    sources,
    documents,
    loadedChatSession,
    setLoadedChatSession,
    saveChatArchive,
    addToast,
  } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const messagesEndRef = useRef(null);

  const opp = askAlalayOpportunity;

  // Execute an automated or user-sent message
  const executeQuery = async (queryText, baseMessages = []) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMsgList = [...baseMessages, userMsg];
    setMessages(updatedMsgList);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await askAlalayAI(queryText, {
        contextType: opp ? 'benefit' : 'general',
        opp,
        user,
        opportunities,
        sources,
        userDocs: documents,
      });

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sourceUrl: opp?.officialSource?.url || 'https://www.gov.ph',
      };

      const finalMessages = [...updatedMsgList, aiMsg];
      setMessages(finalMessages);

      // Auto-save consultation to Chat Archives
      if (saveChatArchive) {
        const titleToUse =
          sessionTitle ||
          (opp
            ? `Consultation: ${opp.title}`
            : `Inquiry: ${queryText.slice(0, 50)}${queryText.length > 50 ? '...' : ''}`);

        setSessionTitle(titleToUse);

        saveChatArchive({
          id: currentSessionId || `chat_${Date.now()}`,
          title: titleToUse,
          category: opp?.categoryName || (queryText.toLowerCase().includes('loan') ? 'Finance' : queryText.toLowerCase().includes('job') ? 'Employment' : queryText.toLowerCase().includes('health') ? 'Health' : 'Public Service'),
          categoryColor: opp?.categoryColor || '#093a96',
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
          sourceUrl: opp?.officialSource?.url || 'https://www.gov.ph',
          messages: finalMessages,
        });
      }
    } catch (err) {
      const aiErrMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `I encountered an issue fetching official guidelines for this service: ${err.message || 'Please try again.'}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMsgList, aiErrMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Initialize Greeting, Load Archived Session, or Trigger Auto Query
  useEffect(() => {
    if (askAlalayOpen) {
      if (loadedChatSession && loadedChatSession.messages && loadedChatSession.messages.length > 0) {
        setMessages(loadedChatSession.messages);
        setCurrentSessionId(loadedChatSession.id);
        setSessionTitle(loadedChatSession.title);
      } else if (askAlalayInitialPrompt) {
        const newId = `chat_${Date.now()}`;
        setCurrentSessionId(newId);
        setSessionTitle(opp ? `Consultation: ${opp.title}` : `Inquiry: ${askAlalayInitialPrompt.slice(0, 40)}`);
        const promptToRun = askAlalayInitialPrompt;
        setAskAlalayInitialPrompt('');
        executeQuery(promptToRun, []);
      } else if (opp) {
        const newId = `chat_${Date.now()}`;
        setCurrentSessionId(newId);
        setSessionTitle(`Consultation: ${opp.title}`);
        setMessages([
          {
            id: 'init_opp',
            sender: 'ai',
            text: `Hello ${user?.firstName || 'there'}! I am grounded in official Citizen's Charters for **${opp.title}** (${opp.agency}). What would you like to know about this service?`,
            time: 'Just now',
            sourceUrl: opp.officialSource?.url || 'https://www.philhealth.gov.ph',
          },
        ]);
      } else {
        const newId = `chat_${Date.now()}`;
        setCurrentSessionId(newId);
        setSessionTitle('');
        setMessages([
          {
            id: 'init_gen',
            sender: 'ai',
            text: `Hi ${user?.firstName || 'there'}! I am ALALAY, your AI navigator grounded in verified Philippine government Citizen's Charters, scraped assistance programs, and statutory benefits. How can I assist you today?`,
            time: 'Just now',
          },
        ]);
      }
    }
  }, [askAlalayOpen, opp, loadedChatSession, askAlalayInitialPrompt, user?.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!askAlalayOpen) return null;

  // Handler to open and expand the opportunity in Explore Navigation
  const handleOpenOpportunity = (oppItem) => {
    setSelectedOpportunity(oppItem);
    setActiveTab('explore');
    setAskAlalayOpen(false);
  };

  // Dynamic Suggestion Chips based on real Philippine assistance topics
  const quickPills = opp
    ? [
      'What documents do I need for this?',
      'Am I eligible for this program?',
      'Where do I apply and submit?',
    ]
    : [
      'Can I borrow money or apply for loans?',
      'What benefits do Senior Citizens receive?',
      'How do I claim DOH & Malasakit medical aid?',
      'Are there student loans and tuition subsidies?',
    ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;
    await executeQuery(text, messages);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[480px] md:w-[520px] max-w-[540px] h-[600px] max-h-[88vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden select-none animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
      {/* Top Header */}
      <div className="bg-[#093a96] text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img
              src={logoImg}
              alt="ALALAY Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              <span>ALALAY AI Citizen Guide</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-blue-100 font-medium truncate max-w-[200px] sm:max-w-[260px]">
              {opp ? opp.title : 'Official Citizen Charters & Benefits'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (setLoadedChatSession) {
                setLoadedChatSession({
                  id: currentSessionId || `session_page_${Date.now()}`,
                  title: sessionTitle || (opp ? `Consultation: ${opp.title}` : 'Citizen AI Consultation'),
                  messages: messages,
                });
              }
              setAskAlalayOpen(false);
              setActiveTab('ai-chat');
              addToast('Expanded to Full Page', 'Consultation opened in dedicated workspace.', 'info');
            }}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 cursor-pointer transition-colors"
            title="Open in Dedicated Full-Page Workspace"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAskAlalayOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 cursor-pointer transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Conversation Body (Scrolls smoothly) */}
      <div className="p-4 flex-1 min-h-0 overflow-y-auto space-y-3 bg-[#f8fafd] text-xs">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-white border border-blue-200 p-0.5 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <img
                    src={logoImg}
                    alt="ALALAY"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div
                className={`max-w-[94%] sm:max-w-[92%] p-3.5 rounded-2xl leading-relaxed ${isAi
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs w-full'
                    : 'bg-[#093a96] text-white font-medium rounded-br-none whitespace-pre-line'
                  }`}
              >
                {isAi ? (
                  <FormattedAiMessage
                    text={msg.text}
                    sourceUrl={msg.sourceUrl}
                    matchedOpportunities={msg.matchedOpportunities}
                    onOpenOpportunity={handleOpenOpportunity}
                  />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 items-center text-slate-500 text-xs pl-8">
            <div className="w-4 h-4 rounded-full bg-white p-0.5 flex items-center justify-center shadow-2xs animate-bounce">
              <img src={logoImg} alt="ALALAY" className="w-full h-full object-contain" />
            </div>
            <span>ALALAY is analyzing scraped programs & charters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions Pills (Clean horizontal bar) */}
      <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(pill)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-[#093a96] hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 sm:p-3 bg-white border-t border-slate-200/90 flex items-center gap-2 flex-shrink-0 shadow-sm"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about government assistance, loans..."
          className="flex-1 bg-slate-50 text-slate-800 text-xs rounded-full px-4 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white transition-all font-medium"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="w-9 h-9 rounded-full bg-[#093a96] disabled:bg-slate-300 text-white flex items-center justify-center cursor-pointer transition-all hover:bg-[#072d75] flex-shrink-0 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
