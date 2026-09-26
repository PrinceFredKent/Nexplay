import React from 'react';
import { Play, Plus, Check, Heart, Download, Info, X } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface OptionsMenuModalProps {
  media: MediaItem | null;
  onClose: () => void;
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (mediaId: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (mediaId: number) => void;
  onDownload: (media: MediaItem) => void;
}

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({
  media,
  onClose,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
  isFavorite,
  onToggleFavorite,
  onDownload
}) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      
      <div className="w-full max-w-sm rounded-3xl glass-dropdown p-6 space-y-4 border border-white/10 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img src={media.posterPath} alt={media.title} className="w-10 h-14 rounded-lg object-cover" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{media.title}</h3>
              <p className="text-xs text-slate-400 font-mono-data">{media.releaseDate.slice(0, 4)} · ★ {media.voteAverage}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="space-y-2">
          
          <button
            onClick={() => {
              onClose();
              onPlay(media);
            }}
            className="w-full p-3 rounded-2xl bg-white text-slate-950 font-bold text-xs flex items-center gap-3 hover:bg-slate-200 transition-colors"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Watch / Stream Now</span>
          </button>

          <button
            onClick={() => {
              onToggleWatchlist(media.id);
            }}
            className={`w-full p-3 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-colors ${
              isInWatchlist
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
            }`}
          >
            {isInWatchlist ? <Check className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4" />}
            <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            onClick={() => {
              onToggleFavorite(media.id);
            }}
            className={`w-full p-3 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-colors ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            <span>{isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDownload(media);
            }}
            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center gap-3 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download for Offline</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenDetails(media);
            }}
            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-medium text-xs flex items-center gap-3 transition-colors"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>View Full Details & Cast</span>
          </button>

        </div>

      </div>

    </div>
  );
};
