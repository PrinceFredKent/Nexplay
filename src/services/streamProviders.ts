import { MediaType, StreamSource } from '../types/movie';

// Dynamic Multi-Source Streaming Providers
export const STREAM_PROVIDERS: StreamSource[] = [
  {
    id: 'vidlink-fast',
    name: 'VidLink Ultra (Fast)',
    quality: '4K HDR',
    type: 'embed',
    serverName: 'Cloudflare Edge CDN',
    isFast: true,
    badge: 'Recommended',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://vidlink.pro/movie/${tmdbId}?primaryColor=e11d48&secondaryColor=090a0f&iconColor=ffffff&autoplay=false`;
      }
      return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e11d48&secondaryColor=090a0f&iconColor=ffffff&autoplay=false`;
    },
  },
  {
    id: 'superembed-pro',
    name: 'SuperEmbed 4K Multi',
    quality: '4K HDR',
    type: 'embed',
    serverName: 'Akamai Global HD',
    isFast: true,
    badge: 'Multi-Lang',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      }
      return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'autoembed-v2',
    name: 'AutoEmbed Master Server',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'Fastly European Edge',
    isFast: true,
    badge: 'High Speed',
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
      }
      return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
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
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://www.2embed.cc/embed/${tmdbId}`;
      }
      return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'vidsrc-reliable',
    name: 'VidSrc Global Node',
    quality: '1080p FHD',
    type: 'embed',
    serverName: 'VidSrc Direct Mesh',
    isFast: true,
    getUrl: (tmdbId, type, season = 1, episode = 1) => {
      if (type === 'movie') {
        return `https://vidsrc.xyz/embed/movie/${tmdbId}`;
      }
      return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
    },
  },
  {
    id: 'lumina-direct',
    name: 'Lumina Native HD Stream / Trailer',
    quality: '4K HDR',
    type: 'direct',
    serverName: 'Native Direct HLS / Web Player',
    isFast: true,
    badge: 'Native UI',
    getUrl: (tmdbId) => {
      return `https://www.youtube.com/embed/${tmdbId}?autoplay=1&rel=0&modestbranding=1`;
    },
  },
];

// Open cinema public domain and sample video streams for pristine direct native playback test & offline downloads
export const SAMPLE_DIRECT_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];
