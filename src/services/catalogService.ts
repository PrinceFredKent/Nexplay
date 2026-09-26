import { MediaItem, MediaType, Season } from '../types/movie';
import heroCyberpunk from '../assets/images/hero_cyberpunk_neon_1790416909174.jpg';
import spaceOdyssey from '../assets/images/space_odyssey_cosmos_1790416922098.jpg';
import fantasyRealm from '../assets/images/fantasy_realm_epic_1790416932938.jpg';

export interface NewTrailerItem {
  id: number;
  title: string;
  duration: string;
  thumbnailPath: string;
  trailerKey: string;
  mediaId: number;
}

export const FEATURED_NEW_TRAILERS: NewTrailerItem[] = [];

// Master Media Catalog (Populated dynamically by user imports & Firestore)
export const MASTER_MEDIA_CATALOG: MediaItem[] = [];

// External Search supporting multi-year releases via Backend & OMDb API
export async function searchExternalTMDB(query: string, type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> {
  if (!query || query.trim().length === 0) {
    return MASTER_MEDIA_CATALOG;
  }

  const cleanQ = query.trim().toLowerCase();
  const internalMatches = MASTER_MEDIA_CATALOG.filter(m => {
    const matchesTitle = m.title.toLowerCase().includes(cleanQ) || (m.originalTitle && m.originalTitle.toLowerCase().includes(cleanQ));
    const matchesGenre = m.genres.some(g => g.toLowerCase().includes(cleanQ));
    const matchesType = type === 'all' || m.type === type;
    return (matchesTitle || matchesGenre) && matchesType;
  });

  try {
    const res = await fetch('/api/search-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: query.trim() })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.results && json.results.length > 0) {
        const liveItems: MediaItem[] = json.results.filter((item: any) => type === 'all' || item.type === type);
        const existingIds = new Set(internalMatches.map(m => m.id));
        const newResults = liveItems.filter(l => !existingIds.has(l.id));
        return [...internalMatches, ...newResults];
      }
    }
  } catch (err) {
    console.debug('Backend search fallback', err);
  }

  return internalMatches;
}

export async function getMediaDetails(tmdbId: number, type: MediaType): Promise<MediaItem> {
  const existing = MASTER_MEDIA_CATALOG.find(m => m.tmdbId === tmdbId);
  if (existing) return existing;

  // Attempt live TMDB fetch
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=15d2fb6ef0325b30216c86d0e8d13b45&append_to_response=credits,videos`);
    if (res.ok) {
      const data = await res.json();
      data._mediaType = type;
      return {
        id: data.id,
        tmdbId: data.id,
        imdbId: data.imdb_id || `tt${data.id}`,
        title: `${data.title || data.name} (${(data.release_date || data.first_air_date || '2024').slice(0, 4)})`,
        originalTitle: data.original_title || data.original_name || data.title || data.name,
        type: type,
        overview: data.overview || '',
        posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80',
        backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : heroCyberpunk,
        releaseDate: data.release_date || data.first_air_date || '2024-01-01',
        voteAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
        voteCount: data.vote_count || 100,
        popularity: data.popularity || 100,
        genres: (data.genres || []).map((g: any) => g.name),
        runtime: data.runtime || 120,
        contentRating: 'PG-13',
        spokenLanguages: ['English'],
        trailerKey: 'cqGjhVJWtEg',
        directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        downloadSizeMB: 2000,
        cast: (data.credits?.cast || []).slice(0, 6).map((c: any, i: number) => ({
          id: c.id || i + 1,
          name: c.name,
          character: c.character || 'Cast Member',
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : ''
        }))
      };
    }
  } catch {}

  return {
    id: tmdbId,
    tmdbId: tmdbId,
    title: 'Custom Title',
    type: type,
    overview: 'Stream this custom title in high definition.',
    posterPath: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80',
    backdropPath: heroCyberpunk,
    releaseDate: '2024-01-01',
    voteAverage: 8.0,
    voteCount: 100,
    popularity: 100,
    genres: ['Action'],
    runtime: 120,
    contentRating: 'PG-13',
    spokenLanguages: ['English'],
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    downloadSizeMB: 2000,
    cast: []
  };
}
