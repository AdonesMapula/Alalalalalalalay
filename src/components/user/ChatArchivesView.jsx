import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Search,
  Calendar,
  ExternalLink,
  Trash2,
  Download,
  ArrowRight,
  ShieldCheck,
  Plus,
  Coins,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
export const ChatArchivesView = () => {
  const {
    chatArchives = [],
    deleteChatArchive,
    openAskAlalay,
    setLoadedChatSession,
    addToast,
    user,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentUserEmail = (user?.email || '').toLowerCase().trim();
  const currentUserId = user?.id || '';

  const categories = [
    { id: 'all', label: 'All Chats' },
    { id: 'finance', label: 'Finance & Loans', icon: Coins },
    { id: 'employment', label: 'Jobs', icon: Briefcase },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'education', label: 'Education & Grants', icon: GraduationCap },
    { id: 'social', label: 'Social Services', icon: Users },
  ];

  // Filter archives strictly by signed-in user, search, and category
  const filteredArchives = (chatArchives || []).filter((arch) => {
    const archEmail = (arch.userEmail || arch.user_email || '').toLowerCase().trim();
    const archUserId = arch.userId || arch.user_id || '';

    // Defense-in-depth: if archive has an email/user ID, it MUST match the signed-in user
    if (currentUserEmail && archEmail && archEmail !== currentUserEmail) {
      return false;
    }
    if (currentUserId && archUserId && archUserId !== currentUserId) {
      return false;
    }

    const titleMatch = (arch.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const previewMatch = (arch.preview || '').toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = !searchQuery.trim() || titleMatch || previewMatch;

    const cat = (arch.category || '').toLowerCase();
    const categoryMatch =
      selectedCategory === 'all' ||
      cat.includes(selectedCategory.toLowerCase());

    return queryMatch && categoryMatch;
  });

  const handleResumeChat = (archive) => {
    if (setLoadedChatSession) {
      setLoadedChatSession(archive);
    }
    openAskAlalay(null, archive);
    addToast('Chat Opened', `Opened saved chat: "${archive.title}".`, 'info');
  };

  const handleExportTranscript = (archive) => {
    const transcriptText = `ALALAY CHAT TRANSCRIPT
Title: ${archive.title}
Date: ${archive.dateFormatted || archive.timestamp}
Category: ${archive.category || 'General'}
Source: ${archive.sourceUrl || 'Official Government Portal'}
------------------------------------------------------------

${(archive.messages || [])
  .map((m) => `[${m.time || 'Time'}] ${m.sender === 'ai' ? 'ALALAY AI' : 'CITIZEN'}:\n${m.text}\n`)
  .join('\n------------------------------------------------------------\n')}
`;

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alalay_consultation_${archive.id || Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Chat Downloaded', 'Your chat transcript is ready.', 'success');
  };

  const handleDelete = (archive) => {
    if (
      window.confirm(
        `Delete saved chat "${archive.title}"?\n\nThis will remove it from your chat history.`
      )
    ) {
      if (deleteChatArchive) {
        deleteChatArchive(archive.id);
      }
    }
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* 1. Page Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
              Saved Chats
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Review or continue past chats about government services. Download a copy anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAskAlalay()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#093a96] hover:bg-[#072d75] text-white text-xs font-bold shadow-md shadow-blue-900/15 cursor-pointer transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved chats (e.g. SSS, scholarship, PhilHealth)..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#093a96] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Saved Chats List */}
      <div className="space-y-4">
        {filteredArchives.length > 0 ? (
          filteredArchives.map((archive) => (
            <div
              key={archive.id}
              className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all shadow-sm space-y-4 group"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: archive.categoryColor || '#093a96' }}
                  >
                    {archive.category || 'Public Service'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{archive.dateFormatted || 'Recently Saved'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                    {archive.messages?.length || archive.messageCount || 2} Messages
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    title="Download Chat"
                    onClick={() => handleExportTranscript(archive)}
                    className="p-2 rounded-xl text-slate-400 hover:text-[#093a96] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Delete Chat"
                    onClick={() => handleDelete(archive)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Consultation Title */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0f172a] group-hover:text-[#093a96] transition-colors leading-snug">
                  {archive.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                  {archive.preview}
                </p>
              </div>

              {/* Card Footer with Source & Continue Action */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-700">Source:</span>
                  <a
                    href={archive.sourceUrl || 'https://www.gov.ph'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#093a96] font-bold hover:underline inline-flex items-center gap-0.5 truncate max-w-[200px]"
                  >
                    <span>{archive.sourceUrl?.replace(/^https?:\/\//, '').split('/')[0] || 'Official Portal'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleResumeChat(archive)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#093a96] text-[#093a96] hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Continue Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#093a96] flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No Saved Chats Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No saved chats matched your search for "${searchQuery}".`
                  : 'Your saved chats will appear here after you talk with ALALAY.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAskAlalay()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#093a96] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-[#072d75] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start a New Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
