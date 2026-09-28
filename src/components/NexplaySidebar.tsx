import React from 'react';
import { Home, Heart, Download, User, Search, Settings, Crown, Sparkles, Film, Compass, Plus } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NexplaySidebarProps {
  activeTab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections';
  setActiveTab: (tab: 'home' | 'movies' | 'tv' | 'watchlist' | 'downloads' | 'collections') => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenAutoFill?: () => void;
  onOpenAdmin?: () => void;
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
  onOpenAdmin,
  watchlistCount,
  downloadsCount,
  currentUser
}) => {
  return (
    <>
      {/* Desktop Sidebar Rail (md+ screens) */}
      <aside className="hidden md:flex fixed left-3 lg:left-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4 py-4 px-2 rounded-3xl glass-liquid shadow-2xl">
        
        {/* Brand Icon */}
        <button 
          onClick={() => setActiveTab('home')}
          title="Nexplay Home"
          className="w-11 h-11 rounded-2xl glass-primary-btn flex items-center justify-center text-white font-serif-brand font-black text-xl shadow-lg hover:scale-105 transition-transform mb-2 focus:ring-2 focus:ring-rose-500"
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-[#12141e]" />
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#12141e]" />
          )}
        </button>

        {/* Nav Item: Admin Control Center & Add Movies */}
        {(onOpenAdmin || onOpenAutoFill) && (
          <button
            onClick={onOpenAdmin || onOpenAutoFill}
            title="Super Admin Control Center - Add & Manage Movies"
            className="p-3 rounded-2xl text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 transition-all border border-amber-500/30 shadow-md relative focus:ring-2 focus:ring-amber-500"
          >
            <Crown className="w-5 h-5 fill-amber-400/20" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#12141e]" />
          </button>
        )}

        {/* Nav Item: Search */}
        <button
          onClick={onOpenSearch}
          title="Search Movies & Shows"
          className="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:ring-2 focus:ring-rose-500"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Nav Item: Account */}
        <button
          onClick={onOpenProfile}
          title={currentUser ? "Account Settings" : "Sign In / Register"}
          className="p-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all relative focus:ring-2 focus:ring-rose-500"
        >
          <User className="w-5 h-5" />
          {currentUser && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#12141e]" />
          )}
        </button>

      </aside>

      {/* Ultra-Modern Floating Liquid Glass Mobile Bottom Dock */}
      <nav className="flex md:hidden fixed bottom-3 inset-x-4 z-40 glass-dock rounded-[26px] px-6 py-2.5 items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        
        {/* 1. Mobile: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
            activeTab === 'home' 
              ? 'text-rose-500 scale-110' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-rose-500/25 stroke-rose-500 stroke-[2.5]' : 'stroke-[2]'}`} />
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-rose-500 mt-1 shadow-sm shadow-rose-500" />
          )}
        </button>

        {/* 2. Mobile: Search / Explore */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Explore"
        >
          <Search className="w-5 h-5 stroke-[2]" />
        </button>

        {/* 3. Mobile: Add Movie / Admin Hub */}
        {(onOpenAutoFill || onOpenAdmin) && (
          <button
            onClick={onOpenAutoFill || onOpenAdmin}
            className="flex flex-col items-center justify-center -mt-5 transition-all active:scale-90"
            aria-label="Add New Movie"
            title="Auto-Fill & Add Movie"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-950/60 border-2 border-white/20">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[9px] font-bold text-amber-300 mt-0.5 tracking-tight">Add</span>
          </button>
        )}

        {/* 4. Mobile: Saved / Watchlist */}
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 relative ${
            activeTab === 'watchlist' 
              ? 'text-rose-500 scale-110' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Watchlist"
        >
          <Heart className={`w-5 h-5 ${activeTab === 'watchlist' ? 'fill-rose-500/25 stroke-rose-500 stroke-[2.5]' : 'stroke-[2]'}`} />
          {activeTab === 'watchlist' && (
            <span className="w-1 h-1 rounded-full bg-rose-500 mt-1 shadow-sm shadow-rose-500" />
          )}
          {watchlistCount > 0 && activeTab !== 'watchlist' && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c0e17]" />
          )}
        </button>

        {/* 4. Mobile: Profile / User */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>

      </nav>
    </>
  );
};
