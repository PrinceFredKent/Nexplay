export type MediaType = 'movie' | 'tv';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview: string;
  stillPath: string;
  runtime: number; // in minutes
  voteAverage: number;
  airDate: string;
  directStreamUrl?: string;
  downloadSizeMB?: number;
}

export interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  overview: string;
  posterPath: string;
  episodes: Episode[];
}

export interface StreamSource {
  id: string;
  name: string;
  quality: '4K HDR' | '1080p FHD' | '720p HD';
  type: 'embed' | 'direct' | 'hls';
  serverName: string;
  isFast: boolean;
  badge?: string;
  getUrl: (tmdbId: number, type: MediaType, season?: number, episode?: number, imdbId?: string) => string;
}

export interface MediaItem {
  id: number;
  tmdbId: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  overview: string;
  tagline?: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genres: string[];
  runtime?: number; // minutes
  seasonsCount?: number;
  episodesCount?: number;
  seasons?: Season[];
  cast: CastMember[];
  director?: string;
  trailerKey?: string;
  trailerUrl?: string;
  directStreamUrl?: string;
  downloadSizeMB?: number;
  contentRating: string; // 'PG-13', 'R', 'TV-MA', 'PG', etc.
  spokenLanguages: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  isOriginal?: boolean;
  status?: string;
}

export interface FilterOptions {
  query: string;
  type: 'all' | 'movie' | 'tv';
  genre: string;
  year: string;
  ratingMin: number;
  sortBy: 'popular' | 'rating' | 'latest' | 'trending' | 'title';
  provider: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin?: string;
  themeColor: string;
  joinedDate: string;
}

export interface WatchHistoryItem {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string;
  backdropPath: string;
  season?: number;
  episode?: number;
  progress: number; // percentage (0 - 100)
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastWatchedAt: number;
}

export interface OfflineDownload {
  id: string;
  mediaId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string;
  backdropPath: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  sizeMB: number;
  downloadedAt: number;
  status: 'downloading' | 'completed' | 'paused' | 'error';
  progress: number;
  directStreamUrl?: string;
  localBlobUrl?: string;
}

export interface UserReview {
  id: string;
  mediaId: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 - 10
  comment: string;
  createdAt: number;
  likes: number;
}

export interface CustomCollection {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  mediaIds: number[];
  createdAt: number;
  updatedAt: number;
}
