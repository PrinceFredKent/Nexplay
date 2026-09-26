import React, { useState } from 'react';
import { Play, Plus, Check, Star, Info, Heart } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface MediaCardProps {
  media: MediaItem;
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (mediaId: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (mediaId: number) => void;
  progressPercent?: number;
  orientation?: 'portrait' | 'landscape';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onPlay,
  onOpenDetails,
  isInWatchlist = false,
  onToggleWatchlist,
  isFavorite = false,
  onToggleFavorite,
  progressPercent,
  orientation = 'portrait'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isPortrait = orientation === 'portrait';
  const displayImage = isPortrait ? media.posterPath : (media.backdropPath || media.posterPath);

  return (
    <div 
      className={`group relative flex-none rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform-gpu hover:scale-[1.04] hover:z-20 hover:shadow-2xl hover:shadow-rose-950/40 bg-[#12151e] border border-white/[0.06] ${
        isPortrait ? 'w-40 sm:w-48 md:w-56' : 'w-64 sm:w-72 md:w-80'
      }`}
      onClick={() => onOpenDetails(media)}
    >
      {/* Thumbnail Aspect Ratio Container */}
      <div className={`relative w-full overflow-hidden ${isPortrait ? 'aspect-[2/3]' : 'aspect-video'} bg-[#0f111a]`}>
        
        {/* Shimmer skeleton while image loads */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-900 animate-shimmer" />
        )}

        {/* Fallback container if image fails (Zero-Broken-Image Policy) */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-[#12151e]">
            <span className="text-2xl mb-1">🎬</span>
            <p className="text-xs font-semibold text-slate-300 line-clamp-2">{media.title}</p>
          </div>
        ) : (
          <img
            src={displayImage}
            alt={media.title}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Gradient Scrim for Content Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Continue Watching Progress Bar */}
        {progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
            <div 
              className="h-full bg-rose-600 rounded-r-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}

        {/* Top Quick Actions (Floating on hover) */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(media.id);
              }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white hover:text-rose-400 transition-colors focus:outline-none"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          {onToggleWatchlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(media.id);
              }}
              title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              className={`p-1.5 rounded-full backdrop-blur-md transition-colors focus:outline-none ${
                isInWatchlist ? 'bg-rose-600 text-white' : 'bg-black/60 hover:bg-black/90 text-white hover:text-rose-400'
              }`}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="pointer-events-auto p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition-all duration-150"
            aria-label={`Play ${media.title}`}
          >
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </button>
        </div>

      </div>

      {/* Card Info Section (Zero-Pill clean typography) */}
      <div className="p-3 space-y-1">
        
        {/* Title */}
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
          {media.title}
        </h3>

        {/* Clean Unboxed Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="font-mono-data text-slate-300">{media.releaseDate.slice(0, 4)}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="font-mono-data text-white text-[11px]">{media.voteAverage.toFixed(1)}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="truncate">{media.genres[0] || 'Drama'}</span>
        </div>

      </div>

    </div>
  );
};
