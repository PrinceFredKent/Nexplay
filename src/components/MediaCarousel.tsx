import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types/movie';
import { MediaCard } from './MediaCard';

interface MediaCarouselProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  watchlistIds: number[];
  onToggleWatchlist: (mediaId: number) => void;
  favoriteIds?: number[];
  onToggleFavorite?: (mediaId: number) => void;
  orientation?: 'portrait' | 'landscape';
  progressMap?: Record<number, number>;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  subtitle,
  items,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  favoriteIds = [],
  onToggleFavorite,
  orientation = 'portrait',
  progressMap = {}
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-6 space-y-3 group/section">
      
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 transition-colors focus:outline-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onPlay={onPlay}
            onOpenDetails={onOpenDetails}
            isInWatchlist={watchlistIds.includes(item.id)}
            onToggleWatchlist={onToggleWatchlist}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            orientation={orientation}
            progressPercent={progressMap[item.id]}
          />
        ))}
      </div>

    </section>
  );
};
