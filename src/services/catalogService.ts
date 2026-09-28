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

export const FEATURED_NEW_TRAILERS: NewTrailerItem[] = [
  {
    id: 1,
    title: 'Love, Death & Robots: Volume 3',
    duration: '2:15',
    thumbnailPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    trailerKey: 'Xj2b0TEv1-0',
    mediaId: 86831
  },
  {
    id: 2,
    title: 'Dune: Part Two - Final Trailer',
    duration: '3:04',
    thumbnailPath: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    trailerKey: 'Way9Dexny3w',
    mediaId: 693134
  },
  {
    id: 3,
    title: 'Arcane: Season 2 Awakening',
    duration: '2:40',
    thumbnailPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    trailerKey: 'fXmAurh012s',
    mediaId: 94605
  }
];

// Master Media Catalog with canonical TMDB and IMDB IDs for verified stream scraping
export const MASTER_MEDIA_CATALOG: MediaItem[] = [
  {
    id: 86831,
    tmdbId: 86831,
    imdbId: 'tt9788496',
    title: 'Love, Death & Robots (2019)',
    cleanTitle: 'Love, Death & Robots',
    originalTitle: 'Love, Death & Robots',
    type: 'tv',
    tagline: 'Terrifying creatures, wicked surprises and dark comedy.',
    overview: 'This collection of animated short stories spans several genres, including science fiction, fantasy, horror and comedy. Produced by Tim Miller and David Fincher.',
    posterPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=780&auto=format&fit=crop&q=80',
    backdropPath: heroCyberpunk,
    releaseDate: '2019-03-15',
    voteAverage: 8.7,
    voteCount: 4200,
    popularity: 380,
    genres: ['Animation', 'Sci-Fi', 'Fantasy', 'Action'],
    runtime: 20,
    seasonsCount: 3,
    episodesCount: 35,
    isFeatured: true,
    isTrending: true,
    contentRating: 'TV-MA',
    spokenLanguages: ['English'],
    trailerKey: 'Xj2b0TEv1-0',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    downloadSizeMB: 850,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Volume 1',
        episodeCount: 18,
        overview: 'The first volume of provocative animated shorts.',
        posterPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=780&auto=format&fit=crop&q=80',
        episodes: [
          {
            id: 86831101,
            episodeNumber: 1,
            seasonNumber: 1,
            name: "Sonnie's Edge",
            overview: "In the underground world of beast fights, Sonnie remains undefeated as long as she keeps her edge.",
            stillPath: heroCyberpunk,
            runtime: 17,
            voteAverage: 8.8,
            airDate: '2019-03-15'
          },
          {
            id: 86831102,
            episodeNumber: 2,
            seasonNumber: 1,
            name: "Three Robots",
            overview: "Long after the fall of humanity, three robots take a sightseeing tour through a post-apocalyptic city.",
            stillPath: spaceOdyssey,
            runtime: 12,
            voteAverage: 8.5,
            airDate: '2019-03-15'
          },
          {
            id: 86831103,
            episodeNumber: 3,
            seasonNumber: 1,
            name: "The Witness",
            overview: "After witnessing a brutal murder, a woman flees from the killer through the streets of a surreal Hong Kong.",
            stillPath: fantasyRealm,
            runtime: 12,
            voteAverage: 8.6,
            airDate: '2019-03-15'
          }
        ]
      },
      {
        seasonNumber: 2,
        name: 'Volume 2',
        episodeCount: 8,
        overview: 'From wild adventures on distant planets to unsettling encounters close to home.',
        posterPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=780&auto=format&fit=crop&q=80',
        episodes: []
      },
      {
        seasonNumber: 3,
        name: 'Volume 3',
        episodeCount: 9,
        overview: 'Terror, imagination and beauty combine in nine new episodes.',
        posterPath: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=780&auto=format&fit=crop&q=80',
        episodes: []
      }
    ],
    cast: [
      { id: 1, name: 'Scott Whyte', character: 'Future Pilot', profilePath: '' },
      { id: 2, name: 'Nolan North', character: 'Various', profilePath: '' }
    ]
  },
  {
    id: 693134,
    tmdbId: 693134,
    imdbId: 'tt15239678',
    title: 'Dune: Part Two (2024)',
    cleanTitle: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    type: 'movie',
    tagline: 'Long live the fighters.',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterPath: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=780&auto=format&fit=crop&q=80',
    backdropPath: spaceOdyssey,
    releaseDate: '2024-03-01',
    voteAverage: 8.6,
    voteCount: 5200,
    popularity: 450,
    genres: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
    runtime: 166,
    isFeatured: true,
    isTrending: true,
    contentRating: 'PG-13',
    spokenLanguages: ['English'],
    trailerKey: 'Way9Dexny3w',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    downloadSizeMB: 2800,
    cast: [
      { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profilePath: '' },
      { id: 2, name: 'Zendaya', character: 'Chani', profilePath: '' },
      { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profilePath: '' }
    ]
  },
  {
    id: 94605,
    tmdbId: 94605,
    imdbId: 'tt11126994',
    title: 'Arcane (2021)',
    cleanTitle: 'Arcane: League of Legends',
    originalTitle: 'Arcane',
    type: 'tv',
    tagline: 'Every legend has a beginning.',
    overview: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
    posterPath: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=780&auto=format&fit=crop&q=80',
    backdropPath: fantasyRealm,
    releaseDate: '2021-11-06',
    voteAverage: 9.0,
    voteCount: 6800,
    popularity: 420,
    genres: ['Animation', 'Sci-Fi', 'Action', 'Drama', 'Fantasy'],
    runtime: 42,
    seasonsCount: 2,
    episodesCount: 18,
    isFeatured: true,
    isTrending: true,
    contentRating: 'TV-14',
    spokenLanguages: ['English'],
    trailerKey: 'fXmAurh012s',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    downloadSizeMB: 1900,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 9,
        overview: 'Act 1, 2, and 3 of the legendary Piltover & Zaun saga.',
        posterPath: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=780&auto=format&fit=crop&q=80',
        episodes: [
          {
            id: 94605101,
            episodeNumber: 1,
            seasonNumber: 1,
            name: 'Welcome to the Playground',
            overview: 'Orphan sisters Vi and Powder bring trouble to Zaun underground after a heist in posh Piltover.',
            stillPath: fantasyRealm,
            runtime: 43,
            voteAverage: 8.9,
            airDate: '2021-11-06'
          }
        ]
      }
    ],
    cast: [
      { id: 1, name: 'Hailee Steinfeld', character: 'Vi', profilePath: '' },
      { id: 2, name: 'Ella Purnell', character: 'Jinx', profilePath: '' }
    ]
  },
  {
    id: 1196420,
    tmdbId: 1196420,
    imdbId: 'tt29465718',
    title: 'Falimy (2023)',
    cleanTitle: 'Falimy : Malayalam',
    originalTitle: 'Falimy',
    type: 'movie',
    tagline: 'A dysfunctional journey to Varanasi.',
    overview: 'A dysfunctional family of five embarks on a turbulent journey to Varanasi to fulfill the grandfather’s wish, discovering each other along the way.',
    posterPath: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=780&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80',
    releaseDate: '2023-11-17',
    voteAverage: 8.2,
    voteCount: 850,
    popularity: 290,
    genres: ['Comedy', 'Drama'],
    runtime: 126,
    isFeatured: true,
    isTrending: true,
    contentRating: 'U',
    spokenLanguages: ['Malayalam', 'English'],
    trailerKey: 'cqGjhVJWtEg',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    downloadSizeMB: 1800,
    cast: [
      { id: 1, name: 'Basil Joseph', character: 'Anoop', profilePath: '' },
      { id: 2, name: 'Jagadish', character: 'Chandran', profilePath: '' }
    ]
  },
  {
    id: 1199341,
    tmdbId: 1199341,
    imdbId: 'tt29524440',
    title: 'Parking (2023)',
    cleanTitle: 'Parking',
    originalTitle: 'Parking',
    type: 'movie',
    tagline: 'Space is everything.',
    overview: 'An escalating feud over a car parking space between two tenants of different generations living in the same building threatens their lives and families.',
    posterPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=780&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    releaseDate: '2023-12-01',
    voteAverage: 8.4,
    voteCount: 920,
    popularity: 260,
    genres: ['Thriller', 'Drama'],
    runtime: 128,
    isFeatured: false,
    isTrending: true,
    contentRating: 'UA',
    spokenLanguages: ['Tamil', 'English'],
    trailerKey: 'cqGjhVJWtEg',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadSizeMB: 1750,
    cast: [
      { id: 1, name: 'Harish Kalyan', character: 'Eshwar', profilePath: '' },
      { id: 2, name: 'M. S. Bhaskar', character: 'Ilamparuthi', profilePath: '' }
    ]
  },
  {
    id: 24428,
    tmdbId: 24428,
    imdbId: 'tt0848228',
    title: 'The Avengers (2012)',
    cleanTitle: 'Avengers Assemble',
    originalTitle: 'The Avengers',
    type: 'movie',
    tagline: 'Some assembly required.',
    overview: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.',
    posterPath: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=780&auto=format&fit=crop&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?w=1600&auto=format&fit=crop&q=80',
    releaseDate: '2012-05-04',
    voteAverage: 8.3,
    voteCount: 29000,
    popularity: 350,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    runtime: 143,
    isFeatured: false,
    isTrending: true,
    contentRating: 'PG-13',
    spokenLanguages: ['English'],
    trailerKey: 'eOrNdBpGMv8',
    directStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    downloadSizeMB: 2400,
    cast: [
      { id: 1, name: 'Robert Downey Jr.', character: 'Tony Stark / Iron Man', profilePath: '' },
      { id: 2, name: 'Chris Evans', character: 'Steve Rogers / Captain America', profilePath: '' },
      { id: 3, name: 'Scarlett Johansson', character: 'Natasha Romanoff / Black Widow', profilePath: '' }
    ]
  }
];

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
      if (json.success && json.episodes && json.episodes.length > 0) {
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
  if (existing && existing.seasons && existing.seasons.length > 0 && existing.seasons[0].episodes && existing.seasons[0].episodes.length > 0) {
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
