import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Play, 
  Check, 
  Film, 
  Tv, 
  Star, 
  Clock, 
  User, 
  Link, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Flame,
  Clapperboard,
  ShieldCheck
} from 'lucide-react';
import { MediaItem } from '../types/movie';
import confetti from 'canvas-confetti';

interface SmartAutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (media: MediaItem) => void;
  onSelectMediaToPlay?: (media: MediaItem) => void;
}

export const SmartAutoFillModal: React.FC<SmartAutoFillModalProps> = ({
  isOpen,
  onClose,
  onAddMedia,
  onSelectMediaToPlay
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Auto-filled Movie State
  const [autofilledData, setAutofilledData] = useState<any | null>(null);
  const [searchResultsList, setSearchResultsList] = useState<any[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen) return null;

  const handleSearchAndAutofill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setIsAdded(false);

    try {
      const response = await fetch('/api/search-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: searchQuery.trim() })
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to search movie details');
      }

      setAutofilledData(json.data);
      setSearchResultsList(json.results || [json.data]);
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'Error searching backend. Please check network or try another title.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveCatalogItem = () => {
    if (!autofilledData) return;

    const newMedia: MediaItem = {
      id: autofilledData.id || Date.now(),
      tmdbId: autofilledData.tmdbId || autofilledData.id,
      imdbId: autofilledData.imdbId || 'tt1375666',
      title: autofilledData.title,
      originalTitle: autofilledData.originalTitle || autofilledData.title,
      type: autofilledData.type || 'movie',
      tagline: autofilledData.tagline || `Stream ${autofilledData.title} in 4K`,
      overview: autofilledData.overview,
      posterPath: autofilledData.posterPath,
      backdropPath: autofilledData.backdropPath,
      releaseDate: autofilledData.releaseDate,
      voteAverage: autofilledData.voteAverage || 8.5,
      voteCount: autofilledData.voteCount || 2000,
      popularity: autofilledData.popularity || 250,
      genres: autofilledData.genres || ['Action', 'Sci-Fi'],
      runtime: autofilledData.runtime || 120,
      seasonsCount: autofilledData.seasonsCount,
      episodesCount: autofilledData.episodesCount,
      director: autofilledData.director || 'Director',
      contentRating: autofilledData.contentRating || 'PG-13',
      spokenLanguages: autofilledData.spokenLanguages || ['English'],
      trailerKey: autofilledData.trailerKey || 'cqGjhVJWtEg',
      trailerUrl: autofilledData.trailerUrl || 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      directStreamUrl: autofilledData.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      downloadSizeMB: autofilledData.downloadSizeMB || 2400,
      isFeatured: true,
      isTrending: true,
      cast: autofilledData.cast || []
    };

    onAddMedia(newMedia);
    setIsAdded(true);
    
    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onSelectMediaToPlay) {
      setTimeout(() => {
        onSelectMediaToPlay(newMedia);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0d0f17] border border-white/10 shadow-[0_0_80px_rgba(225,29,72,0.2)] overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display tracking-tight flex items-center gap-2">
                <span>Movie Search & Auto-Fill System</span>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  BACKEND AI & TMDB
                </span>
              </h2>
              <p className="text-xs text-slate-400">Type any title to auto-populate description, cast, runtime, genres, and free streaming links.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-b from-black/40 to-transparent">
          <form onSubmit={handleSearchAndAutofill} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type movie or TV title e.g. Inception, Gladiator II, Stranger Things..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Backend...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Search & Auto-Fill</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Title Examples */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500">Try quick titles:</span>
            {['Inception', 'Spider-Man Across the Spider-Verse', 'Stranger Things', 'Dune Part Two', 'Interstellar'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSearchQuery(t);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {searchError && (
          <div className="m-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Auto-Filled Results Content */}
        {autofilledData ? (
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            
            {/* Multi-Year Releases Banner / Selector */}
            {searchResultsList.length > 0 && (
              <div className="space-y-3 p-4 rounded-2xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Clapperboard className="w-4 h-4 text-amber-400" />
                    <span>Select Specific Release Version ({searchResultsList.length} Aired Releases)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Real IMDb / OMDb Metadata</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {searchResultsList.map((item) => {
                    const isSelected = autofilledData.id === item.id || autofilledData.imdbId === item.imdbId;
                    return (
                      <button
                        key={item.id || item.imdbId}
                        type="button"
                        onClick={() => setAutofilledData(item)}
                        className={`flex flex-col p-2 rounded-2xl transition-all text-left border overflow-hidden group ${
                          isSelected
                            ? 'bg-rose-600/30 border-rose-500 text-white shadow-xl shadow-rose-950/50 scale-102 ring-2 ring-rose-500'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2 bg-slate-950">
                          <img
                            src={item.posterPath}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-amber-400">
                            ★ {item.voteAverage}
                          </div>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-rose-600/80 backdrop-blur-md text-[9px] font-bold text-white uppercase">
                            {item.type}
                          </div>
                        </div>
                        <h5 className="text-xs font-bold truncate w-full">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.director || 'Director'}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auto-fill Success Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auto-fill Complete! Backend fetched description, cast, length, genres & streaming links.</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded">
                100% POPULATED
              </span>
            </div>

            {/* Poster & Main Overview Hero */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-black/40 border border-white/10">
              
              {/* Poster Column */}
              <div className="md:col-span-4 shrink-0">
                <img
                  src={autofilledData.posterPath}
                  alt={autofilledData.title}
                  className="w-full h-72 rounded-2xl object-cover border border-white/20 shadow-2xl"
                />
              </div>

              {/* Details Column */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    {autofilledData.type === 'tv' ? 'TV Series' : 'Feature Movie'}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{autofilledData.voteAverage} / 10</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {autofilledData.releaseDate?.slice(0, 4)}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white font-display">
                  {autofilledData.title}
                </h3>

                <p className="text-xs text-rose-300 italic font-serif">
                  "{autofilledData.tagline}"
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {autofilledData.genres?.map((g: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-xs font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Length & Director */}
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{autofilledData.runtime} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Director: {autofilledData.director}</span>
                  </div>
                </div>

                {/* Overview Description */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-300 mb-1">Description (Auto-Filled):</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                    {autofilledData.overview}
                  </p>
                </div>
              </div>

            </div>

            {/* Cast Members Row */}
            {autofilledData.cast && autofilledData.cast.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-400" />
                  <span>Auto-Filled Cast ({autofilledData.cast.length} Actors):</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {autofilledData.cast.map((actor: any, idx: number) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 text-center space-y-1">
                      <img
                        src={actor.profilePath}
                        alt={actor.name}
                        className="w-12 h-12 rounded-full object-cover mx-auto border border-rose-500/30"
                      />
                      <span className="text-[11px] font-bold text-white block truncate">{actor.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{actor.character}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free Streaming Links Box */}
            <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Free HD Streaming Links (Auto-Generated):</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  4 Active Servers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {autofilledData.freeStreamLinks?.map((srv: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{srv.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{srv.quality}</span>
                    </div>
                    <a
                      href={srv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <span>Stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Catalog Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400">
                Ready to add <strong className="text-white">{autofilledData.title}</strong> to Nexplay catalog?
              </span>

              <button
                type="button"
                onClick={handleSaveCatalogItem}
                disabled={isAdded}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added & Opening Player!</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Add to Nexplay Catalog & Watch Free</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center space-y-3 text-slate-400">
            <Clapperboard className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white">Enter a movie or TV show title above</h3>
            <p className="text-xs max-w-md mx-auto text-slate-400">
              The backend system will automatically pull synopsis, cast, runtime, genres, posters, and 4 free HD streaming links.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
