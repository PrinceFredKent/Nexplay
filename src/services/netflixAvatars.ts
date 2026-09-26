// Netflix-Style Vector Icon Avatars (Data URIs for 100% instant rendering)

export interface NetflixAvatar {
  id: string;
  name: string;
  bgGradient: string;
  svgDataUrl: string;
}

function createAvatarSvg(bgStart: string, bgEnd: string, pathD: string, accentColor: string = '#FFFFFF'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#g)" />
    <g transform="translate(20, 20) scale(2.5)" fill="none" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${pathD}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 12 Netflix-Style Iconic Avatars
export const NETFLIX_AVATARS: NetflixAvatar[] = [
  {
    id: 'red_popcorn',
    name: 'Red Cinema Popcorn',
    bgGradient: 'from-rose-600 to-red-700',
    svgDataUrl: createAvatarSvg('#E50914', '#B81D24', `
      <path d="M18 8h1a4 4 0 0 0 4-4V3a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h1"/>
      <path d="M2 8l2 13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l2-13"/>
      <line x1="8" y1="8" x2="10" y2="22"/>
      <line x1="16" y1="8" x2="14" y2="22"/>
    `)
  },
  {
    id: 'blue_bot',
    name: 'Cyber Bot',
    bgGradient: 'from-blue-600 to-indigo-800',
    svgDataUrl: createAvatarSvg('#0071EB', '#1E1B4B', `
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <line x1="8" y1="15" x2="8" y2="15.01"/>
      <line x1="16" y1="15" x2="16" y2="15.01"/>
    `)
  },
  {
    id: 'gold_crown',
    name: 'VIP Gold Crown',
    bgGradient: 'from-amber-500 to-yellow-600',
    svgDataUrl: createAvatarSvg('#F59E0B', '#B45309', `
      <path d="M2 4l3 12h14l3-12-6 7-4-8-4 8-6-7z"/>
      <circle cx="12" cy="18" r="1"/>
    `)
  },
  {
    id: 'purple_mask',
    name: 'Superhero Mask',
    bgGradient: 'from-purple-600 to-violet-900',
    svgDataUrl: createAvatarSvg('#8B5CF6', '#4C1D95', `
      <path d="M2 10c2-3 6-4 10-4s8 1 10 4c0 5-4 9-10 9S2 15 2 10z"/>
      <circle cx="8" cy="10" r="2"/>
      <circle cx="16" cy="10" r="2"/>
    `)
  },
  {
    id: 'teal_ghost',
    name: 'Chill Ghost',
    bgGradient: 'from-teal-500 to-emerald-700',
    svgDataUrl: createAvatarSvg('#14B8A6', '#047857', `
      <path d="M9 10h.01"/>
      <path d="M15 10h.01"/>
      <path d="M12 2a8 8 0 0 0-8 8v11l3-2 3 2 2-2 2 2 3-2 3 2V10a8 8 0 0 0-8-8z"/>
    `)
  },
  {
    id: 'green_gamepad',
    name: 'Pro Gamer',
    bgGradient: 'from-emerald-500 to-green-700',
    svgDataUrl: createAvatarSvg('#10B981', '#065F46', `
      <line x1="6" y1="12" x2="10" y2="12"/>
      <line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1"/>
      <circle cx="17" cy="13" r="1"/>
      <rect x="2" y="6" width="20" height="12" rx="6"/>
    `)
  },
  {
    id: 'rose_sparkles',
    name: 'Cinema Star',
    bgGradient: 'from-rose-500 to-pink-700',
    svgDataUrl: createAvatarSvg('#F43F5E', '#9F1239', `
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    `)
  },
  {
    id: 'orange_rocket',
    name: 'Astro Launch',
    bgGradient: 'from-orange-500 to-amber-700',
    svgDataUrl: createAvatarSvg('#F97316', '#9A3412', `
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"/>
    `)
  },
  {
    id: 'indigo_headphones',
    name: 'Spatial Audio',
    bgGradient: 'from-indigo-600 to-blue-900',
    svgDataUrl: createAvatarSvg('#6366F1', '#1E1B4B', `
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    `)
  },
  {
    id: 'flame_trend',
    name: 'Hot Streamer',
    bgGradient: 'from-red-500 to-orange-600',
    svgDataUrl: createAvatarSvg('#EF4444', '#9A3412', `
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
    `)
  },
  {
    id: 'dark_ninja',
    name: 'Shadow Ninja',
    bgGradient: 'from-slate-700 to-slate-900',
    svgDataUrl: createAvatarSvg('#334155', '#020617', `
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12h8"/>
      <circle cx="9" cy="10" r="1.5" fill="#FFF"/>
      <circle cx="15" cy="10" r="1.5" fill="#FFF"/>
    `)
  },
  {
    id: 'kids_smile',
    name: 'Kids Smile',
    bgGradient: 'from-lime-500 to-emerald-600',
    svgDataUrl: createAvatarSvg('#84CC16', '#15803D', `
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    `)
  }
];

export const DEFAULT_NETFLIX_AVATAR = NETFLIX_AVATARS[0].svgDataUrl;
