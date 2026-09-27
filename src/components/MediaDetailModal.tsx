import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Download, 
  Share2, 
  Heart, 
  Film, 
  Tv, 
  Clock, 
  Calendar, 
  User, 
  MessageSquare, 
  Send,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Info
} from 'lucide-react';
import { MediaItem, Season, UserReview, UserProfile, Episode } from '../types/movie';
import { getReviewsForMedia, addReview, addDownload, getWatchHistory } from '../services/storageService';
import { getMediaDetails, fetchTvSeasonEpisodes } from '../services/catalogService';

interface MediaDetailModalProps {
  media: MediaItem;
  onClose: () => void;
  onPlay: (media: MediaItem, season?: number, episode?: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (mediaId: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (mediaId: number) => void;
  activeProfile: UserProfile;
  allCatalog: MediaItem[];
  onOpenAnotherDetails: (media: MediaItem) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  media: initialMedia,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
  isFavorite,
  onToggleFavorite,
  activeProfile,
  allCatalog,
  onOpenAnotherDetails
}) => {
  const [media, setMedia] = useState<MediaItem>(initialMedia);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'reviews' | 'trailer'>(
    initialMedia.type === 'tv' ? 'episodes' : 'overview'
  );
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [newRating, setNewRating] = useState<number>(10);
  const [newComment, setNewComment] = useState<string>('');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Fetch Season Episodes helper
  const loadEpisodesForSeason = useCallback(async (seasonNum: number, currentMedia: MediaItem) => {
    // Check if season already has episodes
    const seasonData = currentMedia.seasons?.find(s => s.seasonNumber === seasonNum);
    if (seasonData && seasonData.episodes && seasonData.episodes.length > 0) {
      return;
    }

    setLoadingEpisodes(true);
    try {
      const epData = await fetchTvSeasonEpisodes(
        currentMedia.tmdbId,
        seasonNum,
        currentMedia.cleanTitle || currentMedia.title,
        currentMedia.backdropPath,
        seasonData?.episodeCount
      );

      setMedia(prev => {
        const seasons = prev.seasons ? [...prev.seasons] : [];
        const sIndex = seasons.findIndex(s => s.seasonNumber === seasonNum);
        if (sIndex >= 0) {
          seasons[sIndex] = {
            ...seasons[sIndex],
            name: epData.seasonName || seasons[sIndex].name || `Season ${seasonNum}`,
            overview: epData.seasonOverview || seasons[sIndex].overview || '',
            episodes: epData.episodes,
            episodeCount: epData.episodes.length
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
        return {
          ...prev,
          seasons
        };
      });
    } catch (err) {
      console.error('Error loading season episodes:', err);
    } finally {
      setLoadingEpisodes(false);
    }
  }, []);

  // Fetch enriched details on mount
  useEffect(() => {
    let isMounted = true;
    getMediaDetails(initialMedia.tmdbId, initialMedia.type).then(enriched => {
      if (!isMounted) return;
      setMedia(enriched);

      const firstSeason = enriched.seasons?.[0]?.seasonNumber || 1;
      setSelectedSeason(firstSeason);

      if (enriched.type === 'tv') {
        loadEpisodesForSeason(firstSeason, enriched);
      }
    });
    setReviews(getReviewsForMedia(initialMedia.id));

    return () => {
      isMounted = false;
    };
  }, [initialMedia, loadEpisodesForSeason]);

  // Handle season switch
  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    loadEpisodesForSeason(seasonNum, media);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const created = addReview({
      mediaId: media.id,
      userId: activeProfile.id,
      userName: activeProfile.name,
      userAvatar: activeProfile.avatar,
      rating: newRating,
      comment: newComment.trim()
    });

    setReviews([created, ...reviews]);
    setNewComment('');
  };

  const handleDownloadEpisode = (seasonNum: number, epNum: number, epTitle?: string) => {
    addDownload({
      mediaId: media.id,
      mediaType: 'tv',
      title: `${media.cleanTitle || media.title} — S${seasonNum}:E${epNum} (${epTitle || 'Episode ' + epNum})`,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      seasonNumber: seasonNum,
      episodeNumber: epNum,
      episodeTitle: epTitle,
      sizeMB: 480
    });
    setDownloadSuccessMessage(`Added Season ${seasonNum}, Episode ${epNum} to Downloads!`);
    setTimeout(() => setDownloadSuccessMessage(null), 3500);
  };

  const handleDownloadMovie = () => {
    addDownload({
      mediaId: media.id,
      mediaType: 'movie',
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      sizeMB: media.downloadSizeMB || 2400
    });
    setDownloadSuccessMessage(`Added "${media.title}" to Downloads!`);
    setTimeout(() => setDownloadSuccessMessage(null), 3500);
  };

  const activeSeasonData: Season | undefined = media.seasons?.find(s => s.seasonNumber === selectedSeason) || media.seasons?.[0];
  const similarItems = allCatalog.filter(m => m.id !== media.id && m.genres.some(g => media.genres.includes(g))).slice(0, 6);

  // Total count of episodes
  const totalEpisodeCount = media.episodesCount || (
    media.seasons?.reduce((acc, s) => acc + (s.episodes?.length || s.episodeCount || 0), 0)
  ) || (media.seasonsCount ? media.seasonsCount * 10 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-[#0e1017] border border-white/10 sm:rounded-2xl overflow-hidden shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/95 text-white backdrop-blur-md border border-white/10 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative w-full h-72 sm:h-96 overflow-hidden bg-[#090a0f]">
          <img
            src={media.backdropPath || media.posterPath}
            alt={media.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1017] via-transparent to-transparent w-2/3" />

          {/* Banner Details Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
                <span>{media.type === 'movie' ? 'Movie' : 'TV Series'}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300 font-mono-data">{media.releaseDate.slice(0, 4)}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-emerald-400">4K Ultra HD</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight text-balance">
                {media.title}
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {(() => {
                const savedItem = getWatchHistory(activeProfile.id).find(h => h.mediaId === media.id);
                const hasProgress = savedItem && savedItem.currentTime && savedItem.currentTime > 15;
                return (
                  <button
                    onClick={() => {
                      if (hasProgress && savedItem) {
                        onPlay(media, savedItem.season || selectedSeason, savedItem.episode || 1);
                      } else {
                        onPlay(media, selectedSeason, 1);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {hasProgress && savedItem
                        ? (savedItem.mediaType === 'tv'
                            ? `Resume S${savedItem.season || 1}:E${savedItem.episode || 1}`
                            : `Resume (${Math.floor(savedItem.currentTime / 60)}m)`)
                        : (media.type === 'tv' ? `Play S${selectedSeason}:E1` : 'Play')}
                    </span>
                  </button>
                );
              })()}

              <button
                onClick={() => onToggleWatchlist(media.id)}
                title="Toggle Watchlist"
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors focus:outline-none ${
                  isInWatchlist
                    ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4 text-rose-400" /> : <Plus className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onToggleFavorite(media.id)}
                title="Toggle Favorite"
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors focus:outline-none ${
                  isFavorite
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20 hover:text-rose-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              {media.type === 'movie' && (
                <button
                  onClick={handleDownloadMovie}
                  title="Download for offline viewing"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-colors focus:outline-none"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Download Success Notification Toast */}
        {downloadSuccessMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{downloadSuccessMessage}</span>
            </div>
            <span className="font-mono-data text-[11px] text-emerald-400">Ready in Downloads</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-white/[0.08] flex items-center gap-6 mt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors focus:outline-none ${
              activeTab === 'overview'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>

          {media.type === 'tv' && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors focus:outline-none flex items-center gap-1.5 ${
                activeTab === 'episodes'
                  ? 'border-rose-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Episodes</span>
              {totalEpisodeCount > 0 && (
                <span className="text-[11px] font-mono-data bg-white/10 text-rose-300 px-1.5 py-0.2 rounded-full">
                  {totalEpisodeCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors focus:outline-none flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>User Reviews</span>
            {reviews.length > 0 && (
              <span className="font-mono-data text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full">
                {reviews.length}
              </span>
            )}
          </button>

          {media.trailerKey && (
            <button
              onClick={() => setActiveTab('trailer')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors focus:outline-none ${
                activeTab === 'trailer'
                  ? 'border-rose-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Trailer
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[52vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-mono-data text-white">{media.voteAverage.toFixed(1)} / 10</span>
                  <span className="text-slate-500 font-normal font-mono-data text-xs">({media.voteCount.toLocaleString()} votes)</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono-data text-slate-300">{media.releaseDate}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono-data text-slate-300">{media.contentRating}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300">
                  {media.type === 'movie' 
                    ? `${media.runtime} minutes` 
                    : `${media.seasonsCount || media.seasons?.length || 1} Season${(media.seasonsCount || media.seasons?.length || 1) > 1 ? 's' : ''} (${totalEpisodeCount} Episodes)`}
                </span>
              </div>

              {/* Tagline */}
              {media.tagline && (
                <p className="text-sm italic text-rose-300/90 font-medium">"{media.tagline}"</p>
              )}

              {/* Synopsis */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {media.overview}
              </p>

              {/* Director & Genres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {media.director && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Director</span>
                    <span className="font-medium text-white">{media.director}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block mb-0.5">Genres</span>
                  <span className="font-medium text-white">{media.genres.join(' · ')}</span>
                </div>
                {media.spokenLanguages && media.spokenLanguages.length > 0 && (
                  <div>
                    <span className="text-slate-500 block mb-0.5">Audio Languages</span>
                    <span className="font-medium text-white">{media.spokenLanguages.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Cast Members */}
              {media.cast && media.cast.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Featured Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {media.cast.map(c => (
                      <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <img
                          src={c.profilePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=185&auto=format&fit=crop&q=80'}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{c.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{c.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Recommendations */}
              {similarItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">More Like This</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {similarItems.map(sim => (
                      <div
                        key={sim.id}
                        onClick={() => onOpenAnotherDetails(sim)}
                        className="group cursor-pointer space-y-1.5"
                      >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 border border-white/10 group-hover:border-rose-500 transition-colors">
                          <img
                            src={sim.posterPath}
                            alt={sim.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-white">{sim.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: TV EPISODES (Rich Season Browser & Episode Cards) */}
          {activeTab === 'episodes' && media.type === 'tv' && (
            <div className="space-y-4">
              
              {/* Season Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {(media.seasons && media.seasons.length > 0 
                    ? media.seasons 
                    : Array.from({ length: media.seasonsCount || 1 }, (_, i) => ({
                        seasonNumber: i + 1,
                        name: `Season ${i + 1}`,
                        episodeCount: 10,
                        overview: '',
                        posterPath: '',
                        episodes: []
                      }))
                  ).map(s => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => handleSeasonChange(s.seasonNumber)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedSeason === s.seasonNumber
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white'
                      }`}
                    >
                      {s.name}
                      {s.episodeCount ? ` (${s.episodeCount})` : ''}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-data text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {activeSeasonData?.episodes?.length || activeSeasonData?.episodeCount || 0} Episodes Available
                  </span>
                </div>
              </div>

              {/* Season Synopsis if available */}
              {activeSeasonData?.overview && (
                <p className="text-xs text-slate-300 italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {activeSeasonData.overview}
                </p>
              )}

              {/* Episodes List or Skeleton Loader */}
              {loadingEpisodes ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex gap-4 animate-pulse">
                      <div className="w-28 sm:w-36 h-20 rounded-lg bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSeasonData?.episodes && activeSeasonData.episodes.length > 0 ? (
                <div className="space-y-3">
                  {activeSeasonData.episodes.map(ep => (
                    <div
                      key={ep.id}
                      className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
                    >
                      {/* Left side: Thumbnail, Episode Title & Synopsis */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        
                        {/* Thumbnail with overlay */}
                        <div 
                          onClick={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                          className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0 relative cursor-pointer group/thumb border border-white/10 shadow-md"
                        >
                          <img
                            src={ep.stillPath || media.backdropPath || media.posterPath}
                            alt={ep.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 flex items-center justify-center transition-colors">
                            <div className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                              <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                            </div>
                          </div>
                          
                          {/* Duration Badge */}
                          {ep.runtime && (
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono-data text-[10px] text-slate-200 font-medium">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>

                        {/* Title & Plot */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono-data text-xs text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                              E{ep.episodeNumber}
                            </span>
                            <h4 
                              onClick={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                              className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors truncate cursor-pointer"
                            >
                              {ep.name}
                            </h4>
                            {ep.voteAverage && (
                              <span className="text-[11px] font-mono-data text-amber-400 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {ep.voteAverage.toFixed(1)}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {ep.overview || `Watch Episode ${ep.episodeNumber} of ${media.cleanTitle || media.title} in Ultra HD.`}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Play</span>
                        </button>

                        <button
                          onClick={() => handleDownloadEpisode(selectedSeason, ep.episodeNumber, ep.name)}
                          title="Download episode for offline playback"
                          className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-slate-300 hover:text-white border border-white/10 transition-colors focus:outline-none"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3 bg-white/[0.02] rounded-2xl border border-white/5">
                  <Layers className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">Loading episodes for Season {selectedSeason}...</p>
                  <button
                    onClick={() => loadEpisodesForSeason(selectedSeason, media)}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reload Episodes</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: USER REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Submit a review form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Rate this {media.type === 'movie' ? 'film' : 'show'}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewRating(val)}
                        className={`w-6 h-6 rounded text-xs font-mono-data font-bold transition-colors ${
                          newRating >= val ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-400 hover:bg-white/20'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on the plot, cinematography, or acting..."
                    className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-white">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-mono-data font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: OFFICIAL TRAILER */}
          {activeTab === 'trailer' && media.trailerKey && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${media.trailerKey}?autoplay=1&rel=0`}
                title={`${media.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

