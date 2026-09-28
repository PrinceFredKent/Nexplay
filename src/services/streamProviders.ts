import { MediaType, StreamSource } from '../types/movie';

// Ranked streaming engines with DoodStream VIP as the primary default
export const STREAM_PROVIDERS: StreamSource[] = [
  {
    id: 'dood-vidsrc-pm',
    name: 'DoodStream VIP',
    quality: '1080p / 4K UHD',
    type: 'embed',
    serverName: 'DoodStream / VidSrc PM High-Speed Node',
    isFast: true,
    badge: 'Primary Default',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://vidsrc.pm/embed/movie/${id}`;
      }
      return `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'doodstream-core',
    name: 'DoodStream Multi-Host',
    quality: '1080p / 4K UHD',
    type: 'embed',
    serverName: 'DoodStream Multi-Host Node',
    isFast: true,
    badge: 'Multi-Host',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      const isImdb = Boolean(imdbId && imdbId.startsWith('tt'));
      if (type === 'movie') {
        return isImdb 
          ? `https://multiembed.mov/?video_id=${id}` 
          : `https://multiembed.mov/?video_id=${id}&tmdb=1`;
      }
      return isImdb 
        ? `https://multiembed.mov/?video_id=${id}&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'embedsu-direct',
    name: 'EmbedSu Ultra HD',
    quality: '1080p / 4K UHD',
    type: 'embed',
    serverName: 'Cloudflare Edge CDN',
    isFast: true,
    badge: 'Edge CDN',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://embed.su/embed/movie/${tmdbId}`;
      }
      return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc Global XYZ',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'VidSrc Direct Mesh',
    isFast: true,
    badge: 'Global CDN',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://vidsrc.xyz/embed/movie/${id}`;
      }
      return `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'twoembed-stream',
    name: '2Embed Core',
    quality: '1080p FHD',
    type: 'embed',
    serverName: '2Embed Dedicated Player',
    isFast: false,
    badge: 'Multi-Lang',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://www.2embed.cc/embed/${id}`;
      }
      return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'autoembed-co',
    name: 'AutoEmbed CO',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'AutoEmbed Fast Node',
    isFast: true,
    badge: 'Fast Node',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://autoembed.co/movie/tmdb/${tmdbId}`;
      }
      return `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`;
    },
  }
];

export const SAMPLE_DIRECT_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];
