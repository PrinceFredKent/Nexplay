import React from 'react';
import { Home, Heart, Download, User, Settings, Crown, Sparkles, Film } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { isSuperAdminEmail } from '../services/firebase';

interface NexplaySidebarProps {
  activeTab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections') => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenAutoFill?: () => void;
  watchlistCount: number;
  downloadsCount: number;
  currentUser: FirebaseUser | null;
}

export const NexplaySidebar: React.FC<NexplaySidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenSearch,
  onOpenAutoFill,
  watchlistCount,
  downloadsCount,
  currentUser
}) => {
  return (
    <>
      {/* Desktop Sidebar Rail (md+ screens) */}
      <aside className="hidden md:flex fixed left-3 lg:left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4 py-4 px-2 rounded-3xl bg-[#1e2230]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
        
        {/* Brand Icon */}
        <button 
          onClick={() => setActiveTab('home')}
          title="Nexplay Home"
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-indigo-600 flex items-center justify-center text-white font-serif-brand font-black text-xl shadow-lg shadow-rose-600/30 hover:scale-105 transition-transform mb-2 focus:ring-2 focus:ring-rose-500"
        >
          N
        </button>

        {/* Nav Item: Home */}
        <button
          onClick={() => setActiveTab('home')}
          title="Home"
          className={`p-3 rounded-2xl transition-all relative focus:ring-2 focus:ring-rose-500 ${
            activeTab === 'home'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Nav Item: Watchlist */}
        <button
          onClick={() => setActiveTab('watchlist')}
          title="My Watchlist"
          className={`p-3 rounded-2xl transition-all relative focus:ring-2 focus:ring-rose-500 ${
            activeTab === 'watchlist'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Heart className="w-5 h-5" />
          {watchlistCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#1e2230]" />
          )}
        </button>

        {/* Nav Item: Downloads */}
        <button
          onClick={() => setActiveTab('downloads')}
          title="Offline Downloads"
          className={`p-3 rounded-2xl transition-all relative focus:ring-2 focus:ring-rose-500 ${
            activeTab === 'downloads'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Download className="w-5 h-5" />
          {downloadsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1e2230]" />
          )}
        </button>

        {/* Nav Item: Account */}
        <button
          onClick={onOpenProfile}
          title={currentUser ? "Account Settings" : "Sign In / Register"}
          className="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all relative focus:ring-2 focus:ring-rose-500"
        >
          <User className="w-5 h-5" />
          {currentUser && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#1e2230]" />
          )}
        </button>

        {/* Nav Item: Search & Filters */}
        <button
          onClick={onOpenSearch}
          title="Search & Filters"
          className="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:ring-2 focus:ring-rose-500"
        >
          <Settings className="w-5 h-5" />
        </button>

      </aside>

      {/* Mobile Bottom Navigation Bar (sm screens) */}
      <nav className="flex md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0b0d16]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        
        {/* Mobile: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'home' ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Mobile: Watchlist */}
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'watchlist' ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>
          <span>Watchlist</span>
        </button>

        {/* Mobile: Center Action (Auto-Fill Movie or Search) */}
        <button
          onClick={onOpenAutoFill || onOpenSearch}
          title="Auto-Fill Movie"
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-950/80 active:scale-95 transition-transform border border-white/20"
        >
          <Sparkles className="w-6 h-6 fill-white" />
        </button>

        {/* Mobile: Downloads */}
        <button
          onClick={() => setActiveTab('downloads')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'downloads' ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Download className="w-5 h-5" />
            {downloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </div>
          <span>Downloads</span>
        </button>

        {/* Mobile: Account */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all"
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </button>

      </nav>
    </>
  );
};

