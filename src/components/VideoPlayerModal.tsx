import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Server, 
  SkipForward, 
  Layers, 
  Check, 
  Keyboard, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Tv, 
  Maximize, 
  Minimize, 
  ChevronRight, 
  Wifi, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Film, 
  ExternalLink, 
  ShieldCheck,
  Flame,
  Clapperboard,
  MonitorPlay,
  ChevronDown
} from 'lucide-react';
import { Episode, MediaItem, Season, StreamSource } from '../types/movie';
import { STREAM_PROVIDERS, SAMPLE_DIRECT_STREAMS } from '../services/streamProviders';
import { saveWatchProgress, getWatchHistory } from '../services/storageService';
import { fetchTvSeasonEpisodes } from '../services/catalogService';

interface VideoPlayerModalProps {
  media: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  initialTime?: number;
  onClose: () => void;
  activeProfileId: string;
}

type PlayerMode = 'embed' | 'trailer' | 'native';

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media: initialMedia,
  initialSeason = 1,
  initialEpisode = 1,
  initialTime,
  onClose,
  activeProfileId
}) => {
  const [media, setMedia] = useState<MediaItem>(initialMedia);
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  
  // Player Mode: 'embed' (streaming nodes), 'trailer' (official 4K trailer), 'native' (HTML5 direct player)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('embed');
  const [providerIndex, setProviderIndex] = useState(0);
  const selectedProvider = STREAM_PROVIDERS[providerIndex] || STREAM_PROVIDERS[0];
  
  // Ad-Shield State (Ultra by default: blocks all new tabs, popups, and clickjack redirects)
  const [adBlockMode, setAdBlockMode] = useState<'ultra' | 'permissive'>('ultra');

  // UI & Drawer States
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [isSeasonDrawerOpen, setIsSeasonDrawerOpen] = useState(false);
  const [loadingDrawerEpisodes, setLoadingDrawerEpisodes] = useState(false);
  const [showQuickBar, setShowQuickBar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const serverDropdownRef = useRef<HTMLDivElement>(null);

  // Global Popup & Tab Redirect Interceptor
  useEffect(() => {
    const originalWindowOpen = window.open;
    if (adBlockMode === 'ultra') {
      window.open = function (...args: any[]) {
        console.warn('[Nexplay Ultra Ad-Shield] Intercepted and blocked popup/tab redirect attempt:', args);
        return null;
      };
    }
    return () => {
      window.open = originalWindowOpen;
    };
  }, [adBlockMode]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target as Node)) {
        setIsServerDropdownOpen(false);
      }
    };
    if (isServerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServerDropdownOpen]);

  // TV Episodes State
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);

  // Direct Native Video states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(media.runtime ? media.runtime * 60 : 7200);
  const [nativePlayError, setNativePlayError] = useState(false);
  const [sampleStreamIndex, setSampleStreamIndex] = useState(0);

  // Next Episode Countdown state
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);
  const [isCountdownCancelled, setIsCountdownCancelled] = useState(false);
  const countdownIntervalRef = useRef<any>(null);
  const quickBarTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if upcoming / unreleased title (e.g. 2025/2026)
  const releaseYear = parseInt(media.releaseDate?.slice(0, 4) || '2024', 10);
  const isUpcomingTitle = releaseYear >= 2026;

  // Compute embed URL
  const embedUrl = selectedProvider.getUrl(
    media.tmdbId,
    media.type,
    currentSeason,
    currentEpisode,
    media.imdbId
  );

  // Official YouTube trailer embed URL
  const trailerKey = media.trailerKey || 'cqGjhVJWtEg';
  const youtubeTrailerUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;

  // Auto-hide bottom quick bar after 4s idle
  const resetQuickBarTimer = () => {
    setShowQuickBar(true);
    if (quickBarTimerRef.current) clearTimeout(quickBarTimerRef.current);
    quickBarTimerRef.current = setTimeout(() => {
      setShowQuickBar(false);
    }, 4000);
  };

  useEffect(() => {
    resetQuickBarTimer();
    return () => {
      if (quickBarTimerRef.current) clearTimeout(quickBarTimerRef.current);
    };
  }, [providerIndex, playerMode]);

  // Load TV Episodes when season changes
  useEffect(() => {
    if (media.type !== 'tv') return;

    let isMounted = true;
    setLoadingDrawerEpisodes(true);

    fetchTvSeasonEpisodes(media.tmdbId, currentSeason, media.title)
      .then(res => {
        if (!isMounted) return;
        const list = res?.episodes || [];
        setEpisodesList(list);
        setLoadingDrawerEpisodes(false);

        const next = list.find((e: Episode) => e.episodeNumber === currentEpisode + 1);
        setNextEpisode(next || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadingDrawerEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [media.tmdbId, media.type, media.title, currentSeason, currentEpisode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (isServerModalOpen) setIsServerModalOpen(false);
        else if (isSeasonDrawerOpen) setIsSeasonDrawerOpen(false);
        else onClose();
      } else if (e.key === ' ' && playerMode === 'native' && videoRef.current) {
        e.preventDefault();
        toggleNativePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        handleNextServer();
      } else if (e.key === 'm' || e.key === 'M') {
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isServerModalOpen, isSeasonDrawerOpen, playerMode, isPlaying]);

  // Next Server Switcher
  const handleNextServer = () => {
    setPlayerMode('embed');
    setIsStreamLoading(true);
    setProviderIndex(prev => (prev + 1) % STREAM_PROVIDERS.length);
  };

  // Switch to specific server
  const handleSelectServer = (idx: number) => {
    setPlayerMode('embed');
    setIsStreamLoading(true);
    setProviderIndex(idx);
    setIsServerModalOpen(false);
  };

  // Switch to YouTube 4K Trailer Mode
  const handleSelectTrailer = () => {
    setPlayerMode('trailer');
    setIsStreamLoading(true);
    setIsServerModalOpen(false);
  };

  // Switch to Native Player Mode
  const handleSelectNative = () => {
    setPlayerMode('native');
    setIsStreamLoading(false);
    setIsServerModalOpen(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(false);
          setNativePlayError(true);
        });
      }
    }, 200);
  };

  // Native Play / Pause Toggle
  const toggleNativePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setNativePlayError(false);
      }).catch(err => {
        console.warn('Native video autoplay blocked, muting first:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true));
        }
      });
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Go to next episode
  const goToNextEpisode = () => {
    if (!nextEpisode) return;
    setCurrentEpisode(nextEpisode.episodeNumber);
    setIsCountdownCancelled(true);
    setNextEpisodeCountdown(null);
    setIsStreamLoading(true);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayTitle = media.title.includes('(') 
    ? media.title 
    : (media.releaseDate ? `${media.title} (${media.releaseDate.slice(0, 4)})` : media.title);

  const directVideoSource = media.directStreamUrl || SAMPLE_DIRECT_STREAMS[sampleStreamIndex] || SAMPLE_DIRECT_STREAMS[0];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* PERSISTENT TOP HEADER CONTROLS BAR (Always Visible) */}
      <div className="absolute top-0 inset-x-0 z-40 px-4 sm:px-6 py-3 bg-gradient-to-b from-black/95 via-black/75 to-transparent backdrop-blur-md flex items-center justify-between border-b border-white/5 shadow-2xl">
        
        {/* Left: Close & Title Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            aria-label="Close Player"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {playerMode === 'trailer' ? '4K TRAILER' : playerMode === 'native' ? 'NATIVE 1080P' : selectedProvider.quality}
              </span>
              {media.type === 'tv' && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  S{currentSeason} : E{currentEpisode}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md">
              {displayTitle}
            </h2>
          </div>
        </div>

        {/* Center: Combined Server & Quality Dropdown */}
        <div className="relative" ref={serverDropdownRef}>
          <button
            type="button"
            onClick={() => setIsServerDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-black/80 hover:bg-black/95 text-white backdrop-blur-xl border border-white/15 shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              {playerMode === 'trailer' 
                ? 'Official 4K Trailer' 
                : playerMode === 'native' 
                  ? 'Native Player' 
                  : selectedProvider.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              {playerMode === 'trailer' ? '4K UHD' : playerMode === 'native' ? '1080P' : selectedProvider.quality.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isServerDropdownOpen ? 'rotate-180 text-rose-400' : ''}`} />
          </button>

          {/* Combined Server Dropdown Menu */}
          {isServerDropdownOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 sm:w-80 rounded-2xl bg-[#0d0f17]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-white/10">
              
              {/* Primary Streaming Servers */}
              <div className="p-1 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                  Streaming Nodes
                </div>
                {STREAM_PROVIDERS.map((provider, idx) => {
                  const isCurrent = playerMode === 'embed' && providerIndex === idx;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        handleSelectServer(idx);
                        setIsServerDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-rose-600/20 border border-rose-500/40 text-white shadow-lg shadow-rose-950/40' 
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-slate-600'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-rose-300' : 'text-slate-200'}`}>
                            {provider.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate font-mono">
                            {provider.serverName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {provider.quality.split(' ')[0]}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Alternative Playback Modes */}
              <div className="p-1 pt-2 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
                  Alternative Players
                </div>

                {/* 4K Trailer */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectTrailer();
                    setIsServerDropdownOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    playerMode === 'trailer'
                      ? 'bg-gradient-to-r from-red-600/30 to-rose-600/30 border border-red-500/40 text-white' 
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Official 4K Trailer</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Direct 4K Cinema YouTube Stream</span>
                    </div>
                  </div>
                  {playerMode === 'trailer' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>

                {/* Native HTML5 Player */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectNative();
                    setIsServerDropdownOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    playerMode === 'native'
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-white' 
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Native HTML5 Player</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Hardware Accelerated Direct Video</span>
                    </div>
                  </div>
                  {playerMode === 'native' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>

              </div>

              {/* Ad-Shield Security Toggle */}
              <div className="p-2 bg-black/40 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setAdBlockMode(prev => prev === 'ultra' ? 'permissive' : 'ultra')}
                  className="w-full p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">
                        Ad-Shield: {adBlockMode === 'ultra' ? 'ULTRA ACTIVE' : 'STANDARD'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {adBlockMode === 'ultra' ? 'Popups & Tab Redirects Blocked' : 'Popups Allowed'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    {adBlockMode === 'ultra' ? 'STRICT' : 'PERMISSIVE'}
                  </span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Right: TV Episodes, Ad-Shield Pill, Next Server, Fullscreen */}
        <div className="flex items-center gap-2">
          
          {/* Ad-Shield Pill Button */}
          <button
            type="button"
            onClick={() => setAdBlockMode(prev => prev === 'ultra' ? 'permissive' : 'ultra')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-md border transition-all cursor-pointer ${
              adBlockMode === 'ultra'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 shadow-lg shadow-emerald-950/30'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
            title={adBlockMode === 'ultra' ? 'Ultra Ad-Shield Active: All popups, pop-unders, and tab redirects are blocked by HTML5 sandbox.' : 'Standard Mode'}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ad-Shield: {adBlockMode === 'ultra' ? 'ULTRA' : 'STANDARD'}</span>
          </button>
          
          {/* TV Episodes Drawer Trigger */}
          {media.type === 'tv' && (
            <button
              onClick={() => setIsSeasonDrawerOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10 transition-transform active:scale-95 cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Quick Next Server Button */}
          <button
            onClick={handleNextServer}
            title="Next Server (Shortcut: S)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (Shortcut: F)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-95 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* MAIN VIDEO DISPLAY CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        
        {/* MODE 1: OFFICIAL 4K CINEMA TRAILER PLAYER (Always 100% playable for all movies & series) */}
        {playerMode === 'trailer' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <iframe
              key={`trailer-${media.tmdbId}-${trailerKey}`}
              src={youtubeTrailerUrl}
              title={`${media.title} Official 4K Trailer`}
              onLoad={() => setIsStreamLoading(false)}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>
        )}

        {/* MODE 2: NATIVE HTML5 DIRECT PLAYER */}
        {playerMode === 'native' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black group">
            {nativePlayError ? (
              <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center max-w-md space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-xl">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Direct Hardware Feed Offline</h4>
                  <p className="text-xs text-slate-400">This specific direct feed is currently unreachable. Switch to DoodStream Core or the Official 4K Trailer.</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSelectServer(0)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                  >
                    Switch to DoodStream Core
                  </button>
                  <button
                    onClick={handleSelectTrailer}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all active:scale-95"
                  >
                    Play 4K Trailer
                  </button>
                </div>
              </div>
            ) : (
              <video
                key={directVideoSource}
                ref={videoRef}
                src={directVideoSource}
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                onError={() => {
                  setNativePlayError(true);
                  setIsStreamLoading(false);
                }}
                onLoadedData={() => {
                  setIsStreamLoading(false);
                  setNativePlayError(false);
                  if (currentTime > 0 && videoRef.current) {
                    videoRef.current.currentTime = currentTime;
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    setDuration(videoRef.current.duration || 7200);
                  }
                }}
                onEnded={() => {
                  if (nextEpisode) goToNextEpisode();
                }}
                className="w-full h-full object-contain cursor-pointer"
                onClick={toggleNativePlay}
              />
            )}

            {/* Centered Click-to-Play Overlay if paused */}
            {!isPlaying && !nativePlayError && (
              <div 
                onClick={toggleNativePlay}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/overlay"
              >
                <div className="w-20 h-20 rounded-full bg-rose-600 group-hover/overlay:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 transition-transform group-hover/overlay:scale-110 active:scale-95 animate-pulse">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <span className="text-white font-bold text-sm mt-3 bg-black/60 px-4 py-1 rounded-full border border-white/10">
                  Click to Play Direct Stream
                </span>
              </div>
            )}

            {/* Native Video Controls Bar */}
            <div className={`absolute bottom-4 inset-x-4 sm:inset-x-8 z-30 p-3.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-4 transition-all duration-300 shadow-2xl ${
              showQuickBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleNativePlay}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95 transition-all"
                  aria-label="Play / Pause"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 10;
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title="Forward 10s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Progress Scrub Bar */}
              <div className="flex-1 max-w-md hidden sm:block">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setCurrentTime(t);
                    if (videoRef.current) videoRef.current.currentTime = t;
                  }}
                  className="w-full accent-rose-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Volume & Switch Stream Source */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setSampleStreamIndex(prev => (prev + 1) % SAMPLE_DIRECT_STREAMS.length);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  title="Switch Direct Source Feed"
                >
                  Feed #{sampleStreamIndex + 1}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODE 3: MULTI-SOURCE HIGH-SPEED EMBED PLAYER */}
        {playerMode === 'embed' && (
          <div className="relative w-full h-full bg-black">
            <iframe
              key={`${selectedProvider.id}-${media.tmdbId}-${currentSeason}-${currentEpisode}-${adBlockMode}`}
              src={embedUrl}
              title={`${media.title} Stream`}
              onLoad={() => setIsStreamLoading(false)}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              sandbox={
                adBlockMode === 'ultra'
                  ? 'allow-scripts allow-same-origin allow-forms allow-presentation allow-encrypted-media'
                  : 'allow-scripts allow-same-origin allow-forms allow-presentation allow-encrypted-media allow-popups'
              }
              referrerPolicy="no-referrer"
              allowFullScreen
            />
          </div>
        )}

        {/* FLOATING BOTTOM QUICK BAR (DISAPPEARS AUTOMATICALLY) */}
        <div className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300 ${
          showQuickBar ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          
          <button
            onClick={handleSelectTrailer}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
              playerMode === 'trailer' 
                ? 'bg-rose-600 text-white shadow-rose-600/40' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>4K Trailer Mode</span>
          </button>

          <button
            onClick={handleNextServer}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Server</span>
          </button>

          <button
            onClick={handleSelectNative}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
              playerMode === 'native' 
                ? 'bg-emerald-600 text-white shadow-emerald-600/40' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Native Player</span>
          </button>

        </div>

      </div>

      {/* SERVER SELECTION MODAL */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1018] border border-white/15 p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Select Streaming Engine</h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Special 4K Trailer option */}
            <div 
              onClick={handleSelectTrailer}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                playerMode === 'trailer'
                  ? 'bg-gradient-to-r from-rose-950/60 to-red-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                  : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Official 4K Cinema Trailer</span>
                    <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                      100% PLAYABLE
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Guaranteed instant 4K preview with zero buffer or server error</p>
                </div>
              </div>
              {playerMode === 'trailer' && <Check className="w-4 h-4 text-rose-400" />}
            </div>

            {/* Native Player Option */}
            <div 
              onClick={handleSelectNative}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                playerMode === 'native'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                  : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Direct HTML5 Native Player</span>
                    <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      NATIVE MP4
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Hardware accelerated browser player with custom controls</p>
                </div>
              </div>
              {playerMode === 'native' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>

            {/* Cloud Embed Nodes */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Multi-Source Cloud Servers
              </span>
              {STREAM_PROVIDERS.map((srv, idx) => (
                <div
                  key={srv.id}
                  onClick={() => handleSelectServer(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    playerMode === 'embed' && providerIndex === idx
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{srv.name}</span>
                    <span className="text-[10px] text-slate-400">{srv.serverName} • {srv.quality}</span>
                  </div>
                  {playerMode === 'embed' && providerIndex === idx && (
                    <Check className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TV SEASON & EPISODE DRAWER */}
      {isSeasonDrawerOpen && media.type === 'tv' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md h-full bg-[#0b0d14] border-l border-white/10 p-6 flex flex-col space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Season {currentSeason} Episodes</h3>
              </div>
              <button
                onClick={() => setIsSeasonDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Episode List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingDrawerEpisodes ? (
                <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading episodes...</span>
                </div>
              ) : episodesList.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => {
                    setCurrentEpisode(ep.episodeNumber);
                    setIsSeasonDrawerOpen(false);
                    setIsStreamLoading(true);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    currentEpisode === ep.episodeNumber
                      ? 'bg-rose-950/40 border-rose-500 shadow-md'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      E{ep.episodeNumber}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{ep.name}</h4>
                      <span className="text-[10px] text-slate-400">{ep.runtime ? `${ep.runtime} min` : 'HD Stream'}</span>
                    </div>
                  </div>
                  {currentEpisode === ep.episodeNumber && <Play className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
