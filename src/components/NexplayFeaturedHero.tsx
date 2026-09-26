import React, { useState } from 'react';
import { Play, Download, MoreHorizontal, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface NexplayFeaturedHeroProps {
  items: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  onOpenOptions: (media: MediaItem) => void;
  onDownload: (media: MediaItem) => void;
}

export const NexplayFeaturedHero: React.FC<NexplayFeaturedHeroProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onOpenOptions,
  onDownload
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full rounded-3xl overflow-hidden min-h-[300px] bg-gradient-to-br from-[#121522] via-[#1a0c18] to-black border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xl">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <h3 className="text-xl font-black text-white font-display">Catalog Ready</h3>
        <p className="text-xs text-slate-400 max-w-md">Search any movie or TV show title above to auto-populate storyline, release year, cast, and free streaming links.</p>
      </div>
    );
  }

  const currentMedia = items[currentIndex] || items[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[420px] bg-slate-900 border border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-8 select-none group">
      
      {/* Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentMedia.backdropPath || currentMedia.posterPath}
          alt={currentMedia.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
        />
        
        {/* Dark Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f18] via-[#0d0f18]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f18] via-[#0d0f18]/70 to-transparent w-full md:w-3/4" />
      </div>

      {/* Top Header Row: "🔥 Now Trending" badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Now Trending</span>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="relative z-10 max-w-xl space-y-3 mt-auto pt-12">
        
        {/* Genre Tags */}
        <div className="flex items-center gap-2">
          {currentMedia.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Display Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight text-balance drop-shadow-md">
          {currentMedia.title}
        </h2>

        {/* Overview Snippet */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-lg">
          {currentMedia.overview}
        </p>

        {/* Action Buttons Row */}
        <div className="pt-2 flex items-center gap-3">
          
          {/* Watch / Play Button */}
          <button
            onClick={() => onPlay(currentMedia)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950 translate-x-0.5" />
            <span>Watch</span>
          </button>

          {/* Download Button */}
          <button
            onClick={() => onDownload(currentMedia)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white font-semibold text-xs sm:text-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-200" />
            <span>Download</span>
          </button>

          {/* Options Circle Button (...) */}
          <button
            onClick={() => onOpenOptions(currentMedia)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-200" />
          </button>

        </div>

      </div>

      {/* Bottom Right Carousel Pagination Arrows */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Previous featured"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Next featured"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
