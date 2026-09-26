import React, { useState } from 'react';
import { Play, Plus, Check, Info, Volume2, VolumeX, Star, Sparkles } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface HeroBillboardProps {
  media: MediaItem;
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (mediaId: number) => void;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({
  media,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist
}) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative w-full h-[78vh] min-h-[560px] max-h-[820px] overflow-hidden bg-[#090a0f] select-none">
      
      {/* Cinematic Backdrop Image with High Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={media.backdropPath}
          alt={media.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-105 duration-1000"
        />
        
        {/* Layered Gradient Scrims for Flawless Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/60 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090a0f] to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 md:pb-24">
        
        <div className="max-w-2xl space-y-4">
          
          {/* Editorial Tag / Kicker (Unboxed clean text) */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-rose-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spotlight Premiere</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono-data">{media.type === 'movie' ? 'Feature Film' : 'Original Series'}</span>
          </div>

          {/* Massive Display Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.1] text-balance drop-shadow-md">
            {media.title}
          </h1>

          {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-300 font-medium">
            {/* IMDb Rating */}
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-mono-data font-bold text-white">{media.voteAverage.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono-data text-slate-200">{media.releaseDate.slice(0, 4)}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-200 font-mono-data">{media.contentRating}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-200">
              {media.type === 'movie' ? `${media.runtime} min` : `${media.seasonsCount || 1} Season${(media.seasonsCount || 1) > 1 ? 's' : ''}`}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium">4K Ultra HD</span>
          </div>

          {/* Genres unboxed with subtle bullet separators */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {media.genres.slice(0, 4).map((genre, idx) => (
              <React.Fragment key={genre}>
                <span className="hover:text-slate-200 transition-colors">{genre}</span>
                {idx < Math.min(media.genres.length, 4) - 1 && (
                  <span aria-hidden="true" className="text-slate-600">/</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Overview Prose */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl text-balance">
            {media.overview}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            
            {/* Primary Action Button */}
            <button
              onClick={() => onPlay(media)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Play Now</span>
            </button>

            {/* Watchlist Toggle Button */}
            <button
              onClick={() => onToggleWatchlist(media.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none ${
                isInWatchlist 
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40' 
                  : 'bg-white/[0.1] hover:bg-white/[0.18] text-white border border-white/10 backdrop-blur-md'
              }`}
            >
              {isInWatchlist ? <Check className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4" />}
              <span>{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </button>

            {/* More Info Button */}
            <button
              onClick={() => onOpenDetails(media)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white text-sm font-medium border border-white/10 backdrop-blur-md transition-all duration-200 focus:outline-none"
            >
              <Info className="w-4 h-4 text-slate-300" />
              <span>Details</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
