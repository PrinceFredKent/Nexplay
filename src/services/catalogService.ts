import { Episode, MediaItem, MediaType, Season } from '../types/movie';
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

// Fetch TV Season Episodes
export async function fetchTvSeasonEpisodes(
  tmdbId: number,
  seasonNumber: number,
  showTitle?: string,
  backdropPath?: string,
  episodeCount?: number
): Promise<{ episodes: Episode[]; seasonName?: string; seasonOverview?: string }> {
  try {
    const res = await fetch('/api/tv-season', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId,
        seasonNumber,
        showTitle,
        backdropPath,
        episodeCount
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.episodes) {
        return {
          episodes: json.episodes,
          seasonName: json.seasonName,
          seasonOverview: json.seasonOverview
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch TV season episodes:', err);
  }

  // Client-side instant fallback
  const fallbackCount = Math.max(1, episodeCount || 10);
  const fallbackEpisodes: Episode[] = Array.from({ length: fallbackCount }, (_, i) => {
    const epNum = i + 1;
    return {
      id: (tmdbId || 9999) * 1000 + seasonNumber * 100 + epNum,
      episodeNumber: epNum,
      seasonNumber,
      name: `${showTitle || 'Series'} Episode ${epNum}`,
      overview: `Stream ${showTitle || 'TV series'} Season ${seasonNumber}, Episode ${epNum} in Full HD.`,
      stillPath: backdropPath || heroCyberpunk,
      runtime: 45,
      voteAverage: 8.0,
      airDate: '2024-01-01',
      directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      downloadSizeMB: 480
    };
  });

  return { episodes: fallbackEpisodes, seasonName: `Season ${seasonNumber}` };
}

export async function getMediaDetails(tmdbId: number, type: MediaType): Promise<MediaItem> {
  const existing = MASTER_MEDIA_CATALOG.find(m => m.tmdbId === tmdbId);
  if (existing && existing.seasons && existing.seasons.length > 0 && existing.seasons[0].episodes?.length > 0) {
    return existing;
  }

  // Attempt backend TV / Movie details fetch
  if (type === 'tv') {
    try {
      const res = await fetch('/api/tv-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId, title: existing?.cleanTitle || existing?.title })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.media) {
          const media: MediaItem = json.media;
          // Pre-fetch Season 1 episodes if seasons exist
          const firstSeasonNum = media.seasons?.[0]?.seasonNumber || 1;
          const epData = await fetchTvSeasonEpisodes(
            media.tmdbId,
            firstSeasonNum,
            media.cleanTitle || media.title,
            media.backdropPath,
            media.seasons?.[0]?.episodeCount
          );

          if (media.seasons && media.seasons.length > 0) {
            media.seasons[0].episodes = epData.episodes;
          } else {
            media.seasons = [{
              seasonNumber: firstSeasonNum,
              name: epData.seasonName || `Season ${firstSeasonNum}`,
              episodeCount: epData.episodes.length,
              overview: epData.seasonOverview || '',
              posterPath: media.posterPath,
              episodes: epData.episodes
            }];
          }

          if (existing) {
            Object.assign(existing, media);
          }
          return media;
        }
      }
    } catch (err) {
      console.warn('Backend tv-details error', err);
    }
  }

  if (existing) return existing;

  // Attempt live TMDB fetch
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=15d2fb6ef0325b30216c86d0e8d13b45&append_to_response=credits,videos`);
    if (res.ok) {
      const data = await res.json();
      data._mediaType = type;
      const isTv = type === 'tv';
      const releaseDate = isTv ? (data.first_air_date || '2024-01-01') : (data.release_date || '2024-01-01');
      const releaseYear = releaseDate.slice(0, 4);
      const titleName = isTv ? (data.name || 'Untitled') : (data.title || 'Untitled');

      const seasons: Season[] = isTv && data.seasons && Array.isArray(data.seasons) && data.seasons.length > 0
        ? data.seasons
            .filter((s: any) => s.season_number > 0)
            .map((s: any) => ({
              seasonNumber: s.season_number,
              name: s.name || `Season ${s.season_number}`,
              episodeCount: s.episode_count || 10,
              overview: s.overview || '',
              posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w780${s.poster_path}` : '',
              episodes: []
            }))
        : (isTv ? [{
            seasonNumber: 1,
            name: 'Season 1',
            episodeCount: data.number_of_episodes || 10,
            overview: '',
            posterPath: '',
            episodes: []
          }] : undefined as any);

      // Fetch Season 1 episodes for TV
      if (isTv && seasons && seasons.length > 0) {
        const epData = await fetchTvSeasonEpisodes(
          data.id,
          seasons[0].seasonNumber,
          titleName,
          data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : undefined,
          seasons[0].episodeCount
        );
        seasons[0].episodes = epData.episodes;
      }

      return {
        id: data.id,
        tmdbId: data.id,
        imdbId: data.imdb_id || `tt${data.id}`,
        title: `${titleName} (${releaseYear})`,
        cleanTitle: titleName,
        originalTitle: data.original_title || data.original_name || titleName,
        type: type,
        overview: data.overview || '',
        tagline: data.tagline || '',
        posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&auto=format&fit=crop&q=80',
        backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : heroCyberpunk,
        releaseDate: releaseDate,
        voteAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
        voteCount: data.vote_count || 100,
        popularity: data.popularity || 100,
        genres: (data.genres || []).map((g: any) => g.name || g),
        runtime: isTv ? (data.episode_run_time?.[0] || 45) : (data.runtime || 120),
        seasonsCount: isTv ? (data.number_of_seasons || (seasons ? seasons.length : 1)) : undefined,
        episodesCount: isTv ? (data.number_of_episodes || 10) : undefined,
        seasons: seasons,
        contentRating: isTv ? 'TV-MA' : 'PG-13',
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
