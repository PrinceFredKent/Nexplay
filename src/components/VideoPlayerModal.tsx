import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Server, 
  FastForward, 
  Layers, 
  Film, 
  Check, 
  Keyboard, 
  Sparkles,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Episode, MediaItem, Season, StreamSource } from '../types/movie';
import { STREAM_PROVIDERS, SAMPLE_DIRECT_STREAMS } from '../services/streamProviders';
import { saveWatchProgress } from '../services/storageService';

interface VideoPlayerModalProps {
  media: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onClose: () => void;
  activeProfileId: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  activeProfileId
}) => {
  // Streaming source state
  const [selectedProvider, setSelectedProvider] = useState<StreamSource>(STREAM_PROVIDERS[0]);
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [playerMode, setPlayerMode] = useState<'embed' | 'direct'>('embed');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isSeasonDrawerOpen, setIsSeasonDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Direct video controls state (when using native HTML5 player or direct stream)
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.runtime ? media.runtime * 60 : 7200);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('4K Ultra HD');
  const [selectedAudio, setSelectedAudio] = useState('English [Original]');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English [CC]');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Auto-hide controls timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  // Construct dynamic embed URL for currently selected provider
  const embedUrl = selectedProvider.getUrl(
    media.tmdbId,
    media.type,
    currentSeason,
    currentEpisode,
    media.imdbId
  );

  // TV Seasons & Episodes list
  const activeSeasonData: Season | undefined = media.seasons?.find(s => s.seasonNumber === currentSeason) || media.seasons?.[0];
  const activeEpisodeData: Episode | undefined = activeSeasonData?.episodes?.find(e => e.episodeNumber === currentEpisode) || activeSeasonData?.episodes?.[0];

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
      progress: Math.min(100, Math.max(0, progressPercent)),
      currentTime: Math.round(currentTime),
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
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          setIsMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const seekDelta = (delta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      setCurrentTime(videoRef.current.currentTime);
    } else {
      setCurrentTime(t => Math.max(0, Math.min(duration, t + delta)));
    }
  };

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
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
    >
      
      {/* Top Overlay Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            aria-label="Exit Cinema Player"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <span>{media.type === 'movie' ? 'Movie' : `Season ${currentSeason} · Episode ${currentEpisode}`}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono-data">{selectedProvider.quality}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate max-w-md sm:max-w-xl">
              {media.title} {media.type === 'tv' && activeEpisodeData ? `— ${activeEpisodeData.name}` : ''}
            </h2>
          </div>
        </div>

        {/* Top Right Controls (Server Switcher, TV Episode Drawer, Keyboard help) */}
        <div className="flex items-center gap-2">
          
          {/* Server Switcher Trigger */}
          <button
            onClick={() => setIsServerModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.12] hover:bg-white/[0.2] text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-colors focus:outline-none"
          >
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{selectedProvider.name}</span>
            <span className="sm:hidden">Server</span>
          </button>

          {/* TV Episode Selector Trigger */}
          {media.type === 'tv' && media.seasons && media.seasons.length > 0 && (
            <button
              onClick={() => setIsSeasonDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.12] hover:bg-white/[0.2] text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-colors focus:outline-none"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Episodes</span>
            </button>
          )}

          {/* Player Mode Switcher (Embed vs Native Direct) */}
          <button
            onClick={() => setPlayerMode(playerMode === 'embed' ? 'direct' : 'embed')}
            title="Switch between multi-source embed stream and native direct player"
            className="p-2 rounded-lg bg-white/[0.1] hover:bg-white/[0.2] text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Keyboard Shortcuts Dialog */}
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            title="Keyboard Shortcuts"
            className="p-2 rounded-lg bg-white/[0.1] hover:bg-white/[0.2] text-slate-300 hover:text-white transition-colors hidden sm:block"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {playerMode === 'embed' ? (
          <iframe
            key={`${selectedProvider.id}-${media.tmdbId}-${currentSeason}-${currentEpisode}`}
            src={embedUrl}
            title={`${media.title} Stream`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={media.directStreamUrl || SAMPLE_DIRECT_STREAMS[0]}
              autoPlay
              playsInline
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || 7200);
                }
              }}
              onEnded={() => {
                if (media.type === 'tv') {
                  setCurrentEpisode(e => e + 1);
                }
              }}
              className="w-full h-full object-contain"
            />

            {/* Skip Intro Button (Show during 0:10 - 1:20) */}
            {currentTime > 10 && currentTime < 85 && (
              <button
                onClick={() => seekDelta(75)}
                className="absolute bottom-24 right-8 z-30 px-4 py-2 rounded-lg bg-black/80 hover:bg-black/95 text-white border border-white/20 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
              >
                <FastForward className="w-4 h-4 text-rose-500" />
                <span>Skip Intro</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Video Controls (Active in Direct Mode or as Companion Toolbar) */}
      {playerMode === 'direct' && (
        <div 
          className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Timeline Slider */}
          <div className="space-y-2 mb-3">
            <div className="relative group/timeline cursor-pointer flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none accent-rose-600 cursor-pointer focus:outline-none group-hover/timeline:h-2.5 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono-data text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
              </button>

              <button
                onClick={() => seekDelta(-10)}
                title="Rewind 10s"
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => seekDelta(10)}
                title="Forward 10s"
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    setIsMuted(false);
                    if (videoRef.current) {
                      videoRef.current.volume = val;
                      videoRef.current.muted = false;
                    }
                  }}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-full appearance-none accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Tools (Speed, Quality, Fullscreen) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Playback speed selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    const rates = [0.75, 1, 1.25, 1.5, 2];
                    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
                    const nextRate = rates[nextIdx];
                    setPlaybackRate(nextRate);
                    if (videoRef.current) videoRef.current.playbackRate = nextRate;
                  }}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono-data text-white transition-colors"
                >
                  {playbackRate}x
                </button>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Server Switcher Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 space-y-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Select Stream Provider</h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              If your current stream buffers or fails, instantly switch to an alternate high-bandwidth server node below:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {STREAM_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsServerModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all border ${
                    selectedProvider.id === provider.id
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
                    {selectedProvider.id === provider.id && (
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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
              {activeSeasonData?.episodes.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setCurrentEpisode(ep.episodeNumber);
                    setIsSeasonDrawerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all border ${
                    currentEpisode === ep.episodeNumber
                      ? 'bg-rose-600/20 border-rose-500'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5'
                  }`}
                >
                  <div className="w-16 h-10 rounded-md overflow-hidden bg-slate-800 shrink-0 relative">
                    <img
                      src={ep.stillPath || media.backdropPath}
                      alt={ep.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {ep.episodeNumber}. {ep.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono-data">
                      {ep.runtime} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Dialog */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl glass-dropdown p-6 space-y-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-rose-400" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowKeyboardHelp(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">Play / Pause</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono-data text-white">Space / K</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">Seek 10s Backward / Forward</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono-data text-white">← / →</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">Toggle Fullscreen</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono-data text-white">F</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-300">Mute / Unmute</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono-data text-white">M</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-300">Volume Up / Down</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono-data text-white">↑ / ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
