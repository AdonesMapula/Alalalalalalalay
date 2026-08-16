import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSearchBar } from '../common/IOSSearchBar';
import { IOSCard } from '../common/IOSCard';
import { IOSSegmentedControl } from '../common/IOSSegmentedControl';
import { EligibilityStatusBadge } from '../common/IOSBadge';

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
  } = useApp();

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
    { id: 'all', label: 'All Statuses' },
    { id: 'Likely Eligible', label: 'Likely Eligible (85%+)' },
    { id: 'Needs Review', label: 'Needs Action' },
  ];

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
    return (opportunities || []).filter((opp) => {
      const oppCat = (opp.category || '').toLowerCase();
      const selCat = (selectedCategory || 'all').toLowerCase();

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
        (opp.categoryName && opp.categoryName.toLowerCase().includes(q));

      // Eligibility filter
      const matchesEligibility =
        selectedEligibilityFilter === 'all' ||
        opp.matchStatus === selectedEligibilityFilter ||
        (selectedEligibilityFilter === 'Likely Eligible' && (opp.matchScore || 0) >= 85);

      return matchesCategory && matchesSearch && matchesEligibility;
    });
  }, [opportunities, selectedCategory, searchQuery, selectedEligibilityFilter]);

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      {/* Search and Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
            Explore Opportunities & Services
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
            Discover all verified Philippine government programs, statutory assistance, and live-scraped circulars
          </p>
        </div>

        <IOSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by benefit name, agency (PhilHealth, SSS, CHED, DOH, DepEd), or keyword..."
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
          Showing <strong>{filteredOpportunities.length}</strong> government opportunities & services
        </div>

        <IOSSegmentedControl
          options={eligibilityOptions}
          value={selectedEligibilityFilter}
          onChange={setSelectedEligibilityFilter}
          size="sm"
        />
      </div>

      {/* Opportunities Responsive Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpportunities.map((opp) => {
            const reqs = opp.requirements || [];
            const metCount = reqs.filter((r) => typeof r === 'object' && r.status === 'met').length;
            const totalReqs = Math.max(reqs.length, 1);
            const sourceUrl = opp.officialSource?.url || '';

            return (
              <IOSCard
                key={opp.id}
                hoverable
                onClick={() => setSelectedOpportunity(opp)}
                className="flex flex-col justify-between space-y-4 group bg-white border border-slate-200/85 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-2.5">
                  {/* Top Agency & Match Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-2xs"
                      style={{ backgroundColor: opp.categoryColor || '#007AFF' }}
                    >
                      {opp.agency || 'Government Service'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                        {opp.matchScore || 90}% Match
                      </span>
                      <EligibilityStatusBadge status={opp.matchStatus || 'Likely Eligible'} />
                    </div>
                  </div>

                  {/* Opportunity Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] group-hover:text-[#007AFF] transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  {/* Opportunity Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {opp.shortDesc || opp.fullDesc || 'Verified government citizen assistance and benefit program.'}
                  </p>
                </div>

                {/* Footer with Requirements Progress & Details button */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate text-[11px] font-medium">
                        {metCount > 0 ? `${metCount} of ${totalReqs} requirements met` : 'Verified Citizen Credentials'}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-[#007AFF] group-hover:translate-x-0.5 ios-spring flex items-center gap-0.5">
                      <span>View Service</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {sourceUrl && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                      <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{sourceUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              </IOSCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E]">No opportunities match your search</h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
            Try adjusting your keyword, resetting filters, or selecting "All Services".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedEligibilityFilter('all');
            }}
            className="text-xs font-bold text-[#007AFF] hover:underline cursor-pointer pt-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
