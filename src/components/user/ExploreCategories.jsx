import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Coins,
  GraduationCap,
  Briefcase,
  Home as HomeIcon,
  Users,
  Building2,
  Gift,
  FileText,
  ExternalLink,
  Globe,
  Award,
  Pin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSearchBar } from '../common/IOSSearchBar';
import { IOSCard } from '../common/IOSCard';
import { IOSSegmentedControl } from '../common/IOSSegmentedControl';
import { EligibilityStatusBadge } from '../common/IOSBadge';
import {
  rankAndFilterOpportunities,
  calculateCitizenAge,
  MINIMUM_DISPLAY_MATCH_SCORE,
  TOP_MATCH_SCORE,
} from '../../services/rulesEngine';

export const ExploreCategories = () => {
  const {
    opportunities,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedEligibilityFilter,
    setSelectedEligibilityFilter,
    setSelectedOpportunity,
    user,
    documents,
    pinnedOpportunityIds,
    togglePinOpportunity,
  } = useApp();

  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const userAge = calculateCitizenAge(user);
  const isSenior = Boolean(user?.isSeniorCitizen || user?.is_senior_citizen || userAge >= 60);

  const iconMap = {
    Sparkles,
    HeartPulse,
    Coins,
    GraduationCap,
    Briefcase,
    Home: HomeIcon,
    Users,
    Building2,
    Gift,
    FileText,
  };

  const eligibilityOptions = [
    { id: 'all', label: '80%+ Matches' },
    { id: 'Likely Eligible', label: 'Top Matches' },
    { id: 'Needs Review', label: 'Needs Review' },
  ];

  // Dynamically rank all opportunities for this citizen
  const rankedOpportunities = useMemo(() => {
    return rankAndFilterOpportunities(opportunities, user, documents);
  }, [opportunities, user, documents]);

  // Dynamically compute unique categories from opportunities & default categories
  const dynamicCategories = useMemo(() => {
    const defaultCats = [...categories];
    const existingIds = new Set(defaultCats.map((c) => c.id.toLowerCase()));

    opportunities.forEach((opp) => {
      const catId = (opp.category || 'general').toLowerCase();
      if (!existingIds.has(catId)) {
        existingIds.add(catId);
        defaultCats.push({
          id: catId,
          name: opp.categoryName || opp.category || 'Public Service',
          icon: 'Sparkles',
          count: 1,
        });
      }
    });

    return defaultCats;
  }, [categories, opportunities]);

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    const filtered = (rankedOpportunities || []).filter((opp) => {
      const oppCat = (opp.category || '').toLowerCase();
      const selCat = (selectedCategory || 'all').toLowerCase();
      const isPinned = pinnedOpportunityIds.includes(opp.id);

      // Category filter
      const matchesCategory =
        selCat === 'all' ||
        oppCat === selCat ||
        (opp.categoryName && opp.categoryName.toLowerCase() === selCat);

      // Search filter
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (opp.title && opp.title.toLowerCase().includes(q)) ||
        (opp.agency && opp.agency.toLowerCase().includes(q)) ||
        (opp.shortDesc && opp.shortDesc.toLowerCase().includes(q)) ||
        (opp.categoryName && opp.categoryName.toLowerCase().includes(q)) ||
        (opp.matchBadge && opp.matchBadge.toLowerCase().includes(q));

      // Pinned-only view always surfaces saved services regardless of match score,
      // since a citizen may pin something precisely because they aren't ready yet.
      if (showPinnedOnly) {
        return isPinned && matchesCategory && matchesSearch;
      }

      // Keep the default feed focused on stronger matches. Lower scores remain available
      // through the explicit review filter when a citizen wants to see them.
      const meetsMinimumMatch = (opp.matchScore || 0) >= MINIMUM_DISPLAY_MATCH_SCORE;
      const meetsTopMatch = (opp.matchScore || 0) >= TOP_MATCH_SCORE;
      const matchesEligibility =
        selectedEligibilityFilter === 'all'
          ? meetsMinimumMatch
          : selectedEligibilityFilter === 'Likely Eligible'
            ? meetsTopMatch
            : selectedEligibilityFilter === 'Needs Review'
              ? !meetsMinimumMatch
              : opp.matchStatus === selectedEligibilityFilter;

      return matchesCategory && matchesSearch && matchesEligibility;
    });

    // Surface pinned services first so they're immediately visible after a refresh.
    return [...filtered].sort((a, b) => {
      const aPinned = pinnedOpportunityIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedOpportunityIds.includes(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [rankedOpportunities, selectedCategory, searchQuery, selectedEligibilityFilter, pinnedOpportunityIds, showPinnedOnly]);

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      {/* Search and Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
              Explore Opportunities & Services
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
              Discover verified Philippine government programs, statutory assistance, and live-scraped circulars
            </p>
          </div>

          {isSenior && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Senior Citizen Match Filter Active ({userAge} yrs)</span>
            </div>
          )}
        </div>

        <IOSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by benefit name, agency (PhilHealth, SSS, CHED, DOH, DepEd, OSCA), or keyword..."
        />
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {dynamicCategories.map((cat) => {
          const isSelected = (selectedCategory || 'all').toLowerCase() === cat.id.toLowerCase();
          const Icon = iconMap[cat.icon] || Sparkles;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold ios-spring cursor-pointer border ${
                isSelected
                  ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm shadow-blue-500/20 font-bold'
                  : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Eligibility Filter Switch */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-[#8E8E93] font-medium">
          Showing <strong>{filteredOpportunities.length}</strong>{' '}
          {showPinnedOnly
            ? 'pinned services'
            : selectedEligibilityFilter === 'Needs Review'
              ? 'services to review'
              : selectedEligibilityFilter === 'Likely Eligible'
                ? 'services with a 90%+ match'
                : 'services with an 80%+ match'}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPinnedOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              showPinnedOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:border-slate-300'
            }`}
            title="Show only services you've pinned for later"
          >
            <Pin className={`w-3.5 h-3.5 ${showPinnedOnly ? 'fill-amber-500 text-amber-600' : ''}`} />
            <span>Pinned{pinnedOpportunityIds.length > 0 ? ` (${pinnedOpportunityIds.length})` : ''}</span>
          </button>

          <IOSSegmentedControl
            options={eligibilityOptions}
            value={selectedEligibilityFilter}
            onChange={setSelectedEligibilityFilter}
            size="sm"
          />
        </div>
      </div>

      {/* Opportunities Responsive Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const reqs = opp.requirements || [];
            const sourceUrl = opp.officialSource?.url || '';
            const isPinned = pinnedOpportunityIds.includes(opp.id);

            return (
              <IOSCard
                key={opp.id}
                hoverable
                onClick={() => setSelectedOpportunity(opp)}
                className={`relative flex flex-col justify-between space-y-4 group bg-white border shadow-sm hover:shadow-md transition-all duration-200 ${
                  opp.isSeniorPriority
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200/85 hover:border-blue-300'
                }`}
              >
                {/* Pin / Save for Later */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinOpportunity(opp.id);
                  }}
                  aria-label={isPinned ? 'Unpin this service' : 'Pin this service for later'}
                  aria-pressed={isPinned}
                  title={isPinned ? 'Unpin' : 'Pin for later'}
                  className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    isPinned
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-white/90 text-slate-400 border border-slate-200 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  {isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-500" /> : <Pin className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-2.5">
                  {/* Top Agency & Match Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pr-8">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-2xs"
                      style={{ backgroundColor: opp.categoryColor || '#007AFF' }}
                    >
                      {opp.agency || 'Government Service'}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                          opp.isSeniorPriority
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
                        }`}
                      >
                        {opp.matchScore || 90}% Match
                      </span>
                      <EligibilityStatusBadge status={opp.matchStatus || 'Likely Eligible'} />
                    </div>
                  </div>

                  {/* Demographic Match Tag (if applicable) */}
                  {opp.matchBadge && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#093a96] border border-blue-200 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-[#093a96]" />
                      <span>{opp.matchBadge}</span>
                    </div>
                  )}

                  {/* Title and Description */}
                  <div>
                    <h3 className="text-base font-bold text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#8E8E93] line-clamp-2 mt-1 leading-relaxed">
                      {opp.shortDesc || opp.fullDesc || 'Official government assistance and citizen support opportunity.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#F2F2F7] flex items-center justify-between text-xs text-[#8E8E93]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Citizen Charter</span>
                  </div>

                  {opp.totalDocCount > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Locker: <strong className={opp.docReadinessPercent === 100 ? 'text-emerald-600' : 'text-blue-600'}>{opp.matchedDocCount}/{opp.totalDocCount} Docs</strong>
                    </span>
                  )}

                  <span className="text-[#007AFF] font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Service
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </IOSCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#C6C6C8] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#007AFF] flex items-center justify-center mx-auto">
            {showPinnedOnly ? <Pin className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E]">
            {showPinnedOnly ? 'No Pinned Services Yet' : 'No Matching Services Found'}
          </h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
            {showPinnedOnly
              ? "Tap the pin icon on any service card to save it here for quick access later — even if you don't have the required document yet."
              : 'No public services matched your search query. Try clearing filters or searching for another government program.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedEligibilityFilter('all');
              setShowPinnedOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold shadow-xs hover:bg-[#0066d6] cursor-pointer transition-colors"
          >
            Reset Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
