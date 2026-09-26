import React from 'react';
import { Play, Film } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface NexplayNewTrailersFeedProps {
  catalogItems?: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
}

export const NexplayNewTrailersFeed: React.FC<NexplayNewTrailersFeedProps> = ({
  catalogItems = [],
  onPlay,
  onOpenDetails
}) => {
  const itemsWithTrailers = catalogItems.filter(m => m.trailerKey || m.trailerUrl);

  if (itemsWithTrailers.length === 0) {
    return (
      <div className="p-5 rounded-3xl nexplay-card space-y-2 text-center py-8">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400 shadow-md">
          <Film className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold text-white">New Trailers</h3>
        <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
          No trailers in catalog yet. Auto-fill movies above to populate HD trailers!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl nexplay-card space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <span className="text-amber-400">🔥</span>
          <span>New Trailers</span>
        </div>
      </div>

      {/* Trailer Cards Stack */}
      <div className="space-y-2.5">
        {itemsWithTrailers.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => onPlay(item)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[2.4/1] bg-slate-900 border border-white/10 transition-all hover:border-rose-500/50 hover:scale-[1.02]"
          >
            <img
              src={item.backdropPath || item.posterPath}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Title & Play overlay */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <div className="flex justify-end">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300">
                  {item.runtime ? `${item.runtime}m` : 'HD'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
                  {item.title}
                </h4>

                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-rose-600 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
