import { CustomCollection, MediaItem, OfflineDownload, UserProfile, UserReview, WatchHistoryItem } from '../types/movie';

const STORAGE_KEYS = {
  PROFILES: 'lumina_user_profiles',
  ACTIVE_PROFILE: 'lumina_active_profile_id',
  WATCHLIST: 'lumina_watchlist_',
  FAVORITES: 'lumina_favorites_',
  HISTORY: 'lumina_watch_history_',
  DOWNLOADS: 'lumina_offline_downloads',
  COLLECTIONS: 'lumina_custom_collections_',
  REVIEWS: 'lumina_user_reviews'
};

// Default starter profiles
export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-main',
    name: 'Alex Mercer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isKids: false,
    themeColor: '#e11d48',
    joinedDate: '2024-01-15'
  },
  {
    id: 'user-scifi',
    name: 'Nova / Sci-Fi Fan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isKids: false,
    themeColor: '#4f46e5',
    joinedDate: '2024-03-10'
  },
  {
    id: 'user-kids',
    name: 'Kids Club',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isKids: true,
    pin: '1234',
    themeColor: '#10b981',
    joinedDate: '2024-05-01'
  }
];

// Profile storage
export function getProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

export function getActiveProfileId(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
  return stored || 'user-main';
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
}

// Watchlist operations
export function getWatchlist(profileId: string): number[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WATCHLIST}${profileId}`);
    return raw ? JSON.parse(raw) : [693134, 94605, 157336]; // Default starter items
  } catch {
    return [693134, 94605];
  }
}

export function toggleWatchlist(profileId: string, mediaId: number): boolean {
  const current = getWatchlist(profileId);
  const exists = current.includes(mediaId);
  const updated = exists ? current.filter(id => id !== mediaId) : [mediaId, ...current];
  localStorage.setItem(`${STORAGE_KEYS.WATCHLIST}${profileId}`, JSON.stringify(updated));
  return !exists;
}

export function isInWatchlist(profileId: string, mediaId: number): boolean {
  return getWatchlist(profileId).includes(mediaId);
}

// Favorites operations
export function getFavorites(profileId: string): number[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FAVORITES}${profileId}`);
    return raw ? JSON.parse(raw) : [157336, 105248];
  } catch {
    return [157336];
  }
}

export function toggleFavorite(profileId: string, mediaId: number): boolean {
  const current = getFavorites(profileId);
  const exists = current.includes(mediaId);
  const updated = exists ? current.filter(id => id !== mediaId) : [mediaId, ...current];
  localStorage.setItem(`${STORAGE_KEYS.FAVORITES}${profileId}`, JSON.stringify(updated));
  return !exists;
}

