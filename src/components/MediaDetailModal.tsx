import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  X, 
  Play, 
  Check, 
  Star, 
  Download, 
  Share2, 
  Heart, 
  Bookmark,
  ThumbsUp,
  MessageSquare, 
  Send,
  Layers,
  Sparkles,
  Clock, 
  Flame,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { MediaItem, Season, UserReview, UserProfile, Episode } from '../types/movie';
import { getReviewsForMedia, addReview, addDownload } from '../services/storageService';
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
  const [isOverviewExpanded, setIsOverviewExpanded] = useState<boolean>(false);
  const [showReviewsSection, setShowReviewsSection] = useState<boolean>(false);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [newRating, setNewRating] = useState<number>(10);
  const [newComment, setNewComment] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Fetch Season Episodes helper
  const loadEpisodesForSeason = useCallback(async (seasonNum: number, currentMedia: MediaItem) => {
    const seasonData = currentMedia.seasons?.find(s => s.seasonNumber === seasonNum);
    if (seasonData && seasonData.episodes && seasonData.episodes.length > 0) return;

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
        return { ...prev, seasons };
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
    setActionFeedback('Review submitted successfully!');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleDownloadMedia = () => {
    addDownload({
      mediaId: media.id,
      mediaType: media.type,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      sizeMB: media.downloadSizeMB || 2200
    });
    setActionFeedback(`Added "${media.title}" to Downloads`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const activeSeasonData: Season | undefined = media.seasons?.find(s => s.seasonNumber === selectedSeason) || media.seasons?.[0];

  // Related movies
  const relatedMedia = allCatalog
    .filter(m => m.id !== media.id && (m.genres.some(g => media.genres.includes(g)) || m.type === media.type))
    .slice(0, 8);

  const formatRuntime = (mins?: number) => {
    if (!mins) return '1:45:00';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, '0')}:00`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* Mobile-First Full Viewport Glass Container */}
      <div className="relative w-full h-full sm:max-w-2xl sm:h-[92vh] sm:rounded-[32px] bg-[#0c0e17]/95 border border-white/15 overflow-y-auto no-scrollbar flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        
        {/* Floating Action Feedback Toast */}
        {actionFeedback && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl glass-dock text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 border-rose-500/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* 1. Backdrop Poster Area with Floating Glass Controls */}
        <div className="relative w-full h-76 sm:h-84 shrink-0 bg-slate-950">
          <img
            src={media.backdropPath || media.posterPath}
            alt={media.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {/* Frosted Liquid Glass Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-[#0c0e17]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />

          {/* Top Left: Glass Back Button (ArrowLeft) */}
          <button
            onClick={onClose}
            aria-label="Back"
            className="absolute top-4 left-4 z-20 w-11 h-11 rounded-2xl glass-button text-white flex items-center justify-center transition-all shadow-xl active:scale-90 focus:outline-none"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Top Right: Glass Actions (Share & Close) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: media.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  setActionFeedback('Link copied to clipboard 📋');
                  setTimeout(() => setActionFeedback(null), 2500);
                }
              }}
              className="w-11 h-11 rounded-2xl glass-button text-white flex items-center justify-center transition-all shadow-xl active:scale-90"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl glass-button text-white hover:text-rose-400 flex items-center justify-center transition-all shadow-xl active:scale-90"
              aria-label="Close"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 2. Glass Content Details Section */}
        <div className="px-5 sm:px-8 -mt-10 relative z-10 space-y-5 pb-10 flex-1">
          
          {/* Title & Quality Badge */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {media.cleanTitle || media.title}
            </h1>

            <span className="shrink-0 px-3 py-1.5 rounded-xl glass-liquid text-[11px] font-extrabold font-mono-data text-amber-300 shadow-md">
              4K Ultra
            </span>
          </div>

          {/* Metadata Row: 2024 · Drama · ⏱ 1:41:00 · ⭐ 8.5 Ratings */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-300 font-semibold">
            <span>{media.releaseDate ? media.releaseDate.slice(0, 4) : '2024'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-rose-400">{media.genres[0] || 'Drama'}</span>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRuntime(media.runtime)}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{media.voteAverage.toFixed(1)} Ratings</span>
            </div>
          </div>

          {/* 3. Big High-Gloss Primary CTA: "Play Free Now" */}
          <button
            onClick={() => onPlay(media, selectedSeason, 1)}
            className="w-full py-4 px-6 rounded-2xl glass-primary-btn text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-98 focus:outline-none"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play Free Now</span>
          </button>

          {/* 4. Story Synopsis with Smooth Toggle */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1.5 glass-liquid p-4 rounded-2xl">
            <p className={isOverviewExpanded ? '' : 'line-clamp-3'}>
              {media.overview || `Experience ${media.title} in high definition multi-source video streaming with Dolby audio.`}
            </p>
            {media.overview && media.overview.length > 120 && (
              <button
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors inline-block pt-1"
              >
                {isOverviewExpanded ? 'Show Less' : '...Read More'}
              </button>
            )}
          </div>

          {/* 5. Glass 4-Action Dock: [ 👍 Like ] | [ 💬 Review ] | [ 🔖 Save ] | [ ⬇ Download ] */}
          <div className="grid grid-cols-4 gap-2 p-1.5 rounded-2xl glass-liquid">
            
            {/* Action 1: Like */}
            <button
              onClick={() => {
                onToggleFavorite(media.id);
                setActionFeedback(isFavorite ? 'Removed from favorites' : 'Liked! Added to favorites 👍');
                setTimeout(() => setActionFeedback(null), 2500);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95 ${
                isFavorite 
                  ? 'text-rose-500 bg-rose-500/15' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              <span className="text-[11px] font-bold">{isFavorite ? 'Liked' : 'Like'}</span>
            </button>

            {/* Action 2: Review */}
            <button
              onClick={() => setShowReviewsSection(!showReviewsSection)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[11px] font-bold">Review</span>
            </button>

            {/* Action 3: Save / Watchlist */}
            <button
              onClick={() => {
                onToggleWatchlist(media.id);
                setActionFeedback(isInWatchlist ? 'Removed from Watchlist' : 'Saved to Watchlist 🔖');
                setTimeout(() => setActionFeedback(null), 2500);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95 ${
                isInWatchlist 
                  ? 'text-rose-400 bg-rose-500/15' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span className="text-[11px] font-bold">{isInWatchlist ? 'Saved' : 'Save'}</span>
            </button>

            {/* Action 4: Download */}
            <button
              onClick={handleDownloadMedia}
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="text-[11px] font-bold">Download</span>
            </button>
          </div>

          {/* Reviews Interactive Panel */}
          {showReviewsSection && (
            <div className="p-4 rounded-2xl glass-liquid space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">User Reviews</h4>
                <button
                  onClick={() => setShowReviewsSection(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">Rating:</span>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="glass-dock text-white rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n} className="bg-slate-900 text-white">{n} / 10 ⭐</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write your review..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 glass-dock rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl glass-primary-btn text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {reviews.length > 0 ? (
                  reviews.map(r => (
                    <div key={r.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{r.userName}</span>
                        <span className="text-amber-400 font-mono font-bold">⭐ {r.rating}/10</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No reviews yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>
          )}

          {/* TV Episodes List (if TV Show) */}
          {media.type === 'tv' && media.seasons && media.seasons.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">Episodes</h3>
                
                {/* Season Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {media.seasons.map(s => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => handleSeasonChange(s.seasonNumber)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                        selectedSeason === s.seasonNumber
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'glass-button text-slate-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episodes Row */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {loadingEpisodes ? (
                  <div className="space-y-2 py-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-2xl glass-liquid animate-pulse flex items-center gap-3">
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
                    <div
                      key={ep.id}
                      onClick={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                      className="p-2.5 rounded-2xl glass-liquid hover:border-rose-500/40 cursor-pointer flex items-center gap-3.5 transition-all group active:scale-98"
                    >
                      <div className="w-18 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                        <img
                          src={ep.stillPath || media.backdropPath}
                          alt={ep.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-rose-600/40 flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono-data font-bold text-rose-400">
                            E{ep.episodeNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono-data">{ep.runtime || 45}m</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-rose-300 transition-colors">
                          {ep.name}
                        </h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Episodes loading...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. "Related" Section */}
          {relatedMedia.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Related
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  View All
                </span>
              </div>

              {/* Horizontal Related Posters */}
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {relatedMedia.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onOpenAnotherDetails(rel)}
                    className="w-28 xs:w-32 shrink-0 group cursor-pointer space-y-1.5 active:scale-95 transition-transform"
                  >
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-liquid p-0.5 shadow-lg">
                      <img
                        src={rel.posterPath}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate px-0.5 group-hover:text-rose-400 transition-colors">
                      {rel.cleanTitle || rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
