import React, { useState } from 'react';
import { Bookmark, Film, Tv, Play, Trash2, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types/movie';
import { MediaCard } from './MediaCard';

interface WatchlistViewProps {
  watchlistIds: number[];
  onToggleWatchlist: (mediaId: number) => void;
  allCatalog: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  favoriteIds: number[];
  onToggleFavorite: (mediaId: number) => void;
  onBrowseCatalog: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlistIds,
  onToggleWatchlist,
  allCatalog,
  onPlay,
  onOpenDetails,
  favoriteIds,
  onToggleFavorite,
  onBrowseCatalog
}) => {
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const watchlistItems = allCatalog.filter(m => watchlistIds.includes(m.id));
  const filteredItems = watchlistItems.filter(m => filterType === 'all' || m.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {watchlistItems.length} title{watchlistItems.length !== 1 ? 's' : ''} saved to watch
          </p>
        </div>

        {/* Filter Tabs (Segmented Buttons) */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({watchlistItems.length})
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'movie' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Movies ({watchlistItems.filter(m => m.type === 'movie').length})
          </button>
          <button
            onClick={() => setFilterType('tv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'tv' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Series ({watchlistItems.filter(m => m.type === 'tv').length})
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map(item => (
            <MediaCard
              key={item.id}
              media={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              isInWatchlist={true}
              onToggleWatchlist={onToggleWatchlist}
              isFavorite={favoriteIds.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-slate-400">
            <Bookmark className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your watchlist is empty</h3>
            <p className="text-xs text-slate-400">
              Browse the library and tap the "+" button on any movie or series to keep track of what to watch next.
            </p>
          </div>
          <button
            onClick={onBrowseCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
          >
            <span>Browse Trending Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
