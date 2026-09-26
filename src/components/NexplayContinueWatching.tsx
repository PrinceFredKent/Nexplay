import React from 'react';
import { Play, Clock } from 'lucide-react';
import { MediaItem, WatchHistoryItem } from '../types/movie';

interface NexplayContinueWatchingProps {
  history?: WatchHistoryItem[];
  allCatalog?: MediaItem[];
  onPlay: (media: MediaItem, season?: number, episode?: number) => void;
}

export const NexplayContinueWatching: React.FC<NexplayContinueWatchingProps> = ({
  history = [],
  allCatalog = [],
  onPlay
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-5 rounded-3xl nexplay-card space-y-2 text-center py-8">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-md">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold text-white">Continue Watching</h3>
        <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
          No watch history yet. Play any movie or episode to resume playback anytime!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl nexplay-card space-y-3">
      
      {/* Title */}
      <h3 className="text-xs font-bold text-white">Continue Watching</h3>

      {/* Items list */}
      <div className="space-y-2">
        {history.slice(0, 4).map((item) => {
          const matchedMedia = allCatalog.find(m => m.id === item.mediaId) || {
            id: item.mediaId,
            tmdbId: item.mediaId,
            title: item.title,
            type: item.mediaType,
            posterPath: item.posterPath,
            backdropPath: item.backdropPath,
            overview: 'Resume playback',
            releaseDate: '2024-01-01',
            voteAverage: 8.0,
            voteCount: 100,
            popularity: 100,
            genres: ['Action'],
            runtime: 120,
            contentRating: 'PG-13',
            spokenLanguages: ['English'],
            directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            downloadSizeMB: 2000,
            cast: []
          };

          return (
            <div
              key={item.mediaId}
              onClick={() => onPlay(matchedMedia, item.season, item.episode)}
              className="group flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                  <img
                    src={item.posterPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=185&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {item.mediaType === 'tv' ? `Season ${item.season || 1} • Ep ${item.episode || 1}` : 'Resume Movie'}
                  </p>
                </div>
              </div>

              {/* Circular play icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(matchedMedia, item.season, item.episode);
                }}
                className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white text-slate-300 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-all shadow-md ml-2"
                aria-label={`Continue ${item.title}`}
              >
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
