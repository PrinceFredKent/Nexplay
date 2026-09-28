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
  Sliders, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Film, 
  ExternalLink, 
  ShieldCheck 
} from 'lucide-react';
import { Episode, MediaItem, Season, StreamSource } from '../types/movie';
import { STREAM_PROVIDERS } from '../services/streamProviders';
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
  
  // Default to VidLink Ultra 4K (unblocked, mobile-responsive, no referrer check)
  const [providerIndex, setProviderIndex] = useState(0);
  const selectedProvider = STREAM_PROVIDERS[providerIndex] || STREAM_PROVIDERS[0];
  
  // Player Loading state & timeout recovery
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isSeasonDrawerOpen, setIsSeasonDrawerOpen] = useState(false);
  const [loadingDrawerEpisodes, setLoadingDrawerEpisodes] = useState(false);
  const [useNativePlayer, setUseNativePlayer] = useState(false);

  // Auto-disappearing UI Controls state (disappears automatically after 3.5s)
  const [showBottomQuickBar, setShowBottomQuickBar] = useState(true);
  const [showPlayerHeader, setShowPlayerHeader] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Direct Native Video states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(media.runtime ? media.runtime * 60 : 7200);

  // Resume state & Toast
  const [resumeToast, setResumeToast] = useState<{ time: number; visible: boolean } | null>(null);
  const hasInitializedResume = useRef(false);

  // Next Episode Countdown state
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);
  const [isCountdownCancelled, setIsCountdownCancelled] = useState(false);
  const countdownIntervalRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle stream provider URL
  const embedUrl = selectedProvider.getUrl(
    media.tmdbId,
    media.type,
    currentSeason,
    currentEpisode,
    media.imdbId
  );

  // Auto-hide bottom quick actions & controls after 3.5s of idle
  const resetControlsTimer = () => {
    setShowBottomQuickBar(true);
    setShowPlayerHeader(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowBottomQuickBar(false);
      setShowPlayerHeader(false);
    }, 3500);
  };

  // Trigger controls timer on mount, server switch, or episode switch
  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [providerIndex, currentSeason, currentEpisode, useNativePlayer]);

  // When switching servers, reset loader state
  useEffect(() => {
    setIsStreamLoading(true);
    const t = setTimeout(() => {
      setIsStreamLoading(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [providerIndex, currentSeason, currentEpisode, useNativePlayer]);

  // Load Season Episodes in Player
  const ensureSeasonEpisodesLoaded = async (seasonNum: number) => {
    const sData = media.seasons?.find(s => s.seasonNumber === seasonNum);
    if (sData && sData.episodes && sData.episodes.length > 0) return;

    setLoadingDrawerEpisodes(true);
    try {
      const epData = await fetchTvSeasonEpisodes(
        media.tmdbId,
        seasonNum,
        media.cleanTitle || media.title,
        media.backdropPath,
        sData?.episodeCount
      );

      setMedia(prev => {
        const seasons = prev.seasons ? [...prev.seasons] : [];
        const sIndex = seasons.findIndex(s => s.seasonNumber === seasonNum);
        if (sIndex >= 0) {
          seasons[sIndex] = {
            ...seasons[sIndex],
            episodes: epData.episodes,
            name: epData.seasonName || seasons[sIndex].name
          };
        } else {
          seasons.push({
            seasonNumber: seasonNum,
            name: epData.seasonName || `Season ${seasonNum}`,
            overview: epData.seasonOverview || '',
            posterPath: prev.posterPath,
            episodeCount: epData.episodes.length,
            episodes: epData.episodes
          });
        }
        return { ...prev, seasons };
      });
    } catch (err) {
      console.error('Failed to load season episodes for player:', err);
    } finally {
      setLoadingDrawerEpisodes(false);
    }
  };

  useEffect(() => {
    if (media.type === 'tv') {
      ensureSeasonEpisodesLoaded(currentSeason);
    }
  }, [currentSeason]);

  // TV Seasons & Episodes list
  const activeSeasonData: Season | undefined = media.seasons?.find(s => s.seasonNumber === currentSeason) || media.seasons?.[0];
  const activeEpisodeData: Episode | undefined = activeSeasonData?.episodes?.find(e => e.episodeNumber === currentEpisode) || activeSeasonData?.episodes?.[0];

  // Helper: Find next episode in series
  const getNextEpisodeInfo = () => {
    if (media.type !== 'tv') return null;
    const currentSeasonEpisodes = activeSeasonData?.episodes || [];
    const nextInSameSeason = currentSeasonEpisodes.find(e => e.episodeNumber === currentEpisode + 1);
    if (nextInSameSeason) {
      return {
        season: currentSeason,
        episode: currentEpisode + 1,
        name: nextInSameSeason.name,
        stillPath: nextInSameSeason.stillPath || media.backdropPath,
        overview: nextInSameSeason.overview,
        runtime: nextInSameSeason.runtime || 45
      };
    }
    // Check next season
    const nextSeasonNum = currentSeason + 1;
    const nextSeason = media.seasons?.find(s => s.seasonNumber === nextSeasonNum);
    if (nextSeason) {
      const firstEp = nextSeason.episodes?.[0];
      return {
        season: nextSeasonNum,
        episode: 1,
        name: firstEp?.name || `Season ${nextSeasonNum} Episode 1`,
        stillPath: firstEp?.stillPath || nextSeason.posterPath || media.backdropPath,
        overview: firstEp?.overview || '',
        runtime: firstEp?.runtime || 45
      };
    }
    // Generated next fallback
    const currentMaxEpisodes = activeSeasonData?.episodeCount || 10;
    if (currentEpisode < currentMaxEpisodes) {
      return {
        season: currentSeason,
        episode: currentEpisode + 1,
        name: `Episode ${currentEpisode + 1}`,
        stillPath: media.backdropPath,
        overview: `Continue to Season ${currentSeason} Episode ${currentEpisode + 1}`,
        runtime: 45
      };
    }
    return null;
  };

  const nextEpisode = getNextEpisodeInfo();

  // Switch to Next Episode
  const goToNextEpisode = () => {
    if (!nextEpisode) return;
    setCurrentSeason(nextEpisode.season);
    setCurrentEpisode(nextEpisode.episode);
    setCurrentTime(0);
    setNextEpisodeCountdown(null);
    setIsCountdownCancelled(false);
  };

  // Switch between servers easily
  const switchNextServer = (targetIdx?: number) => {
    const nextIdx = targetIdx !== undefined ? targetIdx : (providerIndex + 1) % STREAM_PROVIDERS.length;
    setProviderIndex(nextIdx);
    setUseNativePlayer(STREAM_PROVIDERS[nextIdx]?.type === 'direct');
    resetControlsTimer();
  };

  // Reset when episode changes
  useEffect(() => {
    setNextEpisodeCountdown(null);
    setIsCountdownCancelled(false);
  }, [currentSeason, currentEpisode]);

  // Initialize Resume from previous watch position
  useEffect(() => {
    if (hasInitializedResume.current) return;
    hasInitializedResume.current = true;

    let savedResumeTime = initialTime;
    if (savedResumeTime === undefined) {
      const historyList = getWatchHistory(activeProfileId);
      const saved = historyList.find(h => {
        if (h.mediaId !== media.id) return false;
        if (media.type === 'tv') {
          return (h.season || 1) === currentSeason && (h.episode || 1) === currentEpisode;
        }
        return true;
      });

      if (saved && saved.currentTime && saved.currentTime > 15 && (!saved.duration || saved.currentTime < saved.duration - 30)) {
        savedResumeTime = saved.currentTime;
      }
    }

    if (savedResumeTime && savedResumeTime > 15) {
      setCurrentTime(savedResumeTime);
      setResumeToast({ time: savedResumeTime, visible: true });
      const timer = setTimeout(() => {
        setResumeToast(prev => prev ? { ...prev, visible: false } : null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeProfileId, currentEpisode, currentSeason, initialTime, media.id, media.type]);

  // Countdown timer interval (10 -> 0)
  useEffect(() => {
    if (nextEpisodeCountdown === null) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    if (nextEpisodeCountdown <= 0) {
      if (nextEpisode) {
        goToNextEpisode();
      }
      setNextEpisodeCountdown(null);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setNextEpisodeCountdown(c => (c !== null ? c - 1 : null));
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [nextEpisodeCountdown, nextEpisode]);

  // Save watch progress to localStorage
  useEffect(() => {
    const progressPercent = Math.round((currentTime / (duration || 1)) * 100);
    saveWatchProgress(activeProfileId, {
      mediaId: media.id,
      mediaType: media.type,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      season: media.type === 'tv' ? currentSeason : undefined,
      episode: media.type === 'tv' ? currentEpisode : undefined,
      progress: Math.min(100, Math.max(5, progressPercent)),
      currentTime: Math.round(currentTime || 120),
      duration: Math.round(duration),
      lastWatchedAt: Date.now()
    });
  }, [currentTime, duration, media, currentSeason, currentEpisode, activeProfileId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Escape':
          onClose();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyS':
          e.preventDefault();
          switchNextServer();
          break;
        case 'KeyN':
          if (nextEpisode) {
            e.preventDefault();
            goToNextEpisode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEpisode, providerIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={resetControlsTimer}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none"
    >
      
      {/* Top Persistent Glass Player Control Bar (Auto-hides with graceful transition) */}
      <header className={`absolute top-0 left-0 right-0 z-40 p-2.5 sm:p-4 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between pointer-events-auto transition-all duration-400 ${
        showPlayerHeader || isServerModalOpen || isSeasonDrawerOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        
        {/* Left: Exit & Title info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            aria-label="Exit Cinema Player"
            className="p-2 sm:p-2.5 rounded-2xl bg-white/15 hover:bg-rose-600 text-white shadow-lg backdrop-blur-xl border border-white/20 transition-all hover:scale-105 active:scale-95 shrink-0 focus:outline-none"
            title="Exit Player (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              <span className="text-rose-400">
                {media.type === 'movie' ? 'Movie' : `S${currentSeason} · E${currentEpisode}`}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono-data text-[10px]">
                {useNativePlayer ? 'Native 1080p' : selectedProvider.quality}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-md md:max-w-xl">
              {media.cleanTitle || media.title} {media.type === 'tv' && activeEpisodeData ? `— ${activeEpisodeData.name}` : ''}
            </h2>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Server Switcher Modal Trigger */}
          <button
            onClick={() => setIsServerModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 shadow-sm transition-all active:scale-95 focus:outline-none"
            title="Switch Streaming Server"
          >
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">{useNativePlayer ? 'Native Player' : selectedProvider.name}</span>
            <span className="md:hidden font-mono-data">{useNativePlayer ? 'Native' : `S${providerIndex + 1}`}</span>
          </button>

          {/* Quick 1-Click Server Cycle */}
          <button
            onClick={() => switchNextServer()}
            title="Next Server (Key S)"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* TV Next Episode Button */}
          {media.type === 'tv' && nextEpisode && (
            <button
              onClick={() => setNextEpisodeCountdown(10)}
              title={`Next: S${nextEpisode.season}:E${nextEpisode.episode} ${nextEpisode.name}`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 focus:outline-none"
            >
              <SkipForward className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Next Episode</span>
              <span className="sm:hidden font-mono-data">Next</span>
            </button>
          )}

          {/* TV Episode Drawer Trigger */}
          {media.type === 'tv' && media.seasons && media.seasons.length > 0 && (
            <button
              onClick={() => setIsSeasonDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-500/40 transition-all active:scale-95 focus:outline-none"
              title="View Episodes List"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (Key F)"
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="relative w-full h-full flex items-center justify-center bg-black">
        
        {/* Resume Toast Notification */}
        {resumeToast && resumeToast.visible && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/95 backdrop-blur-xl border border-rose-500/50 text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-medium">
              Resumed from <strong className="font-mono-data text-rose-300">{formatTime(resumeToast.time)}</strong>
            </span>
            <button
              onClick={() => {
                setCurrentTime(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
                setResumeToast(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 hover:text-white transition-colors"
            >
              Start Over ↺
            </button>
            <button
              onClick={() => setResumeToast(null)}
              className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Next Episode Floating Countdown Card */}
        {nextEpisodeCountdown !== null && nextEpisode && (
          <div className="absolute bottom-6 right-4 sm:right-8 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-84 rounded-3xl bg-black/95 backdrop-blur-2xl border border-rose-500/50 p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
                  <span className="absolute text-[11px] font-mono-data font-extrabold text-rose-400">
                    {nextEpisodeCountdown}
                  </span>
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Next Episode in {nextEpisodeCountdown}s
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCountdownCancelled(true);
                  setNextEpisodeCountdown(null);
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss countdown"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Next Episode Preview Card */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="w-16 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={nextEpisode.stillPath || media.backdropPath}
                  alt={nextEpisode.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <span className="text-[10px] font-mono-data text-rose-400 font-bold block">
                  Season {nextEpisode.season} · Episode {nextEpisode.episode}
                </span>
                <h5 className="text-xs font-semibold text-white truncate">
                  {nextEpisode.name}
                </h5>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={goToNextEpisode}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-98 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => {
                  setIsCountdownCancelled(true);
                  setNextEpisodeCountdown(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Video Mode 1: Native Direct HTML5 Video Player */}
        {useNativePlayer || selectedProvider.type === 'direct' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black group">
            <video
              ref={videoRef}
              src={media.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'}
              autoPlay
              playsInline
              controls={false}
              onLoadedData={() => {
                setIsStreamLoading(false);
                if (currentTime > 0 && videoRef.current) {
                  videoRef.current.currentTime = currentTime;
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || 7200);
                }
              }}
              onEnded={() => {
                if (nextEpisode) goToNextEpisode();
              }}
              className="w-full h-full object-contain"
            />

            {/* Custom Cinema Video Controls Overlay (Auto-hides with graceful animation) */}
            <div className={`absolute bottom-4 inset-x-4 sm:inset-x-8 z-30 p-3 rounded-2xl glass-dock flex items-center justify-between gap-4 transition-all duration-400 shadow-2xl ${
              showBottomQuickBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95"
                  aria-label="Play / Pause"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
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

                <span className="text-xs font-mono-data text-slate-300">
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

              {/* Volume & Switch to Embed mode */}
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
                    setUseNativePlayer(false);
                    switchNextServer(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Embed Mode
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Video Mode 2: Multi-Source High-Speed Embed Player */
          <div className="relative w-full h-full">
            <iframe
              key={`${selectedProvider.id}-${media.tmdbId}-${currentSeason}-${currentEpisode}`}
              src={embedUrl}
              title={`${media.title} Stream`}
              onLoad={() => setIsStreamLoading(false)}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              referrerPolicy="no-referrer"
              allowFullScreen
            />

            {/* Quick-Action Bar on Bottom: AUTOMATICALLY DISAPPEARS AFTER 3.5s */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-2xl glass-dock shadow-2xl transition-all duration-500 ease-out ${
              showBottomQuickBar ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <button
                onClick={() => setUseNativePlayer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Play in Native Player</span>
              </button>

              <button
                onClick={() => switchNextServer()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Server</span>
              </button>

              <button
                onClick={() => setShowBottomQuickBar(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss buttons"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Stream Server Switcher Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl glass-dropdown p-6 space-y-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Streaming Servers</h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select a streaming node below to instantly switch video source:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {/* Native HD Player Option */}
              <button
                onClick={() => {
                  setUseNativePlayer(true);
                  setIsServerModalOpen(false);
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                  useNativePlayer
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-slate-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">🎬 Native Direct HD Player</span>
                    <span className="text-[10px] font-mono-data bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      Unblocked
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Direct High-Speed HTML5 Cinema Video</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-data text-emerald-400 font-medium">1080p FHD</span>
                  {useNativePlayer && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>

              {/* Embed Nodes */}
              {STREAM_PROVIDERS.map((provider, idx) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setProviderIndex(idx);
                    setUseNativePlayer(provider.type === 'direct');
                    setIsStreamLoading(true);
                    setIsServerModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                    !useNativePlayer && selectedProvider.id === provider.id
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{provider.name}</span>
                      {provider.badge && (
                        <span className="text-[10px] font-mono-data bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{provider.serverName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-data text-emerald-400 font-medium">{provider.quality}</span>
                    {!useNativePlayer && selectedProvider.id === provider.id && (
                      <Check className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TV Series Seasons & Episodes Drawer */}
      {isSeasonDrawerOpen && media.type === 'tv' && media.seasons && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-dropdown p-6 shadow-2xl flex flex-col justify-between border-l border-white/10 animate-in slide-in-from-right duration-200">
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Episodes</h3>
              </div>
              <button
                onClick={() => setIsSeasonDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Season Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {media.seasons.map(s => (
                <button
                  key={s.seasonNumber}
                  onClick={() => setCurrentSeason(s.seasonNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    currentSeason === s.seasonNumber
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Episodes List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingDrawerEpisodes ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-2.5 rounded-2xl bg-white/[0.04] animate-pulse flex items-center gap-3">
                      <div className="w-16 h-10 rounded-xl bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-white/10 rounded w-2/3" />
                        <div className="h-2.5 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSeasonData?.episodes && activeSeasonData.episodes.length > 0 ? (
                activeSeasonData.episodes.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setCurrentEpisode(ep.episodeNumber);
                      setIsSeasonDrawerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      currentEpisode === ep.episodeNumber
                        ? 'bg-rose-600/20 border border-rose-500/50 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                    }`}
                  >
                    <div className="w-16 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                      <img
                        src={ep.stillPath || media.backdropPath}
                        alt={ep.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {currentEpisode === ep.episodeNumber && (
                        <div className="absolute inset-0 bg-rose-600/40 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-data text-rose-400 font-bold">
                          E{ep.episodeNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{ep.runtime || 45}m</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate">{ep.name}</h4>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No episodes found for this season.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
