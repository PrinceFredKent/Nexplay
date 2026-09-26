import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Bookmark, 
  Film, 
  Tv, 
  Layers, 
  User, 
  LogOut, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Plus,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types/movie';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  activeTab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections') => void;
  onOpenSearch: () => void;
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onSwitchProfile: (profile: UserProfile) => void;
  onOpenProfileManager: () => void;
  watchlistCount: number;
  downloadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  activeProfile,
  profiles,
  onSwitchProfile,
  onOpenProfileManager,
  watchlistCount,
  downloadsCount
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl py-3' 
            : 'bg-gradient-to-b from-[#090a0f]/90 via-[#090a0f]/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Zone 1: Single Element Brand Wordmark */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-red-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-serif-brand font-black text-lg leading-none">L</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              LUMINA<span className="text-rose-500 font-serif-brand ml-0.5">+</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links (Clean text with subtle underlines) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`transition-colors relative py-1 focus:outline-none ${
                activeTab === 'home' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`transition-colors relative py-1 focus:outline-none ${
                activeTab === 'movies' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Movies
              {activeTab === 'movies' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`transition-colors relative py-1 focus:outline-none ${
                activeTab === 'tv' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              TV Series
              {activeTab === 'tv' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`transition-colors relative py-1 flex items-center gap-1.5 focus:outline-none ${
                activeTab === 'watchlist' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              My List
              {watchlistCount > 0 && (
                <span className="font-mono-data text-[10px] bg-rose-600/80 text-white px-1.5 py-0.2 rounded-full">
                  {watchlistCount}
                </span>
              )}
              {activeTab === 'watchlist' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`transition-colors relative py-1 flex items-center gap-1.5 focus:outline-none ${
                activeTab === 'downloads' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Downloads
              {downloadsCount > 0 && (
                <span className="font-mono-data text-[10px] bg-emerald-600/80 text-white px-1.5 py-0.2 rounded-full">
                  {downloadsCount}
                </span>
              )}
              {activeTab === 'downloads' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`transition-colors relative py-1 focus:outline-none ${
                activeTab === 'collections' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Collections
              {activeTab === 'collections' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Search, Install PWA, Connectivity, User Profile) */}
          <div className="flex items-center gap-3">
            
            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search movies and series"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors focus:outline-none"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* In-App PWA Install Quick Button if installable */}
            {isInstallable && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Install App
              </button>
            )}

            {/* Offline Connectivity indicator */}
            {!isOnline && (
              <div 
                title="Offline Mode - using cached media"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-rose-500/50 transition-all focus:outline-none"
                aria-expanded={isProfileMenuOpen}
              >
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center border-2 border-white/20 shadow-md relative"
                  style={{ backgroundImage: `url(${activeProfile.avatar})` }}
                >
                  {activeProfile.isKids && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                      K
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl glass-dropdown shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-white/[0.08]">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {activeProfile.name}
                      {activeProfile.isKids && (
                        <span className="text-[10px] text-emerald-400 font-mono-data bg-emerald-500/10 px-1 rounded">Kids</span>
                      )}
                    </p>
                  </div>

                  {/* Switch profiles list */}
                  <div className="py-1">
                    <p className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Profile</p>
                    {profiles.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSwitchProfile(p);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                          p.id === activeProfile.id ? 'bg-white/[0.08] text-white font-medium' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-5 h-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate">{p.name}</span>
                        {p.id === activeProfile.id && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.08] pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenProfileManager();
                      }}
                      className="w-full px-4 py-2 text-xs text-slate-300 hover:bg-white/[0.05] hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Manage Profiles & PIN
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] ${
            activeTab === 'home' ? 'text-rose-500 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] ${
            activeTab === 'movies' ? 'text-rose-500 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Movies</span>
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] ${
            activeTab === 'tv' ? 'text-rose-500 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span>Series</span>
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] relative ${
            activeTab === 'watchlist' ? 'text-rose-500 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>My List</span>
          {watchlistCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-rose-600 text-[9px] text-white flex items-center justify-center font-mono-data">
              {watchlistCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] relative ${
            activeTab === 'downloads' ? 'text-rose-500 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-5 h-5" />
          <span>Offline</span>
          {downloadsCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-600 text-[9px] text-white flex items-center justify-center font-mono-data">
              {downloadsCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
