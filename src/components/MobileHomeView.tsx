import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Play, 
  ChevronRight, 
  Star, 
  Clock, 
  Flame, 
  Sparkles,
  Heart,
  Plus,
  Compass,
  TrendingUp,
  Tv,
  Film,
  SlidersHorizontal,
  X,
  Crown
} from 'lucide-react';
import { MediaItem, WatchHistoryItem } from '../types/movie';
import { UserProfileData } from '../services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface MobileHomeViewProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  featuredItems: MediaItem[];
  watchHistory: WatchHistoryItem[];
  trendingItems: MediaItem[];
  catalogItems: MediaItem[];
  onPlayMedia: (media: MediaItem, season?: number, episode?: number, initialTime?: number) => void;
  onOpenDetails: (media: MediaItem) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  onOpenAutoFill?: () => void;
  onViewAllWatchHistory: () => void;
  watchlistIds: number[];
  onToggleWatchlist: (mediaId: number) => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  currentUser,
  userProfile,
  activeCategory,
  onSelectCategory,
  featuredItems = [],
  watchHistory = [],
  trendingItems = [],
  catalogItems = [],
  onPlayMedia,
  onOpenDetails,
  onOpenNotifications,
  onOpenProfile,
  onOpenSearch,
  onOpenAdmin,
  onOpenAutoFill,
  onViewAllWatchHistory,
  watchlistIds,
  onToggleWatchlist
}) => {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const categories = ['All', 'Movies', 'Drama', 'TV Show', 'Webseries'];

  // User Display Name
  const greetingName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Venkatesh M';

  const heroList = featuredItems.length > 0 ? featuredItems.slice(0, 6) : catalogItems.slice(0, 6);

  // Auto cycle hero carousel gently if user is idle
  useEffect(() => {
    if (heroList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroList.length]);

  // Touch swipe gestures for Hero Carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Next slide
      setActiveHeroIndex((prev) => (prev + 1) % heroList.length);
    } else if (distance < -minSwipeDistance) {
      // Prev slide
      setActiveHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="w-full space-y-6 pb-8 select-none animate-in fade-in duration-300">
      
      {/* 1. Ultra-Modern Glass Header Bar */}
      <div className="flex items-center justify-between pt-2 px-1">
        
        {/* Left: User Avatar + Dynamic Greeting */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group active:scale-98 transition-transform"
        >
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden glass-liquid p-0.5 shadow-lg group-hover:border-rose-500/50 transition-colors">
            <img
              src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={greetingName}
              className="w-full h-full object-cover rounded-[14px]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#08090e]" />
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 tracking-wide">
              Hello <Sparkles className="w-3 h-3 text-rose-400" />
            </span>
            <h1 className="text-base font-extrabold text-white tracking-tight group-hover:text-rose-400 transition-colors">
              {greetingName}
            </h1>
          </div>
        </div>

        {/* Right: Quick Actions (Add Movie + Admin Hub + Search + Notification Bell) */}
        <div className="flex items-center gap-1.5 xs:gap-2">
          {onOpenAutoFill && (
            <button
              onClick={onOpenAutoFill}
              title="Add New Movie with Auto-Fill"
              aria-label="Add Movie"
              className="h-10 px-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/40 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px] hidden xs:inline">Add Movie</span>
            </button>
          )}

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Super Admin Control Hub"
              aria-label="Admin Control Hub"
              className="w-10 h-10 rounded-2xl glass-button text-amber-300 hover:text-amber-200 border-amber-500/40 bg-amber-500/10 flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            </button>
          )}

          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="w-10 h-10 rounded-2xl glass-button text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotifications}
            aria-label="Open Notifications"
            className="w-10 h-10 rounded-2xl glass-button text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 relative shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-[#08090e]" />
          </button>
        </div>
      </div>

      {/* 2. Glass Depth Hero Carousel with Left & Right Peek Cards */}
      {heroList.length > 0 && (
        <div className="space-y-3">
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full overflow-hidden py-1"
          >
            <div className="flex items-center justify-center relative min-h-[185px] xs:min-h-[205px]">
              
              {/* Left Peek Card (Previous) */}
              {heroList.length > 1 && (
                <div 
                  onClick={() => setActiveHeroIndex((activeHeroIndex - 1 + heroList.length) % heroList.length)}
                  className="absolute -left-14 xs:-left-10 w-28 xs:w-32 h-40 xs:h-44 rounded-3xl overflow-hidden opacity-35 blur-[1px] scale-90 cursor-pointer transition-all duration-400 z-0 bg-slate-900 border border-white/10 shadow-xl"
                >
                  <img
                    src={heroList[(activeHeroIndex - 1 + heroList.length) % heroList.length]?.backdropPath || heroList[(activeHeroIndex - 1 + heroList.length) % heroList.length]?.posterPath}
                    alt="Previous"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )}

              {/* Active Centered Hero Glass Card */}
              {(() => {
                const currentHero = heroList[activeHeroIndex] || heroList[0];
                return (
                  <div
                    onClick={() => onOpenDetails(currentHero)}
                    className="relative w-full max-w-[340px] xs:max-w-[380px] h-48 xs:h-52 rounded-[28px] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-white/15 transition-all duration-300 z-10 group active:scale-[0.98] bg-slate-900"
                  >
                    <img
                      src={currentHero.backdropPath || currentHero.posterPath}
                      alt={currentHero.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Multi-Layered Frosted Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
                    
                    {/* Top Badges: 4K HDR & Genre */}
                    <div className="absolute top-3 inset-x-3.5 z-10 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl glass-liquid text-[10px] font-extrabold text-amber-300 flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4K Ultra HD</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-xl glass-liquid text-[10px] font-bold text-slate-200">
                        ★ {currentHero.voteAverage.toFixed(1)}
                      </span>
                    </div>

                    {/* Bottom Title & Play CTA */}
                    <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-end justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 drop-shadow">
                          {currentHero.type === 'tv' ? 'TV Series' : 'Blockbuster'} · {currentHero.genres[0] || 'Drama'}
                        </span>
                        <h3 className="text-base xs:text-lg font-black text-white tracking-tight truncate drop-shadow-lg leading-tight">
                          {currentHero.cleanTitle || currentHero.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayMedia(currentHero);
                        }}
                        className="w-11 h-11 rounded-2xl glass-primary-btn text-white flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-xl"
                        aria-label="Play Now"
                      >
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Right Peek Card (Next) */}
              {heroList.length > 1 && (
                <div 
                  onClick={() => setActiveHeroIndex((activeHeroIndex + 1) % heroList.length)}
                  className="absolute -right-14 xs:-right-10 w-28 xs:w-32 h-40 xs:h-44 rounded-3xl overflow-hidden opacity-35 blur-[1px] scale-90 cursor-pointer transition-all duration-400 z-0 bg-slate-900 border border-white/10 shadow-xl"
                >
                  <img
                    src={heroList[(activeHeroIndex + 1) % heroList.length]?.backdropPath || heroList[(activeHeroIndex + 1) % heroList.length]?.posterPath}
                    alt="Next"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              )}

            </div>
          </div>

          {/* Frosted Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {heroList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 ${
                  activeHeroIndex === idx
                    ? 'w-6 h-1.5 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full shadow-md shadow-rose-500/50'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40 rounded-full'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Glass Segmented Category Tabs */}
      <div className="p-1 rounded-2xl glass-liquid flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat || (activeCategory === 'All' && cat === 'All');
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 text-center focus:outline-none ${
                isActive 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Glass "Continue Watching" Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Continue Watching
            </h2>
          </div>

          <button
            onClick={onViewAllWatchHistory}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Glass Cards */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-2 px-1">
          {(watchHistory.length > 0 ? watchHistory : [
            {
              mediaId: catalogItems[0]?.id || 1,
              mediaType: 'movie' as const,
              title: catalogItems[0]?.title || 'Avengers Assemble',
              posterPath: catalogItems[0]?.posterPath || '',
              backdropPath: catalogItems[0]?.backdropPath || '',
              progress: 65,
              currentTime: 4800,
              duration: 7200,
              lastWatchedAt: Date.now()
            },
            {
              mediaId: catalogItems[1]?.id || 2,
              mediaType: 'tv' as const,
              title: catalogItems[1]?.title || 'Parking',
              posterPath: catalogItems[1]?.posterPath || '',
              backdropPath: catalogItems[1]?.backdropPath || '',
              progress: 35,
              currentTime: 1200,
              duration: 3600,
              lastWatchedAt: Date.now()
            }
          ]).map((item) => {
            const matchedMedia = catalogItems.find(m => m.id === item.mediaId) || catalogItems[0];
            const progress = item.progress || 45;

            return (
              <div
                key={item.mediaId}
                onClick={() => matchedMedia && onPlayMedia(matchedMedia, item.season, item.episode, item.currentTime)}
                className="w-48 xs:w-56 shrink-0 group cursor-pointer space-y-2 active:scale-98 transition-transform"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden glass-liquid p-0.5 shadow-xl">
                  <img
                    src={item.backdropPath || item.posterPath || matchedMedia?.backdropPath}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent rounded-[14px]" />

                  {/* Play Glass Button in Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-2xl glass-button text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-600 transition-all">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Progress Bar & Timestamp Footer */}
                  <div className="absolute bottom-2 inset-x-2 px-2.5 py-1.5 rounded-xl glass-dock flex items-center justify-between gap-2.5">
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full shadow-sm" 
                        style={{ width: `${Math.max(10, Math.min(100, progress))}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono-data font-bold text-slate-200 shrink-0">
                      {item.currentTime ? `${Math.floor(item.currentTime / 60)}m` : '1:21:19'}
                    </span>
                  </div>
                </div>

                <div className="px-1 flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono-data text-slate-400 shrink-0">
                    {item.season ? `S${item.season}:E${item.episode}` : 'Movie'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Glass "Top Trending" Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Top Trending
            </h2>
          </div>

          <button
            onClick={onOpenSearch}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Poster Cards */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-2 px-1">
          {(trendingItems.length > 0 ? trendingItems : catalogItems.slice(0, 10)).map((media) => {
            const isSaved = watchlistIds.includes(media.id);

            return (
              <div
                key={media.id}
                onClick={() => onOpenDetails(media)}
                className="w-30 xs:w-34 shrink-0 group cursor-pointer space-y-2 active:scale-98 transition-transform"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-liquid p-0.5 shadow-xl">
                  <img
                    src={media.posterPath}
                    alt={media.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 rounded-[14px]" />

                  {/* Rating Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg glass-dock text-[10px] font-bold text-amber-300 shadow">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{media.voteAverage.toFixed(1)}</span>
                  </div>

                  {/* Watchlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(media.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-xl glass-dock text-white transition-all shadow-md active:scale-90"
                    aria-label="Save to Watchlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>

                  {/* Quality on Bottom */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[9px] font-mono-data font-bold text-rose-300 uppercase tracking-wider block truncate">
                      {media.genres[0] || 'HD 4K'}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white truncate px-1 group-hover:text-rose-400 transition-colors">
                  {media.cleanTitle || media.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
