/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  MediaItem, 
  WatchHistoryItem, 
  OfflineDownload 
} from './types/movie';
import { MASTER_MEDIA_CATALOG } from './services/catalogService';
import { 
  getOfflineDownloads,
  addDownload,
  getWatchlist as getLocalWatchlist,
  getFavorites as getLocalFavorites,
  getWatchHistory as getLocalWatchHistory,
  getLocalDeletedMovieIds,
  saveLocalDeletedMovieId,
  removeLocalDeletedMovieId,
  purgeAllLocalData,
  getCachedCatalog,
  saveCachedCatalog
} from './services/storageService';
import { 
  auth, 
  db, 
  syncUserProfile, 
  UserProfileData,
  isSuperAdminEmail,
  getFirestoreWatchlist,
  toggleFirestoreWatchlist,
  getFirestoreFavorites,
  toggleFirestoreFavorites,
  getFirestoreWatchHistory,
  saveFirestoreWatchHistory,
  getFirestoreCatalog,
  subscribeToFirestoreCatalog,
  saveFirestoreCatalogItem,
  deleteFirestoreCatalogItem,
  getFirestoreDeletedMovieIds,
  subscribeToFirestoreDeletedMovieIds,
  recordFirestoreDeletedMovieId,
  restoreFirestoreDeletedMovie
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { NexplaySidebar } from './components/NexplaySidebar';
import { NexplayHeader } from './components/NexplayHeader';
import { NexplayNewTrailersFeed } from './components/NexplayNewTrailersFeed';
import { NexplayContinueWatching } from './components/NexplayContinueWatching';
import { NexplayFeaturedHero } from './components/NexplayFeaturedHero';
import { NexplayRecommendationGrid } from './components/NexplayRecommendationGrid';
import { OptionsMenuModal } from './components/OptionsMenuModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MediaDetailModal } from './components/MediaDetailModal';
import { SearchFilterModal } from './components/SearchFilterModal';
import { DownloadsView } from './components/DownloadsView';
import { WatchlistView } from './components/WatchlistView';
import { CollectionsView } from './components/CollectionsView';
import { AuthProfileModal } from './components/AuthProfileModal';
import { SmartAutoFillModal } from './components/SmartAutoFillModal';
import { AdminControlModal } from './components/AdminControlModal';
import { NotificationsModal } from './components/NotificationsModal';
import { MobileHomeView } from './components/MobileHomeView';
import { useTvRemoteNavigation } from './hooks/useTvRemoteNavigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineBanner } from './components/OfflineBanner';
import heroCyberpunk from './assets/images/hero_cyberpunk_neon_1790416909174.jpg';
import { DEFAULT_NETFLIX_AVATAR } from './services/netflixAvatars';

export default function App() {
  // Navigation & Category state
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User media interaction states (synced with Firestore when logged in)
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [downloads, setDownloads] = useState<OfflineDownload[]>(() => getOfflineDownloads());

  // Modals state
  const [playingMedia, setPlayingMedia] = useState<{ media: MediaItem; season?: number; episode?: number; initialTime?: number } | null>(null);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [optionsMedia, setOptionsMedia] = useState<MediaItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAutoFillOpen, setIsAutoFillOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [customCatalog, setCustomCatalog] = useState<MediaItem[]>(() => getCachedCatalog());
  const [deletedMovieIds, setDeletedMovieIds] = useState<number[]>(() => getLocalDeletedMovieIds());
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Strict Admin Gate: Only princefredkent@gmail.com
  const isAdmin = isSuperAdminEmail(currentUser?.email);

  // Universal Route Handlers (/login, /admin)
  const handleOpenLoginRoute = useCallback(() => {
    if (window.location.pathname !== '/login') {
      window.history.pushState(null, '', '/login');
    }
    setIsProfileModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsProfileModalOpen(false);
    if (window.location.pathname === '/login' || window.location.pathname === '/forgot-password') {
      window.history.pushState(null, '', '/');
    }
  }, []);

  const handleOpenAdminRoute = useCallback(() => {
    if (!isAdmin) {
      handleOpenLoginRoute();
      return;
    }
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setIsAdminModalOpen(true);
  }, [isAdmin, handleOpenLoginRoute]);

  const handleCloseAdminModal = useCallback(() => {
    setIsAdminModalOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
  }, []);

  // Universal Route Synchronizer (Listens to /login, /admin, browser back/forward)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#login' || path === '/forgot-password' || hash === '#forgot-password') {
        setIsProfileModalOpen(true);
      } else if (path === '/admin' || hash === '#admin') {
        if (currentUser && !isSuperAdminEmail(currentUser.email)) {
          window.history.pushState(null, '', '/login');
          setIsProfileModalOpen(true);
        } else {
          setIsAdminModalOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [currentUser]);

  // Smart TV Remote & Keyboard D-Pad Navigation Handler
  useTvRemoteNavigation({
    onBack: () => {
      if (playingMedia) {
        setPlayingMedia(null);
      } else if (detailMedia) {
        setDetailMedia(null);
      } else if (optionsMedia) {
        setOptionsMedia(null);
      } else if (isNotificationsOpen) {
        setIsNotificationsOpen(false);
      } else if (isAutoFillOpen) {
        setIsAutoFillOpen(false);
      } else if (isSearchOpen) {
        setIsSearchOpen(false);
      } else if (isAdminModalOpen) {
        setIsAdminModalOpen(false);
      } else if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }
    }
  });

  // Fetch Firestore Profile & Data
  const loadUserData = useCallback(async (user: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfileData);
      } else {
        await syncUserProfile(user);
        const freshSnap = await getDoc(userDocRef);
        if (freshSnap.exists()) setUserProfile(freshSnap.data() as UserProfileData);
      }

      const [wl, fav, hist] = await Promise.all([
        getFirestoreWatchlist(user.uid),
        getFirestoreFavorites(user.uid),
        getFirestoreWatchHistory(user.uid)
      ]);

      setWatchlistIds(wl);
      setFavoriteIds(fav);
      setWatchHistory(hist);
    } catch (err) {
      console.error("Error loading user Firestore data:", err);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user);
      } else {
        setUserProfile(null);
        setWatchlistIds(getLocalWatchlist('guest'));
        setFavoriteIds(getLocalFavorites('guest'));
        setWatchHistory(getLocalWatchHistory('guest'));
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  const refreshProfile = useCallback(() => {
    if (currentUser) {
      loadUserData(currentUser);
    }
  }, [currentUser, loadUserData]);

  // Load Firestore Catalog & Deleted Movies Blacklist on mount
  useEffect(() => {
    // One-time cleanup of legacy demo/mock data
    try {
      const isCleaned = localStorage.getItem('nexplay_clean_v2');
      if (!isCleaned) {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('lumina_') || k.startsWith('nexplay_watchlist_') || k.startsWith('nexplay_favorites_') || k.startsWith('nexplay_watch_history_') || k === 'nexplay_offline_downloads') {
            localStorage.removeItem(k);
          }
        });
        localStorage.setItem('nexplay_clean_v2', 'true');
        setDownloads([]);
        setWatchHistory([]);
        setWatchlistIds([]);
        setFavoriteIds([]);
      }
    } catch (e) {
      console.warn('Local cleanup error', e);
    }

    // 1. Sync remote deleted movie IDs in real-time
    const unsubDeleted = subscribeToFirestoreDeletedMovieIds(remoteDeleted => {
      if (remoteDeleted && remoteDeleted.length > 0) {
        setDeletedMovieIds(prev => {
          const merged = Array.from(new Set([...prev, ...remoteDeleted]));
          merged.forEach(id => saveLocalDeletedMovieId(id));
          return merged;
        });
      }
    });

    // 2. Subscribe to Firestore Catalog in real-time for both guests & logged in users
    const unsubCatalog = subscribeToFirestoreCatalog(items => {
      if (items) {
        setCustomCatalog(items);
        saveCachedCatalog(items);
      }
    });

    return () => {
      unsubDeleted();
      unsubCatalog();
    };
  }, []);

  // Merged active catalog: New custom movies added by admin are prioritized at the top of feeds!
  const activeCatalog = [
    ...customCatalog,
    ...MASTER_MEDIA_CATALOG.filter(m => !customCatalog.some(c => c.id === m.id))
  ].filter(item => !deletedMovieIds.includes(item.id));

  // Handlers for Watchlist & Favorites
  const handleToggleWatchlist = async (mediaId: number) => {
    const media = activeCatalog.find(m => m.id === mediaId);
    if (!media) return;

    if (!currentUser) {
      // Local toggle for guest
      setWatchlistIds(prev => {
        const exists = prev.includes(mediaId);
        return exists ? prev.filter(id => id !== mediaId) : [...prev, mediaId];
      });
      return;
    }

    const added = await toggleFirestoreWatchlist(currentUser.uid, media);
    const updated = await getFirestoreWatchlist(currentUser.uid);
    setWatchlistIds(updated);

    if (added) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#e11d48', '#fb7185', '#ffffff']
      });
    }
  };

  const handleToggleFavorite = async (mediaId: number) => {
    const media = activeCatalog.find(m => m.id === mediaId);
    if (!media) return;

    if (!currentUser) {
      setFavoriteIds(prev => {
        const exists = prev.includes(mediaId);
        return exists ? prev.filter(id => id !== mediaId) : [...prev, mediaId];
      });
      return;
    }

    await toggleFirestoreFavorites(currentUser.uid, media);
    const updated = await getFirestoreFavorites(currentUser.uid);
    setFavoriteIds(updated);
  };

  const handlePlayMedia = (media: MediaItem, season?: number, episode?: number, initialTime?: number) => {
    setPlayingMedia({ media, season, episode, initialTime });

    const historyItem: WatchHistoryItem = {
      mediaId: media.id,
      mediaType: media.type,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      season: season || 1,
      episode: episode || 1,
      progress: initialTime ? Math.round((initialTime / 7200) * 100) : 5,
      currentTime: initialTime || 120,
      duration: 7200,
      lastWatchedAt: Date.now()
    };

    if (currentUser) {
      saveFirestoreWatchHistory(currentUser.uid, historyItem);
      getFirestoreWatchHistory(currentUser.uid).then(setWatchHistory);
    } else {
      setWatchHistory(prev => [historyItem, ...prev.filter(h => h.mediaId !== media.id)]);
    }
  };

  const handleDownload = (media: MediaItem) => {
    addDownload({
      mediaId: media.id,
      mediaType: media.type,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      sizeMB: media.downloadSizeMB || 2200
    });
    setDownloads(getOfflineDownloads());
    setDownloadToast(`Added "${media.title}" to Downloads!`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const refreshDownloads = () => {
    setDownloads(getOfflineDownloads());
  };

  // Filter catalog based on category tab
  const filteredCatalog = activeCatalog.filter(item => {
    if (userProfile?.isKids) {
      return item.contentRating === 'PG' || item.contentRating === 'G' || item.contentRating === 'TV-PG';
    }
    if (activeCategory === 'Movies') return item.type === 'movie';
    if (activeCategory === 'TV Show' || activeCategory === 'TV Series' || activeCategory === 'Webseries') return item.type === 'tv';
    if (activeCategory === 'Drama') return item.genres.includes('Drama');
    if (activeCategory === 'Animation') return item.genres.includes('Animation') || item.genres.includes('Anime');
    return true;
  });

  const featuredTrending = activeCatalog.filter(m => m.isFeatured || m.isTrending);
  const recommendations = activeCatalog.slice(0, 8);

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-slate-100 relative overflow-x-hidden selection:bg-rose-600 selection:text-white">
      
      {/* Ambient Background Scrim */}
      <div className="fixed inset-0 z-0 opacity-35 blur-3xl scale-105 pointer-events-none overflow-hidden">
        <img
          src={heroCyberpunk}
          alt="Ambient Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#090b10]/80" />
      </div>

      {/* Sidebar & Mobile Bottom Navigation Dock */}
      <NexplaySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={handleOpenLoginRoute}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAutoFill={isAdmin ? () => setIsAutoFillOpen(true) : undefined}
        onOpenAdmin={isAdmin ? handleOpenAdminRoute : undefined}
        watchlistCount={watchlistIds.length}
        downloadsCount={downloads.length}
        currentUser={currentUser}
      />

      {/* Main Workspace Layout */}
      <div className="relative z-10 w-full px-3 sm:px-6 md:pl-24 md:pr-8 py-3 pb-24 md:pb-8 space-y-4 min-h-screen flex flex-col">
        
        {/* PWA & Offline Banners */}
        <PWAInstallBanner />
        <OfflineBanner />

        {/* Download Toast Notification */}
        {downloadToast && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-semibold text-emerald-300 flex items-center justify-between animate-in fade-in duration-150">
            <span>{downloadToast}</span>
            <button onClick={() => setActiveTab('downloads')} className="text-emerald-400 hover:underline">
              View Downloads →
            </button>
          </div>
        )}

        {/* HOME VIEW: Mobile-Optimized vs Desktop Layout */}
        {activeTab === 'home' && (
          <>
            {/* 1. MOBILE HOME SCREEN VIEW (Matches Mockup Screen 1) */}
            <div className="block md:hidden">
              <MobileHomeView
                currentUser={currentUser}
                userProfile={userProfile}
                activeCategory={activeCategory}
                onSelectCategory={(cat) => setActiveCategory(cat)}
                featuredItems={featuredTrending.length > 0 ? featuredTrending : activeCatalog.slice(0, 5)}
                watchHistory={watchHistory}
                trendingItems={filteredCatalog.slice(0, 10)}
                catalogItems={activeCatalog}
                onPlayMedia={handlePlayMedia}
                onOpenDetails={(m) => setDetailMedia(m)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenProfile={handleOpenLoginRoute}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenAdmin={isAdmin ? handleOpenAdminRoute : undefined}
                onOpenAutoFill={isAdmin ? () => setIsAutoFillOpen(true) : undefined}
                onViewAllWatchHistory={() => setActiveTab('watchlist')}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </div>

            {/* 2. DESKTOP HOME SCREEN VIEW (Expanded Multi-Column Dashboard) */}
            <div className="hidden md:block space-y-5">
              <NexplayHeader
                activeCategory={activeCategory}
                onSelectCategory={(cat) => setActiveCategory(cat)}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenSettings={() => setIsSearchOpen(true)}
                currentUser={currentUser}
                userProfile={userProfile}
                onOpenProfile={handleOpenLoginRoute}
                onOpenAutoFill={isAdmin ? () => setIsAutoFillOpen(true) : undefined}
                onOpenAdmin={isAdmin ? handleOpenAdminRoute : undefined}
              />

              <div className="grid grid-cols-12 gap-5 items-start">
                
                {/* Left Column: Trailers & Continue Watching */}
                <div className="col-span-4 space-y-4">
                  <NexplayNewTrailersFeed
                    catalogItems={activeCatalog}
                    onPlay={handlePlayMedia}
                    onOpenDetails={(m) => setDetailMedia(m)}
                  />

                  <NexplayContinueWatching
                    history={watchHistory}
                    allCatalog={activeCatalog}
                    onPlay={handlePlayMedia}
                  />
                </div>

                {/* Right Column: Hero Banner + Recommendations */}
                <div className="col-span-8 space-y-5">
                  <NexplayFeaturedHero
                    items={featuredTrending}
                    onPlay={handlePlayMedia}
                    onOpenDetails={(m) => setDetailMedia(m)}
                    onOpenOptions={(m) => setOptionsMedia(m)}
                    onDownload={handleDownload}
                  />

                  <NexplayRecommendationGrid
                    items={recommendations.length > 0 ? recommendations : filteredCatalog.slice(0, 4)}
                    onPlay={handlePlayMedia}
                    onOpenDetails={(m) => setDetailMedia(m)}
                    onOpenOptions={(m) => setOptionsMedia(m)}
                    onSeeAll={() => setIsSearchOpen(true)}
                  />
                </div>

              </div>
            </div>
          </>
        )}

        {/* WATCHLIST / SAVED VIEW */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            allCatalog={activeCatalog}
            onPlay={handlePlayMedia}
            onOpenDetails={(m) => setDetailMedia(m)}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onBrowseCatalog={() => setActiveTab('home')}
          />
        )}

        {/* DOWNLOADS VIEW */}
        {activeTab === 'downloads' && (
          <DownloadsView
            downloads={downloads}
            onRefreshDownloads={refreshDownloads}
            onPlayOffline={(m, s, e) => handlePlayMedia(m, s, e)}
            allCatalog={MASTER_MEDIA_CATALOG}
            onBrowseCatalog={() => setActiveTab('home')}
          />
        )}

        {/* COLLECTIONS VIEW */}
        {activeTab === 'collections' && (
          <CollectionsView
            activeProfileId={currentUser?.uid || 'guest'}
            allCatalog={MASTER_MEDIA_CATALOG}
            onPlay={handlePlayMedia}
            onOpenDetails={(m) => setDetailMedia(m)}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* DIRECT MOVIES / TV TAB */}
        {(activeTab === 'movies' || activeTab === 'tv') && (
          <div className="space-y-4 py-2">
            <h2 className="text-xl font-bold text-white font-display">
              {activeTab === 'movies' ? 'Blockbuster Movies' : 'TV Series & Shows'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  onClick={() => setDetailMedia(item)}
                  className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 p-3 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-slate-800">
                    <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono-data">★ {item.voteAverage} · {item.releaseDate.slice(0, 4)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Cinema Video Player Modal */}
      {playingMedia && (
        <VideoPlayerModal
          media={playingMedia.media}
          initialSeason={playingMedia.season || 1}
          initialEpisode={playingMedia.episode || 1}
          initialTime={playingMedia.initialTime}
          onClose={() => setPlayingMedia(null)}
          activeProfileId={currentUser?.uid || 'guest'}
        />
      )}

      {/* Media Detail Modal (Screen 2 Layout) */}
      {detailMedia && (
        <MediaDetailModal
          media={detailMedia}
          onClose={() => setDetailMedia(null)}
          onPlay={(m, s, e) => {
            setDetailMedia(null);
            handlePlayMedia(m, s, e);
          }}
          isInWatchlist={watchlistIds.includes(detailMedia.id)}
          onToggleWatchlist={handleToggleWatchlist}
          isFavorite={favoriteIds.includes(detailMedia.id)}
          onToggleFavorite={handleToggleFavorite}
          activeProfile={{
            id: currentUser?.uid || 'guest',
            name: userProfile?.displayName || currentUser?.displayName || 'Venkatesh M',
            avatar: userProfile?.photoURL || DEFAULT_NETFLIX_AVATAR,
            isKids: Boolean(userProfile?.isKids),
            themeColor: '#e11d48',
            joinedDate: '2024-01-01'
          }}
          allCatalog={activeCatalog}
          onOpenAnotherDetails={(m) => setDetailMedia(m)}
        />
      )}

      {/* Options Menu Modal */}
      {optionsMedia && (
        <OptionsMenuModal
          media={optionsMedia}
          onClose={() => setOptionsMedia(null)}
          onPlay={(m: MediaItem) => {
            setOptionsMedia(null);
            handlePlayMedia(m);
          }}
          onOpenDetails={(m: MediaItem) => {
            setOptionsMedia(null);
            setDetailMedia(m);
          }}
          isInWatchlist={watchlistIds.includes(optionsMedia.id)}
          onToggleWatchlist={handleToggleWatchlist}
          isFavorite={favoriteIds.includes(optionsMedia.id)}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
        />
      )}

      {/* Search & Filter Modal */}
      {isSearchOpen && (
        <SearchFilterModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onPlay={(m: MediaItem) => {
            setIsSearchOpen(false);
            handlePlayMedia(m);
          }}
          onOpenDetails={(m: MediaItem) => {
            setIsSearchOpen(false);
            setDetailMedia(m);
          }}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onPlayMedia={(m) => {
            setIsNotificationsOpen(false);
            handlePlayMedia(m);
          }}
          featuredMedia={featuredTrending}
        />
      )}

      {/* Auth & Profile Settings Modal (Universal Login Route /login) */}
      {isProfileModalOpen && (
        <AuthProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseLoginModal}
          currentUser={currentUser}
          userProfile={userProfile}
          onProfileUpdated={refreshProfile}
          onOpenAdmin={isAdmin ? handleOpenAdminRoute : undefined}
          onOpenAutoFill={isAdmin ? () => setIsAutoFillOpen(true) : undefined}
        />
      )}

      {/* Smart Auto-Fill Importer Modal (Admin Protected) */}
      {isAutoFillOpen && (
        <SmartAutoFillModal
          isOpen={isAutoFillOpen}
          onClose={() => setIsAutoFillOpen(false)}
          currentUserEmail={currentUser?.email || null}
          onOpenLogin={handleOpenLoginRoute}
          onAddMedia={async (newItem: MediaItem) => {
            if (!isAdmin) {
              console.warn('Unauthorized catalog write blocked: Not admin princefredkent@gmail.com');
              return;
            }

            setIsAutoFillOpen(false);
            // If it was previously in deleted blacklist, restore it
            setDeletedMovieIds(prev => prev.filter(id => id !== newItem.id));
            removeLocalDeletedMovieId(newItem.id);
            await restoreFirestoreDeletedMovie(newItem.id);

            // Add to active catalog
            const existsInMaster = MASTER_MEDIA_CATALOG.some(m => m.id === newItem.id);
            if (!existsInMaster) {
              MASTER_MEDIA_CATALOG.unshift(newItem);
            }
            setCustomCatalog(prev => {
              const next = [newItem, ...prev.filter(m => m.id !== newItem.id)];
              saveCachedCatalog(next);
              return next;
            });

            await saveFirestoreCatalogItem(newItem);

            setDetailMedia(newItem);
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 }
            });
          }}
          onSelectMediaToPlay={(m) => {
            setIsAutoFillOpen(false);
            handlePlayMedia(m);
          }}
        />
      )}

      {/* Admin Panel Modal (Admin Protected) */}
      {isAdminModalOpen && (
        <AdminControlModal
          isOpen={isAdminModalOpen}
          onClose={handleCloseAdminModal}
          currentUserEmail={currentUser?.email || null}
          onOpenAutoFill={isAdmin ? () => setIsAutoFillOpen(true) : undefined}
          catalogItems={activeCatalog}
          onRemoveCatalogItem={async (id: number) => {
            if (!isAdmin) return;
            // 1. Immediately blacklist ID so it NEVER returns
            setDeletedMovieIds(prev => {
              if (prev.includes(id)) return prev;
              const next = [...prev, id];
              saveLocalDeletedMovieId(id);
              return next;
            });

            // 2. Remove from client in-memory state
            const idx = MASTER_MEDIA_CATALOG.findIndex(m => m.id === id);
            if (idx >= 0) MASTER_MEDIA_CATALOG.splice(idx, 1);
            setCustomCatalog(prev => prev.filter(m => m.id !== id));

            // 3. Persist deletion and blacklist in Firestore
            await Promise.allSettled([
              deleteFirestoreCatalogItem(id),
              recordFirestoreDeletedMovieId(id)
            ]);
          }}
          onToggleFeatureItem={(id: number) => {
            const it = MASTER_MEDIA_CATALOG.find(m => m.id === id);
            if (it) it.isFeatured = !it.isFeatured;
          }}
          onPurgeDatabase={async () => {
            // Delete all custom items in Firestore
            for (const item of customCatalog) {
              await deleteFirestoreCatalogItem(item.id);
            }
            setCustomCatalog([]);
            setDeletedMovieIds([]);
            setWatchHistory([]);
            setDownloads([]);
            setWatchlistIds([]);
            setFavoriteIds([]);
            purgeAllLocalData();
          }}
        />
      )}

    </div>
  );
}