// Continue watching history
export function getWatchHistory(profileId: string): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.HISTORY}${profileId}`);
    if (raw) return JSON.parse(raw);
    // Starter mock progress
    return [
      {
        mediaId: 693134,
        mediaType: 'movie',
        title: 'Dune: Part Two',
        posterPath: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        progress: 68,
        currentTime: 6780,
        duration: 9960,
        lastWatchedAt: Date.now() - 3600 * 1000 * 2
      },
      {
        mediaId: 94605,
        mediaType: 'tv',
        title: 'Arcane',
        posterPath: 'https://image.tmdb.org/t/p/w780/fqldf2t8ztc9aiwn397rWW2vvg1.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/fqldf2t8ztc9aiwn397rWW2vvg1.jpg',
        season: 1,
        episode: 3,
        progress: 45,
        currentTime: 1200,
        duration: 2640,
        lastWatchedAt: Date.now() - 3600 * 1000 * 12
      }
    ];
  } catch {
    return [];
  }
}

export function saveWatchProgress(profileId: string, item: WatchHistoryItem): void {
  const current = getWatchHistory(profileId).filter(h => h.mediaId !== item.mediaId);
  const updated = [item, ...current].slice(0, 20);
  localStorage.setItem(`${STORAGE_KEYS.HISTORY}${profileId}`, JSON.stringify(updated));
}

export function clearWatchHistoryItem(profileId: string, mediaId: number): void {
  const current = getWatchHistory(profileId).filter(h => h.mediaId !== mediaId);
  localStorage.setItem(`${STORAGE_KEYS.HISTORY}${profileId}`, JSON.stringify(current));
}

// Offline Downloads Manager
export function getOfflineDownloads(): OfflineDownload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    return raw ? JSON.parse(raw) : [
      {
        id: 'dl-dune-2',
        mediaId: 693134,
        mediaType: 'movie',
        title: 'Dune: Part Two',
        posterPath: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        sizeMB: 2840,
        downloadedAt: Date.now() - 86400000,
        status: 'completed',
        progress: 100,
        directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      }
    ];
  } catch {
    return [];
  }
}

export function saveOfflineDownloads(downloads: OfflineDownload[]): void {
  localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
}

export function addDownload(item: Partial<OfflineDownload>): OfflineDownload {
  const downloads = getOfflineDownloads();
  const newDownload: OfflineDownload = {
    id: `dl-${item.mediaId}-${item.seasonNumber || 'm'}-${item.episodeNumber || '0'}-${Date.now()}`,
    mediaId: item.mediaId!,
    mediaType: item.mediaType || 'movie',
    title: item.title || 'Downloaded Media',
    posterPath: item.posterPath || '',
    backdropPath: item.backdropPath || '',
    seasonNumber: item.seasonNumber,
    episodeNumber: item.episodeNumber,
    episodeTitle: item.episodeTitle,
    sizeMB: item.sizeMB || 1200,
    downloadedAt: Date.now(),
    status: 'downloading',
    progress: 15,
    directStreamUrl: item.directStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  const updated = [newDownload, ...downloads];
  saveOfflineDownloads(updated);
  return newDownload;
}

export function removeDownload(id: string): void {
  const downloads = getOfflineDownloads().filter(d => d.id !== id);
  saveOfflineDownloads(downloads);
}

// Custom collections
export function getCustomCollections(profileId: string): CustomCollection[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.COLLECTIONS}${profileId}`);
    return raw ? JSON.parse(raw) : [
      {
        id: 'col-cyberpunk',
        title: 'Cyberpunk & Dystopian Night',
        description: 'Atmospheric neon aesthetics, rogue AI, and high-tech intrigue.',
        mediaIds: [105248, 335984, 693134],
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now()
      },
      {
        id: 'col-mindbending',
        title: 'Mind-Bending Sci-Fi Epics',
        description: 'Reality-questioning masterpieces and cosmic wormhole journeys.',
        mediaIds: [157336, 27205, 872585],
        createdAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now()
      }
    ];
  } catch {
    return [];
  }
}

export function saveCustomCollections(profileId: string, collections: CustomCollection[]): void {
  localStorage.setItem(`${STORAGE_KEYS.COLLECTIONS}${profileId}`, JSON.stringify(collections));
}

// User Reviews
export const DEFAULT_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    mediaId: 693134,
    userId: 'u-1',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 10,
    comment: 'An absolute cinematic masterpiece. The sound design, visuals, and Denis Villeneuve’s direction are unparalleled on modern screens.',
    createdAt: Date.now() - 86400000 * 2,
    likes: 84
  },
  {
    id: 'rev-2',
    mediaId: 94605,
    userId: 'u-2',
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 10,
    comment: 'The animation from Studio Fortiche sets a whole new benchmark. Jinx and Vi’s emotional tragedy is heart-wrenching.',
    createdAt: Date.now() - 86400000 * 4,
    likes: 129
  }
];

export function getReviewsForMedia(mediaId: number): UserReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const all: UserReview[] = raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
    return all.filter(r => r.mediaId === mediaId);
  } catch {
    return DEFAULT_REVIEWS.filter(r => r.mediaId === mediaId);
  }
}

export function addReview(review: Omit<UserReview, 'id' | 'createdAt' | 'likes'>): UserReview {
  const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  const all: UserReview[] = raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
  const newRev: UserReview = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: Date.now(),
    likes: 0
  };
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([newRev, ...all]));
  return newRev;
}
