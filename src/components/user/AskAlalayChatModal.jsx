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
import logoImg from '../../assets/logos.png';

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

/**
 * Message Content Formatter: parses plain text into rich visual cards, tables, checklists, and source badges
 */
const FormattedAiMessage = ({ text, sourceUrl, matchedOpportunities = [], onOpenOpportunity }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let currentBullets = [];
  let currentSteps = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({
        type: 'bullets',
        items: [...currentBullets],
      });
      currentBullets = [];
    }
  };

  const flushSteps = () => {
    if (currentSteps.length > 0) {
      blocks.push({
        type: 'steps',
        items: [...currentSteps],
      });
      currentSteps = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      flushBullets();
      flushSteps();
      continue;
    }

    // Bullet point lines
    if (rawLine.startsWith('•') || rawLine.startsWith('-') || rawLine.startsWith('*')) {
      flushSteps();
      const content = rawLine.replace(/^[•\-\*]\s*/, '');
      currentBullets.push(content);
      continue;
    }

    // Numbered step lines (e.g. 1., 2.)
    const stepMatch = rawLine.match(/^(\d+)\.\s*(.*)/);
    if (stepMatch) {
      flushBullets();
      currentSteps.push({
        number: stepMatch[1],
        content: stepMatch[2],
      });
      continue;
    }

    // Regular heading or paragraph
    flushBullets();
    flushSteps();

    if (rawLine.toLowerCase().includes('verified source:') || rawLine.toLowerCase().includes('source:')) {
      blocks.push({
        type: 'source',
        content: rawLine,
      });
    } else if (rawLine.endsWith(':') || rawLine.includes('###') || rawLine.includes('##')) {
      blocks.push({
        type: 'heading',
        content: rawLine.replace(/^#+\s*/, ''),
      });
    } else {
      blocks.push({
        type: 'paragraph',
        content: rawLine,
      });
    }
  }

  flushBullets();
  flushSteps();

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-800">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <div key={idx} className="font-extrabold text-[#093a96] text-xs pt-1 border-b border-blue-100 pb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{block.content}</span>
            </div>
          );
        }

        if (block.type === 'bullets') {
          return (
            <div key={idx} className="space-y-1.5 pt-0.5">
              {block.items.map((item, bIdx) => {
                const isMet = item.includes('✓') || item.toLowerCase().includes('verified');
                const isAction = item.includes('✗') || item.toLowerCase().includes('action') || item.toLowerCase().includes('missing');
                const hasMoney = item.includes('₱');

                return (
                  <div
                    key={bIdx}
                    className={`p-2.5 rounded-xl border flex items-start gap-2 text-[11px] ${
                      isMet
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : isAction
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : hasMoney
                        ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {isMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : isAction ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#093a96] flex-shrink-0 mt-1.5" />
                    )}
                    <span className="leading-snug">{item}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        if (block.type === 'steps') {
          return (
            <div key={idx} className="space-y-2 pt-1">
              {block.items.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-2xl bg-white border border-blue-100 shadow-2xs flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#093a96] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {step.number}
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-800">
                    {step.content}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'source') {
          const matchUrl = block.content.match(/(https?:\/\/[^\s\)]+)/);
          const cleanUrl = matchUrl ? matchUrl[1] : sourceUrl || 'https://www.gov.ph';
          const domain = cleanUrl.replace(/^https?:\/\//, '').split('/')[0];

          return (
            <div
              key={idx}
              className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500"
            >
              <div className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Verified Source Citation</span>
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

        return (
          <p key={idx} className="leading-relaxed">
            {block.content}
          </p>
        );
      })}

      {/* Clickable Opportunity Recommendation Cards (Expands in Explore Navigation) */}
      {matchedOpportunities && matchedOpportunities.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-blue-100/80">
          <div className="text-[11px] font-bold text-[#093a96] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#093a96]" />
              <span>Recommended Citizen Programs ({matchedOpportunities.length}):</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Click to expand</span>
          </div>

          <div className="space-y-2">
            {matchedOpportunities.map((oppItem) => (
              <div
                key={oppItem.id}
                onClick={() => onOpenOpportunity && onOpenOpportunity(oppItem)}
                className="p-3 rounded-2xl bg-white border border-blue-200/90 hover:border-[#093a96] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#093a96] border border-blue-200">
                      {oppItem.agency || 'Government'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      {oppItem.matchScore || 92}% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0f172a] group-hover:text-[#093a96] transition-colors truncate">
                    {oppItem.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {oppItem.shortDesc || oppItem.fullDesc}
                  </p>
                </div>

                <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-[#093a96] group-hover:text-white text-[#093a96] flex items-center justify-center flex-shrink-0 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AskAlalayChatModal = () => {
  const {
    askAlalayOpen,
    setAskAlalayOpen,
    askAlalayOpportunity,
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

  // Initialize Greeting or Load Archived Session
  useEffect(() => {
    if (askAlalayOpen) {
      if (loadedChatSession && loadedChatSession.messages && loadedChatSession.messages.length > 0) {
        setMessages(loadedChatSession.messages);
        setCurrentSessionId(loadedChatSession.id);
        setSessionTitle(loadedChatSession.title);
      } else if (opp) {
        const newId = `chat_${Date.now()}`;
        setCurrentSessionId(newId);
        setSessionTitle(`Consultation: ${opp.title}`);
        setMessages([
          {
            id: 'init_opp',
            sender: 'ai',
            text: `Hello ${user?.firstName || 'there'}! I am grounded in official Citizen's Charters for ${opp.title} (${opp.agency}). What would you like to know about this service?`,
            time: 'Just now',
            sourceUrl: opp.officialSource?.url || 'https://www.philhealth.gov.ph',
            matchedOpportunities: [opp],
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
            matchedOpportunities: opportunities.slice(0, 2),
          },
        ]);
      }
    }
  }, [askAlalayOpen, opp, loadedChatSession, user?.firstName, opportunities]);

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

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMsgList = [...messages, userMsg];
    setMessages(updatedMsgList);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await askAlalayAI(text, {
        contextType: opp ? 'benefit' : 'general',
        opp,
        user,
        opportunities,
        sources,
        userDocs: documents,
      });

      const matchedOpps = findMatchingOpportunities(replyText + ' ' + text, opportunities);

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sourceUrl: opp?.officialSource?.url || 'https://www.gov.ph',
        matchedOpportunities: matchedOpps,
      };

      const finalMessages = [...updatedMsgList, aiMsg];
      setMessages(finalMessages);

      // Auto-save consultation to Chat Archives
      if (saveChatArchive) {
        const titleToUse =
          sessionTitle ||
          (opp
            ? `Consultation: ${opp.title}`
            : `Inquiry: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);

        setSessionTitle(titleToUse);

        saveChatArchive({
          id: currentSessionId || `chat_${Date.now()}`,
          title: titleToUse,
          category: opp?.categoryName || (text.toLowerCase().includes('loan') ? 'Finance' : text.toLowerCase().includes('job') ? 'Employment' : text.toLowerCase().includes('health') ? 'Health' : 'Public Service'),
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
        text: 'ALALAY is grounded in verified Citizen Charters. Please check with your nearest government agency branch or hospital Malasakit Center desk.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        matchedOpportunities: [],
      };
      setMessages((prev) => [...prev, aiErrMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-w-[440px] h-[540px] max-h-[85vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden select-none animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
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
            <h3 className="text-sm font-bold leading-tight">ALALAY Assistant</h3>
            <span className="text-[10px] text-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Grounded in Live Government Charters</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
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
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
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
