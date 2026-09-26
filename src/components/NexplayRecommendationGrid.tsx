import React from 'react';
import { Play, MoreHorizontal } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface NexplayRecommendationGridProps {
  items: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  onOpenOptions: (media: MediaItem) => void;
  onSeeAll?: () => void;
}

export const NexplayRecommendationGrid: React.FC<NexplayRecommendationGridProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onOpenOptions,
  onSeeAll
}) => {
  return (
    <section className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-extrabold text-white font-display">
          You might like
        </h3>

        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            See all
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenDetails(item)}
            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-4 min-h-[220px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl"
          >
            {/* Background Poster/Backdrop Image */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={item.posterPath}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c13] via-[#0b0c13]/70 to-transparent" />
            </div>

            {/* Top row: Genre tag and ... menu */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-200">
                {item.genres[0] || 'Drama'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenOptions(item);
                }}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom row: Title, overview snippet, and circular white play button */}
            <div className="relative z-10 flex items-end justify-between gap-3 mt-12">
              <div className="space-y-1 min-w-0 pr-2">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {item.overview}
                </p>
              </div>

              {/* Floating circular play button (exact match to screenshot) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item);
                }}
                className="w-10 h-10 rounded-full bg-white text-slate-950 hover:bg-rose-500 hover:text-white flex items-center justify-center shrink-0 shadow-xl hover:scale-110 transition-all"
                aria-label={`Play ${item.title}`}
              >
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
