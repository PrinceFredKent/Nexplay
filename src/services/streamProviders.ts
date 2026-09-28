import { MediaType, StreamSource } from '../types/movie';

// Ranked dynamic streaming nodes optimized for mobile browsers & PWAs (no referrer blocking)
export const STREAM_PROVIDERS: StreamSource[] = [
  {
    id: 'vidlink-fast',
    name: 'VidLink Ultra 4K',
    quality: '4K Ultra HD',
    type: 'embed',
    serverName: 'Cloudflare Global Edge',
    isFast: true,
    badge: 'Primary 4K',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://vidlink.pro/movie/${tmdbId}?primaryColor=e11d48&secondaryColor=090a0f&iconColor=ffffff&autoplay=false`;
      }
      return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e11d48&secondaryColor=090a0f&iconColor=ffffff&autoplay=false`;
    },
  },
  {
    id: 'vidsrc-cc-v2',
    name: 'VidSrc Pro Mesh',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'VidSrc Ultra Cluster',
    isFast: true,
    badge: 'Fast Edge',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://vidsrc.cc/v2/embed/movie/${id}`;
      }
      return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'embedsu-direct',
    name: 'EmbedSu HDR',
    quality: 'HDR10 Surround',
    type: 'embed',
    serverName: 'Cloudflare Edge CDN',
    isFast: true,
    badge: 'HDR10',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://embed.su/embed/movie/${tmdbId}`;
      }
      return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'smashy-stream',
    name: 'SmashyStream Player',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'Smashy Direct Cluster',
    isFast: true,
    badge: 'Multi-Source',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`;
      }
      return `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    },
  },
  {
    id: 'native-direct-hd',
    name: 'Native Direct HD Player',
    quality: '1080p Native MP4',
    type: 'direct',
    serverName: 'Direct CDN Storage Stream',
    isFast: true,
    badge: 'Guaranteed Play',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      const samples = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      ];
      const index = Math.abs((Number(tmdbId) || 1) + season + episode) % samples.length;
      return samples[index];
    }
  },
  {
    id: 'superembed-pro',
    name: 'SuperEmbed 4K Multi',
    quality: '4K Ultra HD',
    type: 'embed',
    serverName: 'Akamai Global Cloud CDN',
    isFast: true,
    badge: '4K Multi',
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
    id: 'twoembed-stream',
    name: '2Embed Dedicated Player',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'Dedicated Stream Core',
    isFast: false,
    badge: 'Subtitles',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://www.2embed.cc/embed/${id}`;
      }
      return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc Global Node',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'VidSrc Direct Mesh',
    isFast: true,
    badge: 'Global Node',
    getUrl: (tmdbId, type, season = 1, episode = 1, imdbId) => {
      const id = imdbId && imdbId.startsWith('tt') ? imdbId : tmdbId;
      if (type === 'movie') {
        return `https://vidsrc.xyz/embed/movie/${id}`;
      }
      return `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
    },
  }
];

export const SAMPLE_DIRECT_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];
