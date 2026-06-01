'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import CreatorCard, { CreatorCardSkeleton } from '@/components/CreatorCard';
import CollabRequestModal from '@/components/CollabRequestModal';
import { CREATOR_TYPES, INDIAN_CITIES, FOLLOWER_RANGES, type Profile } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  // Filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [activeType, setActiveType] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [followerFilter, setFollowerFilter] = useState('');
  const [lookingForFilter, setLookingForFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Collab modal
  const [collabTarget, setCollabTarget] = useState<Profile | null>(null);

  const fetchCreators = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      // Exclude current user
      if (user) {
        query = query.neq('id', user.id);
      }

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(
          `display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
        );
      }

      // Creator type filter
      if (activeType !== 'All') {
        query = query.contains('creator_types', [activeType]);
      }

      // City filter
      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      // Follower range filter
      if (followerFilter) {
        query = query.eq('follower_range', followerFilter);
      }

      // Looking for filter
      if (lookingForFilter) {
        query = query.contains('looking_for', [lookingForFilter]);
      }

      const { data, error } = await query;

      if (!error && data) {
        if (append) {
          setCreators((prev) => [...prev, ...data]);
        } else {
          setCreators(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [supabase, user, searchQuery, activeType, cityFilter, followerFilter, lookingForFilter]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(0);
    fetchCreators(0, false);
  }, [fetchCreators]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCreators(nextPage, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCreators(0, false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveType('All');
    setCityFilter('');
    setFollowerFilter('');
    setLookingForFilter('');
  };

  const hasActiveFilters =
    searchQuery || activeType !== 'All' || cityFilter || followerFilter || lookingForFilter;

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Discover <span className="gradient-text">Creators</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Browse and connect with creators across India
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, or creator type..."
              className="input-dark pl-12 pr-20 py-3.5 text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-coral/20 text-coral' : 'hover:bg-dark-hover text-muted'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Creator Type Filter Pills */}
        <div className="mb-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveType('All')}
              className={`creator-pill text-sm whitespace-nowrap ${
                activeType === 'All' ? 'active' : ''
              }`}
            >
              All ✨
            </button>
            {CREATOR_TYPES.slice(0, -1).map((type) => (
              <button
                key={type.value}
                onClick={() => setActiveType(type.value)}
                className={`creator-pill text-sm whitespace-nowrap ${
                  activeType === type.value ? 'active' : ''
                }`}
              >
                {type.emoji} {type.value}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters */}
        {showFilters && (
          <div className="glass-card p-4 mb-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input-dark text-sm"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>

              <select
                value={followerFilter}
                onChange={(e) => setFollowerFilter(e.target.value)}
                className="input-dark text-sm"
              >
                <option value="">All Follower Ranges</option>
                {FOLLOWER_RANGES.map((fr) => (
                  <option key={fr.value} value={fr.value}>
                    {fr.label} ({fr.range})
                  </option>
                ))}
              </select>

              <select
                value={lookingForFilter}
                onChange={(e) => setLookingForFilter(e.target.value)}
                className="input-dark text-sm"
              >
                <option value="">Looking for (Any)</option>
                {CREATOR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.value}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-coral hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Creators Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              No Creators Found
            </h3>
            <p className="text-muted text-sm mb-6">
              Try changing your filters or search query
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-outline text-sm">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  profile={creator}
                  onCollabClick={setCollabTarget}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-outline px-8 py-3 text-sm disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Creators'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collab Request Modal */}
      {collabTarget && (
        <CollabRequestModal
          recipient={collabTarget}
          isOpen={!!collabTarget}
          onClose={() => setCollabTarget(null)}
        />
      )}
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dark">
        <div className="pt-20 page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
