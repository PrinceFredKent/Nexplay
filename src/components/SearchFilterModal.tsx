import React, { useState, useEffect, useTransition } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Star, 
  RotateCcw, 
  Film, 
  Tv, 
  Sparkles,
  Check
} from 'lucide-react';
import { MediaItem, MediaType } from '../types/movie';
import { searchExternalTMDB } from '../services/catalogService';
import { MediaCard } from './MediaCard';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  watchlistIds: number[];
  onToggleWatchlist: (mediaId: number) => void;
  favoriteIds: number[];
  onToggleFavorite: (mediaId: number) => void;
  initialQuery?: string;
  initialType?: 'all' | 'movie' | 'tv';
}

const ALL_GENRES = [
  'All Genres',
  'Action',
  'Sci-Fi',
  'Drama',
  'Animation',
  'Anime',
  'Adventure',
  'Thriller',
  'Horror',
  'Comedy',
  'Crime',
  'Fantasy',
  'Mystery',
  'History'
];

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  favoriteIds,
  onToggleFavorite,
  initialQuery = '',
  initialType = 'all'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>(initialType);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest' | 'title'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search execution with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const rawResults = await searchExternalTMDB(query, mediaType);
      
      // Apply client-side filters
      let filtered = rawResults.filter(item => {
        // Genre filter
        if (selectedGenre !== 'All Genres' && !item.genres.includes(selectedGenre)) {
          return false;
        }
        // Min rating
        if (minRating > 0 && item.voteAverage < minRating) {
          return false;
        }
        // Year filter
        if (selectedYear !== 'All Years') {
          const year = parseInt(item.releaseDate.slice(0, 4));
          if (selectedYear === '2024+' && year < 2024) return false;
          if (selectedYear === '2020-2023' && (year < 2020 || year > 2023)) return false;
          if (selectedYear === '2010s' && (year < 2010 || year > 2019)) return false;
          if (selectedYear === 'Classics' && year >= 2010) return false;
        }
        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === 'rating') return b.voteAverage - a.voteAverage;
        if (sortBy === 'latest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return b.popularity - a.popularity;
      });

      startTransition(() => {
        setResults(filtered);
        setIsSearching(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, mediaType, selectedGenre, selectedYear, minRating, sortBy, isOpen]);

  if (!isOpen) return null;

  const handleResetFilters = () => {
    setSelectedGenre('All Genres');
    setSelectedYear('All Years');
    setMinRating(0);
    setSortBy('popular');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090a0f]/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Search Input Header */}
      <div className="border-b border-white/[0.08] p-4 sm:p-6 bg-[#090a0f]/80">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, actors, directors, or genres..."
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
              showFilters || selectedGenre !== 'All Genres' || minRating > 0
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Close Search Modal */}
          <button
            onClick={onClose}
            className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Tabs (Segmented Buttons) */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMediaType('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              mediaType === 'all' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setMediaType('movie')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              mediaType === 'movie' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType('tv')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              mediaType === 'tv' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white bg-white/[0.04]'
            }`}
          >
            TV Series
          </button>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-4 p-4 rounded-xl glass-panel space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Genre Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                >
                  {ALL_GENRES.map(g => (
                    <option key={g} value={g} className="bg-slate-900 text-white">{g}</option>
                  ))}
                </select>
              </div>

              {/* Release Era */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Release Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="All Years">All Years</option>
                  <option value="2024+">2024 & Newer</option>
                  <option value="2020-2023">2020 – 2023</option>
                  <option value="2010s">2010 – 2019</option>
                  <option value="Classics">Classics (Before 2010)</option>
                </select>
              </div>

              {/* Min IMDb Rating */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="0">Any Rating</option>
                  <option value="7">7.0+ ★ Good</option>
                  <option value="8">8.0+ ★ Great</option>
                  <option value="8.5">8.5+ ★ Masterpiece</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Sort Order</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="latest">Latest Release</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-slate-400">
                Found <strong className="font-mono-data text-white">{results.length}</strong> matching titles
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-slate-900 animate-shimmer" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onPlay={onPlay}
                  onOpenDetails={onOpenDetails}
                  isInWatchlist={watchlistIds.includes(item.id)}
                  onToggleWatchlist={onToggleWatchlist}
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-3">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-white">No titles matched your search</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for another movie title, actor, or adjusting your genre and rating filters.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
