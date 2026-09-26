import React, { useState } from 'react';
import { 
  Download, 
  Play, 
  Trash2, 
  HardDrive, 
  WifiOff, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OfflineDownload, MediaItem } from '../types/movie';
import { removeDownload } from '../services/storageService';

interface DownloadsViewProps {
  downloads: OfflineDownload[];
  onRefreshDownloads: () => void;
  onPlayOffline: (media: MediaItem, season?: number, episode?: number) => void;
  allCatalog: MediaItem[];
  onBrowseCatalog: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  onRefreshDownloads,
  onPlayOffline,
  allCatalog,
  onBrowseCatalog
}) => {
  const [smartDownloads, setSmartDownloads] = useState(true);

  const totalUsedMB = downloads.reduce((acc, curr) => acc + (curr.sizeMB || 1000), 0);
  const totalUsedGB = (totalUsedMB / 1024).toFixed(2);
  const maxStorageGB = 64;
  const storagePercentage = Math.min(100, Math.round((parseFloat(totalUsedGB) / maxStorageGB) * 100));

  const handleDelete = (id: string) => {
    removeDownload(id);
    onRefreshDownloads();
  };

  const handlePlay = (dl: OfflineDownload) => {
    const matched = allCatalog.find(m => m.id === dl.mediaId) || {
      id: dl.mediaId,
      tmdbId: dl.mediaId,
      title: dl.title,
      type: dl.mediaType,
      overview: 'Offline saved playback',
      posterPath: dl.posterPath,
      backdropPath: dl.backdropPath,
      releaseDate: '2024',
      voteAverage: 8.5,
      voteCount: 100,
      popularity: 100,
      genres: ['Offline'],
      contentRating: 'PG-13',
      spokenLanguages: ['English'],
      directStreamUrl: dl.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      cast: []
    };
    onPlayOffline(matched, dl.seasonNumber, dl.episodeNumber);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header & Storage Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Viewing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Downloaded Content
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Watch anytime without an active internet connection on airplanes, subways, and travels.
          </p>
        </div>

        {/* Device Storage Status Card */}
        <div className="p-4 rounded-xl glass-panel space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Device Storage</span>
            </div>
            <span className="font-mono-data text-white font-semibold">{totalUsedGB} GB / {maxStorageGB} GB</span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, storagePercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{downloads.length} title{downloads.length !== 1 ? 's' : ''} saved</span>
            <button
              onClick={() => setSmartDownloads(!smartDownloads)}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Smart Downloads: {smartDownloads ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloads.map((dl) => (
            <div
              key={dl.id}
              className="group p-3 rounded-xl bg-[#12151e] border border-white/10 hover:border-emerald-500/50 flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative">
                  <img
                    src={dl.posterPath}
                    alt={dl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60 backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {dl.title}
                  </h3>
                  {dl.episodeTitle && (
                    <p className="text-xs text-slate-400 truncate">{dl.episodeTitle}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-data">
                    <span className="text-slate-300">{(dl.sizeMB / 1024).toFixed(1)} GB</span>
                    <span aria-hidden="true">·</span>
                    <span>Offline Ready</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handlePlay(dl)}
                  title="Play offline"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                </button>

                <button
                  onClick={() => handleDelete(dl.id)}
                  title="Remove download"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-slate-400">
            <Download className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No downloaded movies or series yet</h3>
            <p className="text-xs text-slate-400">
              Download your favorite blockbuster films and episodes to watch seamlessly without Wi-Fi.
            </p>
          </div>
          <button
            onClick={onBrowseCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
          >
            <span>Explore Movies & Shows</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
