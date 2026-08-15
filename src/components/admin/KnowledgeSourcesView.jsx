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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddSourceModal } from './AddSourceModal';

export const KnowledgeSourcesView = () => {
  const {
    sources,
    setAddSourceModalOpen,
    runLiveScrapeSimulation,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState('All Sources');
  const [filterText, setFilterText] = useState('');

  // Dynamic sources from Supabase
  const dynamicList = sources.map((s) => ({
    id: s.id,
    name: s.agency_name || s.agencyName || 'Government Agency',
    url: (s.official_url || s.officialUrl || '').replace(/^https?:\/\//, ''),
    category: s.category || 'General',
    categoryBadge:
      s.category === 'Finance'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-indigo-50 text-indigo-700',
    lastScraped: s.last_scraped_at
      ? new Date(s.last_scraped_at).toISOString().replace('T', ' ').slice(0, 16)
      : s.lastScrapedAt || 'Just now',
    status: s.status || 'Active',
    statusType: (s.status || '').toLowerCase().includes('error')
      ? 'error'
      : (s.status || '').toLowerCase() === 'inactive'
      ? 'inactive'
      : 'active',
    iconType: (s.status || '').toLowerCase().includes('error') ? 'alert' : 'building',
  }));

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

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Section matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">
            Knowledge Sources
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Manage government agency data sources feeding the ALALAY intelligence engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddSourceModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-xs font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Source</span>
        </button>
      </div>

      {/* 3 Metric Stat Cards matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: TOTAL AGENCIES */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL AGENCIES
            </div>
            <div className="text-3xl font-black text-[#0f172a] mt-0.5">
              142
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
            <div className="text-2xl sm:text-3xl font-black text-[#0f172a] mt-0.5">
              2 hours ago
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
              3
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container matching reference image */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {/* Filter Controls Row */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All Sources', 'Health', 'Finance', 'Education'].map((cat) => {
              const isActive = selectedFilter === cat;
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
                <th className="py-4 px-6">Agency Name</th>
                <th className="py-4 px-6">Official URL</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Last Scraped</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((row) => (
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
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* Official URL */}
                  <td className="py-4 px-6">
                    <a
                      href={`https://${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-[#093a96] inline-flex items-center gap-1 font-medium"
                    >
                      <span>{row.url}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching reference image */}
        <div className="p-5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing 1 to {filteredList.length} of 142 agencies
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
    </div>
  );
};
