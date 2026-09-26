import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Crown,
  Lock,
  Mail,
  Key,
  Check,
  ShieldCheck,
  AlertCircle,
  Camera,
  Film,
  Tv,
  Download,
  Eye,
  EyeOff,
  Clapperboard,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  Info,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  syncUserProfile, 
  UserProfileData,
  isSuperAdminEmail 
} from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

import authCinemaBackdrop from '../assets/images/auth_cinema_backdrop_1790419414436.jpg';
import authPosterCollage from '../assets/images/auth_poster_collage_1790419427318.jpg';
import spaceOdyssey from '../assets/images/space_odyssey_cosmos_1790416922098.jpg';
import heroCyberpunk from '../assets/images/hero_cyberpunk_neon_1790416909174.jpg';
import fantasyRealm from '../assets/images/fantasy_realm_epic_1790416932938.jpg';
import { NETFLIX_AVATARS, DEFAULT_NETFLIX_AVATAR } from '../services/netflixAvatars';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onProfileUpdated: () => void;
}

interface TrendingShowSlide {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  badge: string;
  rating: number;
  year: number;
  durationOrSeasons: string;
  genres: string[];
  tagline: string;
  backdrop: string;
  poster: string;
}

const TRENDING_SLIDES: TrendingShowSlide[] = [
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    badge: '#1 TRENDING MOVIE',
    rating: 8.8,
    year: 2023,
    durationOrSeasons: '2h 20m • 4K HDR',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    tagline: "It's how you wear the mask that matters.",
    backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    poster: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'
  },
  {
    id: 157336,
    title: 'Interstellar',
    type: 'movie',
    badge: '#2 TOP RATED SCI-FI',
    rating: 8.7,
    year: 2014,
    durationOrSeasons: '2h 49m • IMAX 4K',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    backdrop: spaceOdyssey,
    poster: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    id: 70523,
    title: 'Dark: Time & Memory',
    type: 'tv',
    badge: '#3 TRENDING TV SHOW',
    rating: 8.8,
    year: 2020,
    durationOrSeasons: '3 Seasons • 26 Episodes',
    genres: ['Mystery', 'Sci-Fi', 'Thriller'],
    tagline: "The question is not where, but when.",
    backdrop: authPosterCollage,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 999201,
    title: 'Cyberpunk: Neon Overdrive',
    type: 'tv',
    badge: '#4 NEW SEASON',
    rating: 8.9,
    year: 2024,
    durationOrSeasons: '1 Season • 10 Episodes',
    genres: ['Cyberpunk', 'Action', 'Anime'],
    tagline: "High tech, low life. Survive the neon underworld.",
    backdrop: heroCyberpunk,
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 76600,
    title: 'Avatar: The Way of Water',
    type: 'movie',
    badge: '#5 BLOCKBUSTER',
    rating: 8.4,
    year: 2022,
    durationOrSeasons: '3h 12m • 3D 4K',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    tagline: "Return to Pandora for an epic oceanic journey.",
    backdrop: authCinemaBackdrop,
    poster: 'https://image.tmdb.org/t/p/w780/t6HIqrRAclO2P33C293yR1Mne2e.jpg'
  },
  {
    id: 999202,
    title: 'Chronicles of Eldoria',
    type: 'tv',
    badge: '#6 EPIC FANTASY',
    rating: 8.6,
    year: 2024,
    durationOrSeasons: '2 Seasons • 16 Episodes',
    genres: ['Fantasy', 'Epic', 'Adventure'],
    tagline: "Uncover ancient magic in a world beyond imagination.",
    backdrop: fantasyRealm,
    poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80'
  }
];

const TrendingSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TRENDING_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const active = TRENDING_SLIDES[currentSlide];

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-full min-h-[460px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between p-5 sm:p-7 bg-[#090b11] group shadow-2xl select-none"
    >
      {/* Background Slides with smooth crossfade */}
      {TRENDING_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
            idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img
            src={slide.backdrop}
            alt={slide.title}
            className="w-full h-full object-cover filter contrast-125 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-[#090b11]/80 to-[#090b11]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b11] via-transparent to-[#090b11]/70" />
        </div>
      ))}

      {/* Top Header Row inside Slideshow */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-lg">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider font-black text-white uppercase">
            Trending Now
          </span>
        </div>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white text-[10px] font-semibold transition-all"
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Auto-slide On</span>
            </>
          )}
        </button>
      </div>

      {/* Middle Active Show Content Card */}
      <div className="relative z-10 my-auto pt-8 pb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase shadow-lg shadow-rose-950/60">
            {active.badge}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-[10px] font-bold border border-white/10 uppercase">
            {active.type === 'movie' ? 'Movie' : 'TV Series'}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{active.rating}</span>
          </div>
        </div>

        {/* Poster + Title layout */}
        <div className="flex items-start gap-4">
          <img
            src={active.poster}
            alt={active.title}
            className="w-20 sm:w-24 h-28 sm:h-36 rounded-xl object-cover border border-white/20 shadow-2xl shadow-black shrink-0 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-display leading-tight drop-shadow-md">
              {active.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-xs font-semibold">
              <span>{active.year}</span>
              <span>•</span>
              <span className="text-emerald-400">{active.durationOrSeasons}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {active.genres.map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-slate-200 text-[10px] font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-300 italic line-clamp-2 pt-1 font-serif">
              "{active.tagline}"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Nav Controls & Progress Bars */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? TRENDING_SLIDES.length - 1 : prev - 1))}
            className="p-2 rounded-xl bg-black/60 hover:bg-rose-600 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % TRENDING_SLIDES.length)}
            className="p-2 rounded-xl bg-black/60 hover:bg-rose-600 border border-white/10 text-slate-300 hover:text-white backdrop-blur-md transition-all active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-xs font-mono ml-1">
            0{currentSlide + 1} / 0{TRENDING_SLIDES.length}
          </span>
        </div>

        {/* Slide Indicator Bar Dots */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {TRENDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="relative h-1.5 flex-1 sm:w-8 sm:flex-none rounded-full overflow-hidden bg-white/20 transition-all cursor-pointer"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onProfileUpdated: () => void;
  onOpenAdmin?: () => void;
  onOpenAutoFill?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
];

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onProfileUpdated,
  onOpenAdmin,
  onOpenAutoFill
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.photoURL || currentUser?.photoURL || DEFAULT_NETFLIX_AVATAR);
  const [isKids, setIsKids] = useState(userProfile?.isKids || false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
        onProfileUpdated();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await syncUserProfile(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(res.user, { displayName: displayName.trim() });
        }
        await syncUserProfile(res.user, { displayName: displayName.trim() });
      }
      onProfileUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    setSaveSuccess(false);
    try {
      await updateProfile(currentUser, {
        displayName: editName.trim() || currentUser.displayName,
        photoURL: selectedAvatar
      });
      await syncUserProfile(currentUser, {
        displayName: editName.trim(),
        photoURL: selectedAvatar,
        isKids: isKids
      });
      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onProfileUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080d]/95 backdrop-blur-2xl p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Dynamic Ambient Cinematic Background Image */}
      <div className="fixed inset-0 z-0 opacity-25 pointer-events-none overflow-hidden select-none">
        <img
          src={authMode === 'signin' ? authCinemaBackdrop : authPosterCollage}
          alt="Cinema Backdrop"
          className="w-full h-full object-cover filter contrast-125 saturate-150 scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07080d]/60 to-[#07080d]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#0f121d]/90 border border-white/10 shadow-[0_0_100px_rgba(225,29,72,0.15)] overflow-hidden my-auto">
        
        {/* Top Header Bar inside Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-indigo-600 flex items-center justify-center text-white font-serif-brand font-black text-xl shadow-lg shadow-rose-600/40">
              N
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white font-display uppercase">
                Nexplay <span className="text-rose-500">Stream</span>
              </span>
              <span className="hidden sm:inline-block ml-3 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ● 4K ULTRA HD STREAMING
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-semibold"
          >
            <span>Close</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Modal Body Content */}
        {currentUser ? (
          /* LOGGED IN ACCOUNT MANAGEMENT SCREEN */
          <div className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
            
            <div className="text-center space-y-3">
              {isSuperAdminEmail(currentUser?.email) ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-black/60 border border-amber-500/30 shadow-2xl shadow-amber-950/40 text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-950/60 shrink-0">
                        <Crown className="w-6 h-6 fill-amber-200 text-amber-200 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Super Admin Control Hub</h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                            AUTHORIZED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Master account: <span className="text-amber-200 font-mono font-semibold">{currentUser.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAdmin();
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

                      {onOpenAutoFill && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAutoFill();
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Auto-Fill Importer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Nexplay Member Account</span>
                </div>
              )}
              <h2 className="text-3xl font-black text-white font-display tracking-tight">Manage Your Profile</h2>
              <p className="text-xs text-slate-400">Sync your cinema preferences, avatar, and parental controls across all devices.</p>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Netflix Icon Avatar Selector */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatar || currentUser.photoURL || DEFAULT_NETFLIX_AVATAR}
                      alt="User Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500 shadow-xl shadow-rose-950/60"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-rose-600 text-white shadow">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-white">Select Netflix Icon Avatar</h4>
                    <p className="text-xs text-slate-400">Choose a signature Netflix-style vector avatar icon for your profile.</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2 border-t border-white/5">
                  {NETFLIX_AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.svgDataUrl)}
                      title={av.name}
                      className={`relative rounded-2xl p-1 border-2 transition-all group overflow-hidden ${
                        selectedAvatar === av.svgDataUrl 
                          ? 'border-rose-500 scale-105 shadow-xl shadow-rose-600/40 ring-2 ring-rose-500/50' 
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={av.svgDataUrl} alt={av.name} className="w-12 h-12 rounded-xl object-cover mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address (Firebase Authenticated)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      disabled
                      value={currentUser.email || 'No email registered'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Kids Mode Toggle */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Kids Mode Content Filtering</span>
                    <span className="text-[11px] text-slate-400">Automatically hides mature, R, and TV-MA content</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                />
              </div>

              {/* Success Alert */}
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Profile updated and synced to Firestore cloud database!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

            </form>

          </div>
        ) : (
          /* CINEMATIC NOT-SIGNED-IN AUTHENTICATION SPLIT VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            
            {/* Left Column: Smooth Slideshow of Trending Movies & TV Shows */}
            <div className="lg:col-span-6 p-3 sm:p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-b from-black/80 to-black/40 flex flex-col justify-center">
              <TrendingSlideshow />
            </div>

            {/* Right Column: Premium Auth Card Form */}
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5 bg-[#0e111a]/80">
              
              {/* Mode Switcher Tabs */}
              <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMode === 'signin' 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMode === 'signup' 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Google One-Tap / Quick Auth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-white/20 active:scale-[0.99] group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.32 21.32 7.38 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.38 0 3.32 2.68 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Continue with Google Account'}</span>
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0e111a] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or with Email
                </span>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    {authMode === 'signin' && (
                      <span className="text-[11px] text-rose-400 hover:underline cursor-pointer">
                        Forgot Password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {isLoading 
                      ? 'Connecting to Nexplay...' 
                      : authMode === 'signin' 
                        ? 'Sign In to Stream' 
                        : 'Create Nexplay Streaming Account'}
                  </span>
                </button>
              </form>

              {/* Guest / Demo Notice */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Want to explore without logging in?</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-rose-400 hover:text-rose-300 font-semibold hover:underline shrink-0"
                >
                  Browse Free
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
