import { CustomCollection, MediaItem, OfflineDownload, UserProfile, UserReview, WatchHistoryItem } from '../types/movie';
import { DEFAULT_NETFLIX_AVATAR } from './netflixAvatars';

const STORAGE_KEYS = {
  PROFILES: 'nexplay_user_profiles',
  ACTIVE_PROFILE: 'nexplay_active_profile_id',
  WATCHLIST: 'nexplay_watchlist_',
  FAVORITES: 'nexplay_favorites_',
  HISTORY: 'nexplay_watch_history_',
  DOWNLOADS: 'nexplay_offline_downloads',
  COLLECTIONS: 'nexplay_custom_collections_',
  REVIEWS: 'nexplay_user_reviews',
  DELETED_MOVIES: 'nexplay_deleted_movie_ids'
};

// Default clean guest profile
export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-main',
    name: 'Primary Profile',
    avatar: DEFAULT_NETFLIX_AVATAR,
    isKids: false,
    themeColor: '#e11d48',
    joinedDate: new Date().toISOString().split('T')[0]
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

// Watchlist operations (Clean: zero mock data)
export function getWatchlist(profileId: string): number[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WATCHLIST}${profileId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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

// Favorites operations (Clean: zero mock data)
export function getFavorites(profileId: string): number[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.FAVORITES}${profileId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(profileId: string, mediaId: number): boolean {
  const current = getFavorites(profileId);
  const exists = current.includes(mediaId);
  const updated = exists ? current.filter(id => id !== mediaId) : [mediaId, ...current];
  localStorage.setItem(`${STORAGE_KEYS.FAVORITES}${profileId}`, JSON.stringify(updated));
  return !exists;
}

// Continue watching history (Clean: zero mock data)
export function getWatchHistory(profileId: string): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.HISTORY}${profileId}`);
    return raw ? JSON.parse(raw) : [];
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

// Offline Downloads Manager (Clean: zero mock downloads)
export function getOfflineDownloads(): OfflineDownload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    return raw ? JSON.parse(raw) : [];
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

// Custom collections (Clean: zero mock data)
export function getCustomCollections(profileId: string): CustomCollection[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.COLLECTIONS}${profileId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomCollections(profileId: string, collections: CustomCollection[]): void {
  localStorage.setItem(`${STORAGE_KEYS.COLLECTIONS}${profileId}`, JSON.stringify(collections));
}

// User Reviews (Clean: zero mock reviews)
export function getReviewsForMedia(mediaId: number): UserReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const all: UserReview[] = raw ? JSON.parse(raw) : [];
    return all.filter(r => r.mediaId === mediaId);
  } catch {
    return [];
  }
}

export function addReview(review: Omit<UserReview, 'id' | 'createdAt' | 'likes'>): UserReview {
  const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  const all: UserReview[] = raw ? JSON.parse(raw) : [];
  const newRev: UserReview = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: Date.now(),
    likes: 0
  };
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([newRev, ...all]));
  return newRev;
}

// Deleted Movie IDs Tracking
export function getLocalDeletedMovieIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_MOVIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDeletedMovieId(id: number): void {
  try {
    const current = getLocalDeletedMovieIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(STORAGE_KEYS.DELETED_MOVIES, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Error saving deleted movie ID to localStorage', e);
  }
}

export function removeLocalDeletedMovieId(id: number): void {
  try {
    const current = getLocalDeletedMovieIds().filter(i => i !== id);
    localStorage.setItem(STORAGE_KEYS.DELETED_MOVIES, JSON.stringify(current));
  } catch (e) {
    console.error('Error removing deleted movie ID from localStorage', e);
  }
}

// Cached Catalog storage for instantaneous render
const CACHED_CATALOG_KEY = 'nexplay_cached_catalog_list';

export function getCachedCatalog(): MediaItem[] {
  try {
    const raw = localStorage.getItem(CACHED_CATALOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedCatalog(items: MediaItem[]): void {
  try {
    localStorage.setItem(CACHED_CATALOG_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error caching catalog locally', e);
  }
}

// Complete local purge utility to guarantee pristine state
export function purgeAllLocalData(): void {
  try {
    // Purge old lumina_* and new nexplay_* storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lumina_') || key.startsWith('nexplay_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error purging local data', e);
  }
}
