import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Bot,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AskAlalayChatModal = () => {
  const {
    askAlalayOpen,
    setAskAlalayOpen,
    askAlalayOpportunity,
    user,
  } = useApp();

  const opp = askAlalayOpportunity;
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (askAlalayOpen) {
      setMessages([
        {
          id: 'msg_1',
          sender: 'ai',
          text: `Hi ${user.firstName}, I can help you with your ${
            opp ? opp.title : 'government benefits'
          }. What would you like to know?`,
          time: 'Just now',
          sourceUrl: opp?.officialSource?.url,
        },
      ]);
    }
  }, [askAlalayOpen, opp, user.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!askAlalayOpen) return null;

  const quickPills = [
    'Am I eligible?',
    'What documents do I need?',
    'Where to apply?',
  ];

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase();

      if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('am i')) {
        replyText = `Based on your profile, you meet the **Age Requirement (62 years old)** and **Residency** for PhilHealth Senior Benefits. You qualify for 100% covered inpatient care and free Konsulta outpatient primary checkups.`;
      } else if (lower.includes('document') || lower.includes('need') || lower.includes('require')) {
        replyText = `You will need:\n1. Filled out PhilHealth Member Registration Form (PMRF)\n2. Valid OSCA Senior Citizen ID or Government Photo ID\n3. 1x1 ID Picture`;
      } else if (lower.includes('where') || lower.includes('apply')) {
        replyText = `You can apply at any PhilHealth Local Health Insurance Office (LHIO) or directly through the OSCA (Office of Senior Citizen Affairs) in your City Hall.`;
      } else {
        replyText = `According to the official circular verified from philhealth.gov.ph, all senior citizens aged 60+ are entitled to mandatory PhilHealth coverage under Republic Act 10645.`;
      }

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: 'Just now',
        sourceUrl: 'https://www.philhealth.gov.ph',
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden select-none animate-in slide-in-from-bottom-5 duration-200">
      {/* Top Header matching Image 5 */}
      <div className="bg-[#093a96] text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">ALALAY Assistant</h3>
            <span className="text-[10px] text-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Online</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAskAlalayOpen(false)}
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Conversation Body */}
      <div className="p-4 h-80 overflow-y-auto space-y-3 bg-[#f8fafd] text-xs">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-[#093a96] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    : 'bg-[#093a96] text-white font-medium rounded-br-none'
                }`}
              >
                <p>{msg.text}</p>
                {msg.sourceUrl && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-[#093a96] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Source: philhealth.gov.ph</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 items-center text-slate-400 pl-9">
            <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#093a96] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pills matching Image 5 */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(pill)}
            className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-[#093a96] border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Field matching Image 5 */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask a question..."
          className="flex-1 bg-[#f4f5f8] border border-transparent focus:border-[#093a96] focus:bg-white rounded-xl px-3.5 py-2 text-xs outline-none text-slate-800"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim()}
          className="p-2 rounded-xl bg-[#093a96] text-white disabled:opacity-40 hover:bg-[#072d75] transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
