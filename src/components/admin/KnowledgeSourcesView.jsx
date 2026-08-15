import React, { useState } from 'react';
import {
  Building2,
  RefreshCw,
  AlertTriangle,
  Plus,
  ExternalLink,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddSourceModal } from './AddSourceModal';

export const KnowledgeSourcesView = () => {
  const {
    sources,
    setAddSourceModalOpen,
    runLiveScraper,
    scrapeSingleSource,
    removeKnowledgeSource,
    addKnowledgeSource,
    isScrapingLive,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState('All Sources');
  const [filterText, setFilterText] = useState('');
  const [scrapingId, setScrapingId] = useState(null);

  // Quick inline URL input state
  const [quickUrl, setQuickUrl] = useState('');
  const [quickCategory, setQuickCategory] = useState('Health');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Dynamic sources list from Supabase/State
  const dynamicList = sources.map((s) => {
    const rawUrl = s.official_url || s.officialUrl || '';
    const cleanUrl = rawUrl.replace(/^https?:\/\//, '');
    const categoryName = s.category || 'General';

    let categoryBadge = 'bg-indigo-50 text-indigo-700';
    if (categoryName.toLowerCase().includes('finance')) {
      categoryBadge = 'bg-amber-50 text-amber-800';
    } else if (categoryName.toLowerCase().includes('social')) {
      categoryBadge = 'bg-purple-50 text-purple-700';
    } else if (categoryName.toLowerCase().includes('education')) {
      categoryBadge = 'bg-emerald-50 text-emerald-700';
    } else if (categoryName.toLowerCase().includes('health')) {
      categoryBadge = 'bg-rose-50 text-rose-700';
    }

    const lastScrapedStr = s.last_scraped_at
      ? typeof s.last_scraped_at === 'string' && s.last_scraped_at.includes('T')
        ? new Date(s.last_scraped_at).toISOString().replace('T', ' ').slice(0, 16)
        : s.last_scraped_at
      : s.lastScrapedAt || s.lastScraped || 'Just now';

    const statusStr = s.status || 'Active';
    const isError = statusStr.toLowerCase().includes('error');
    const isInactive = statusStr.toLowerCase().includes('inactive');

    return {
      id: s.id,
      name: s.agency_name || s.agencyName || s.name || cleanUrl || 'Knowledge Source',
      url: cleanUrl || rawUrl,
      rawUrl: rawUrl.startsWith('http') ? rawUrl : `https://${cleanUrl}`,
      category: categoryName,
      categoryBadge,
      lastScraped: lastScrapedStr,
      status: statusStr,
      statusType: isError ? 'error' : isInactive ? 'inactive' : 'active',
      iconType: isError ? 'alert' : 'building',
      documentsCount: s.documents_indexed || s.documentsIndexed || 1,
    };
  });

  const filteredList = dynamicList.filter((agency) => {
    const matchesCategory =
      selectedFilter === 'All Sources' ||
      agency.category.toLowerCase() === selectedFilter.toLowerCase();

    const matchesSearch =
      !filterText ||
      agency.name.toLowerCase().includes(filterText.toLowerCase()) ||
      agency.url.toLowerCase().includes(filterText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Calculate live statistics
  const totalAgencies = sources.length;
  const scrapeErrors = dynamicList.filter((s) => s.statusType === 'error').length;
  const lastSyncText =
    dynamicList.length > 0 ? dynamicList[0].lastScraped : 'Never synced';

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    setIsQuickAdding(true);
    try {
      await addKnowledgeSource({
        officialUrl: quickUrl.trim(),
        category: quickCategory,
        agencyType: 'Official Web Source',
      });
      setQuickUrl('');
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleRowScrape = async (sourceId) => {
    setScrapingId(sourceId);
    try {
      await scrapeSingleSource(sourceId);
    } finally {
      setScrapingId(null);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">
            Knowledge Sources
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Real-time web scraping and policy ingestion from live user-configured websites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isScrapingLive}
            onClick={() => runLiveScraper()}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#093a96] text-xs font-bold border border-slate-200 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScrapingLive ? 'animate-spin' : ''}`} />
            <span>{isScrapingLive ? 'Syncing All Sources...' : 'Sync Scraper'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAddSourceModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-xs font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Source</span>
          </button>
        </div>
      </div>

      {/* 3 Live Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: TOTAL SOURCES */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL SOURCES
            </div>
            <div className="text-3xl font-black text-[#0f172a] mt-0.5">
              {totalAgencies}
            </div>
          </div>
        </div>

        {/* Card 2: LAST SYNC */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              LAST SYNC
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0f172a] mt-0.5 truncate max-w-[200px]">
              {lastSyncText}
            </div>
          </div>
        </div>

        {/* Card 3: SCRAPE ERRORS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              SCRAPE ERRORS
            </div>
            <div className="text-3xl font-black text-[#0f172a] mt-0.5">
              {scrapeErrors}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Website Input & Scraper Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
          <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            required
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            placeholder="Input website URL to scrape (e.g. https://doh.gov.ph or https://facebook.com/vsmmcofficial)..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <select
          value={quickCategory}
          onChange={(e) => setQuickCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-2xl px-4 py-2.5 outline-none cursor-pointer"
        >
          <option value="Health">Health</option>
          <option value="Finance">Finance</option>
          <option value="Education">Education</option>
          <option value="Social Services">Social Services</option>
          <option value="General">General</option>
        </select>

        <button
          type="submit"
          disabled={isQuickAdding || !quickUrl.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#093a96] hover:bg-[#072d75] text-white text-xs font-bold shadow-md shadow-blue-900/10 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isQuickAdding ? 'animate-spin' : ''}`} />
          <span>{isQuickAdding ? 'Scraping Website...' : 'Scrape & Ingest Website'}</span>
        </button>
      </form>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All Sources', 'Health', 'Finance', 'Education', 'Social Services'].map((cat) => {
              const isActive = selectedFilter.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#141870] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right Search Input with Filter Icon */}
          <div className="relative flex items-center max-w-xs w-full">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter sources..."
              className="w-full bg-white text-xs font-medium rounded-xl pl-9 pr-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-600">
                <th className="py-4 px-6">Agency / Website Name</th>
                <th className="py-4 px-6">Official URL</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Last Scraped</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No sources found. Input a website URL above to start live web scraping.
                  </td>
                </tr>
              ) : (
                filteredList.map((row) => {
                  const isThisScraping = scrapingId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Agency Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              row.iconType === 'alert'
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-blue-50 text-[#093a96]'
                            }`}
                          >
                            {row.iconType === 'alert' ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                              {row.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {row.documentsCount} documents indexed
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Official URL */}
                      <td className="py-4 px-6">
                        <a
                          href={row.rawUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-[#093a96] inline-flex items-center gap-1 font-medium truncate max-w-xs"
                        >
                          <span className="truncate">{row.url}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </a>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold ${row.categoryBadge}`}
                        >
                          {row.category}
                        </span>
                      </td>

                      {/* Last Scraped */}
                      <td className="py-4 px-6">
                        {row.statusType === 'error' ? (
                          <span className="text-rose-600 font-semibold">{row.lastScraped}</span>
                        ) : (
                          <span className="text-slate-600 font-medium">{row.lastScraped}</span>
                        )}
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-4 px-6 text-center">
                        {row.statusType === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#141870]" />
                            <span>Active</span>
                          </span>
                        ) : row.statusType === 'error' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            <span>Sync Error</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Scrape URL Live"
                            disabled={isThisScraping}
                            onClick={() => handleRowScrape(row.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-[#093a96] hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isThisScraping ? 'animate-spin text-[#093a96]' : ''}`} />
                          </button>

                          <button
                            type="button"
                            title="Delete Knowledge Source"
                            onClick={() => removeKnowledgeSource(row.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to {filteredList.length} of {sources.length} sources
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddSourceModal />
    </div>
  );
};
