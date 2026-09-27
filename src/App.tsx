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
  getWatchHistory as getLocalWatchHistory
} from './services/storageService';
import { 
  auth, 
  db, 
  syncUserProfile, 
  UserProfileData,
  getFirestoreWatchlist,
  toggleFirestoreWatchlist,
  getFirestoreFavorites,
  toggleFirestoreFavorites,
  getFirestoreWatchHistory,
  saveFirestoreWatchHistory,
  getFirestoreCatalog,
  saveFirestoreCatalogItem
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
import { useTvRemoteNavigation } from './hooks/useTvRemoteNavigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineBanner } from './components/OfflineBanner';
import heroCyberpunk from './assets/images/hero_cyberpunk_neon_1790416909174.jpg';
import { DEFAULT_NETFLIX_AVATAR } from './services/netflixAvatars';

export default function App() {
  // Navigation & Category state
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('Movies');

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
  const [customCatalog, setCustomCatalog] = useState<MediaItem[]>([]);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Smart TV Remote & Keyboard D-Pad Navigation Handler
  useTvRemoteNavigation({
    onBack: () => {
      if (playingMedia) {
        setPlayingMedia(null);
      } else if (detailMedia) {
        setDetailMedia(null);
      } else if (optionsMedia) {
        setOptionsMedia(null);
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
      // User document
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfileData);
      } else {
        await syncUserProfile(user);
        const freshSnap = await getDoc(userDocRef);
        if (freshSnap.exists()) setUserProfile(freshSnap.data() as UserProfileData);
      }

      // Sync user data collections
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
        // Fallback to local guest data
        setWatchlistIds(getLocalWatchlist('guest'));
        setFavoriteIds(getLocalFavorites('guest'));
        setWatchHistory(getLocalWatchHistory('guest'));
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // Refresh profile handler
  const refreshProfile = useCallback(() => {
    if (currentUser) {
      loadUserData(currentUser);
    }
  }, [currentUser, loadUserData]);

  // Load Firestore Catalog on mount
  useEffect(() => {
    getFirestoreCatalog().then(items => {
      if (items && items.length > 0) {
        items.forEach(i => {
          if (!MASTER_MEDIA_CATALOG.some(m => m.id === i.id)) {
            MASTER_MEDIA_CATALOG.push(i);
          }
        });
        setCustomCatalog(items);
      }
    });
  }, []);

  const activeCatalog = [...MASTER_MEDIA_CATALOG, ...customCatalog.filter(c => !MASTER_MEDIA_CATALOG.some(m => m.id === c.id))];

  // Handlers for Watchlist & Favorites
  const handleToggleWatchlist = async (mediaId: number) => {
    const media = activeCatalog.find(m => m.id === mediaId);
    if (!media) return;

    if (!currentUser) {
      setIsProfileModalOpen(true);
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
      setIsProfileModalOpen(true);
      return;
    }

    await toggleFirestoreFavorites(currentUser.uid, media);
    const updated = await getFirestoreFavorites(currentUser.uid);
    setFavoriteIds(updated);
  };

  const handlePlayMedia = (media: MediaItem, season?: number, episode?: number, initialTime?: number) => {
    setPlayingMedia({ media, season, episode, initialTime });

    // Save watch progress to history
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

  // Filter catalog based on category tab & Kids mode
  const catalog = activeCatalog.filter(item => {
    if (userProfile?.isKids) {
      return item.contentRating === 'PG' || item.contentRating === 'G' || item.contentRating === 'TV-PG';
    }
    if (activeCategory === 'Movies') return item.type === 'movie';
    if (activeCategory === 'TV Series') return item.type === 'tv';
    if (activeCategory === 'Animation') return item.genres.includes('Animation') || item.genres.includes('Anime');
    if (activeCategory === 'Mistery') return item.genres.includes('Mistery') || item.genres.includes('Mystery') || item.genres.includes('Sci-Fi');
    return true;
  });

  // Featured Hero item
  const featuredTrending = activeCatalog.filter(m => m.isFeatured || m.isTrending);

  // Recommendations
  const recommendations = activeCatalog.slice(0, 8);

  return (
    <div className="min-h-screen w-full bg-[#0a0c12] text-slate-100 relative overflow-x-hidden selection:bg-rose-600 selection:text-white">
      
      {/* Ambient Blurred Background Scene */}
      <div className="fixed inset-0 z-0 opacity-40 blur-3xl scale-105 pointer-events-none overflow-hidden">
        <img
          src={heroCyberpunk}
          alt="Ambient Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0c12]/75" />
      </div>

      {/* Floating Left Sidebar Navigation Rail */}
      <NexplaySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAutoFill={() => setIsAutoFillOpen(true)}
        watchlistCount={watchlistIds.length}
        downloadsCount={downloads.length}
        currentUser={currentUser}
      />

      {/* Main Workspace Layout (Fullscreen Responsive Layout) */}
      <div className="relative z-10 w-full px-3 sm:px-6 md:pl-24 md:pr-8 py-4 pb-24 md:pb-8 space-y-5 min-h-screen flex flex-col">
        
        {/* PWA In-App Install Banner & Guided Sheet */}
        <PWAInstallBanner />

        {/* Offline Connectivity Toast */}
        <OfflineBanner />

        {/* Top Header Bar */}
        <NexplayHeader
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            if (activeTab !== 'home') setActiveTab('home');
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSearchOpen(true)}
          currentUser={currentUser}
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAutoFill={() => setIsAutoFillOpen(true)}
        />

        {/* Download Toast Notification */}
        {downloadToast && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-semibold text-emerald-300 flex items-center justify-between animate-in fade-in duration-150">
            <span>{downloadToast}</span>
            <button onClick={() => setActiveTab('downloads')} className="text-emerald-400 hover:underline">
              View Downloads →
            </button>
          </div>
        )}

        {/* MAIN VIEWPORT BODY */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN: New Trailer Feed + Continue Watching (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
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

            {/* RIGHT COLUMN: Featured Hero Banner + "You might like" Grid (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Featured Hero Banner */}
              <NexplayFeaturedHero
                items={featuredTrending}
                onPlay={handlePlayMedia}
                onOpenDetails={(m) => setDetailMedia(m)}
                onOpenOptions={(m) => setOptionsMedia(m)}
                onDownload={handleDownload}
              />

              {/* Recommendations Grid */}
              <NexplayRecommendationGrid
                items={recommendations.length > 0 ? recommendations : catalog.slice(0, 4)}
                onPlay={handlePlayMedia}
                onOpenDetails={(m) => setDetailMedia(m)}
                onOpenOptions={(m) => setOptionsMedia(m)}
                onSeeAll={() => setIsSearchOpen(true)}
              />

            </div>

          </div>
        )}

        {/* WATCHLIST VIEW */}
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

        {/* MOVIES / TV TAB DIRECT LISTINGS */}
        {(activeTab === 'movies' || activeTab === 'tv') && (
          <div className="space-y-4 py-2">
            <h2 className="text-xl font-bold text-white font-display">
              {activeTab === 'movies' ? 'Blockbuster Movies' : 'TV Series & Shows'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {catalog.map(item => (
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

      {/* Options Menu Modal */}
      <OptionsMenuModal
        media={optionsMedia}
        onClose={() => setOptionsMedia(null)}
        onPlay={handlePlayMedia}
        onOpenDetails={(m) => setDetailMedia(m)}
        isInWatchlist={optionsMedia ? watchlistIds.includes(optionsMedia.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        isFavorite={optionsMedia ? favoriteIds.includes(optionsMedia.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
      />

      {/* Media Detail Modal */}
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
            name: userProfile?.displayName || currentUser?.displayName || 'Nexplay Guest',
            avatar: userProfile?.photoURL || currentUser?.photoURL || DEFAULT_NETFLIX_AVATAR,
            isKids: userProfile?.isKids || false,
            themeColor: '#e11d48',
            joinedDate: userProfile?.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)
          }}
          allCatalog={MASTER_MEDIA_CATALOG}
          onOpenAnotherDetails={(m) => setDetailMedia(m)}
        />
      )}

      {/* Search & Advanced Filters Modal */}
      <SearchFilterModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlay={(m) => {
          setIsSearchOpen(false);
          handlePlayMedia(m);
        }}
        onOpenDetails={(m) => {
          setIsSearchOpen(false);
          setDetailMedia(m);
        }}
        watchlistIds={watchlistIds}
        onToggleWatchlist={handleToggleWatchlist}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Firebase Authentication & Profile Modal */}
      <AuthProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onProfileUpdated={refreshProfile}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenAutoFill={() => setIsAutoFillOpen(true)}
      />

      {/* Smart Movie Auto-Fill Importer Modal */}
      <SmartAutoFillModal
        isOpen={isAutoFillOpen}
        onClose={() => setIsAutoFillOpen(false)}
        onAddMedia={(newMedia) => {
          saveFirestoreCatalogItem(newMedia);
          if (!MASTER_MEDIA_CATALOG.some(m => m.id === newMedia.id)) {
            MASTER_MEDIA_CATALOG.unshift(newMedia);
          }
          setCustomCatalog(prev => [newMedia, ...prev.filter(p => p.id !== newMedia.id)]);
        }}
        onSelectMediaToPlay={(media) => {
          handlePlayMedia(media);
        }}
      />

      {/* Super Admin Control Center Modal (Exclusive to princefredkent@gmail.com) */}
      <AdminControlModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUserEmail={currentUser?.email || null}
        onOpenAutoFill={() => setIsAutoFillOpen(true)}
        catalogItems={activeCatalog}
        onRemoveCatalogItem={(id) => {
          const idx = MASTER_MEDIA_CATALOG.findIndex(m => m.id === id);
          if (idx !== -1) {
            MASTER_MEDIA_CATALOG.splice(idx, 1);
          }
          setCustomCatalog(prev => prev.filter(m => m.id !== id));
        }}
        onToggleFeatureItem={(id) => {
          const item = activeCatalog.find(m => m.id === id);
          if (item) {
            item.isFeatured = !item.isFeatured;
            saveFirestoreCatalogItem(item);
            setCustomCatalog([...activeCatalog]);
          }
        }}
      />

    </div>
  );
}
