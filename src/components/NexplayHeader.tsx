import React from 'react';
import { Search, Bell, ChevronDown, User, Sparkles, Settings } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfileData } from '../services/firebase';
import { DEFAULT_NETFLIX_AVATAR } from '../services/netflixAvatars';

interface NexplayHeaderProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSearch: () => void;
  onOpenSettings?: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onOpenProfile: () => void;
  onOpenAutoFill?: () => void;
}

export const NexplayHeader: React.FC<NexplayHeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenSettings,
  currentUser,
  userProfile,
  onOpenProfile,
  onOpenAutoFill
}) => {
  const categories = ['Movies', 'TV Series', 'Animation', 'Mistery', 'More'];

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Sign In';
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL || DEFAULT_NETFLIX_AVATAR;

  return (
    <header className="w-full pb-2">
      
      {/* Main Nexplay Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Search Bar Capsule, Settings Button & Auto-Fill Importer Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div 
            onClick={onOpenSearch}
            className="relative flex-1 sm:w-64 flex items-center px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/10 cursor-pointer hover:bg-white/[0.12] transition-all text-xs text-slate-300 group shrink-0"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5 group-hover:text-white transition-colors" />
            <span className="truncate">Search movies & series...</span>
          </div>

          {/* Settings Button Next to Search */}
          <button
            type="button"
            onClick={onOpenSettings || onOpenSearch}
            className="p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-slate-300 hover:text-white transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Search Filters & Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {onOpenAutoFill && (
            <button
              onClick={onOpenAutoFill}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              title="Type a movie title to auto-fill description, cast, genres & free streaming links"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span className="hidden md:inline">Auto-Fill Movie</span>
            </button>
          )}
        </div>

        {/* Center: Category Pill Tabs */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-full">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-200 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right: Notifications & Profile Pill */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Notification bell button */}
          <button 
            onClick={onOpenSearch}
            className="p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-slate-300 hover:text-white transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Profile / Sign-In Capsule Pill */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all text-xs text-white ${
              currentUser
                ? 'bg-white/[0.08] hover:bg-white/[0.15] border-white/10'
                : 'bg-rose-600/30 hover:bg-rose-600/50 border-rose-500/40'
            }`}
          >
            {currentUser ? (
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-white/30"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="font-semibold text-xs truncate max-w-[120px]">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

        </div>

      </div>

    </header>
  );
};
