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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSearchBar } from '../common/IOSSearchBar';
import { IOSCard } from '../common/IOSCard';
import { IOSSegmentedControl } from '../common/IOSSegmentedControl';
import { IOSBadge, EligibilityStatusBadge } from '../common/IOSBadge';

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

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || opp.category === selectedCategory;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      // Eligibility filter
      const matchesEligibility =
        selectedEligibilityFilter === 'all' ||
        opp.matchStatus === selectedEligibilityFilter;

      return matchesCategory && matchesSearch && matchesEligibility;
    });
  }, [opportunities, selectedCategory, searchQuery, selectedEligibilityFilter]);

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Search and Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
            Explore Opportunities & Services
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
            Discover verified Philippine government programs, benefits, and statutory discounts
          </p>
        </div>

        <IOSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by benefit name, agency (PhilHealth, SSS, CHED), or keyword..."
        />
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = iconMap[cat.icon] || Sparkles;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold ios-spring cursor-pointer border ${
                isSelected
                  ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm shadow-blue-500/20'
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
          Showing <strong>{filteredOpportunities.length}</strong> government opportunities
        </div>

        <IOSSegmentedControl
          options={eligibilityOptions}
          value={selectedEligibilityFilter}
          onChange={setSelectedEligibilityFilter}
          size="sm"
        />
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => (
            <IOSCard
              key={opp.id}
              hoverable
              onClick={() => setSelectedOpportunity(opp)}
              className="flex flex-col justify-between space-y-4 group bg-white border border-slate-200/80"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: opp.categoryColor }}
                  >
                    {opp.agency}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {opp.matchScore}% Match
                    </span>
                    <EligibilityStatusBadge status={opp.matchStatus} />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E] group-hover:text-[#007AFF] ios-spring leading-snug">
                  {opp.title}
                </h3>

                <p className="text-xs text-[#8E8E93] line-clamp-2 leading-relaxed">
                  {opp.shortDesc}
                </p>
              </div>

              {/* Requirement Met preview */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">
                    {opp.requirements.filter((r) => r.status === 'met').length} of {opp.requirements.length} requirements met
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#007AFF] group-hover:translate-x-0.5 ios-spring flex items-center">
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </IOSCard>
          ))}
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
