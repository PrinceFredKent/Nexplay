import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  Film, 
  Users, 
  Radio, 
  Database, 
  Check, 
  AlertCircle,
  Flame,
  Clapperboard,
  Settings
} from 'lucide-react';
import { MediaItem } from '../types/movie';
import { MASTER_MEDIA_CATALOG } from '../services/catalogService';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  onOpenAutoFill: () => void;
  catalogItems: MediaItem[];
  onRemoveCatalogItem: (id: number) => void;
  onToggleFeatureItem: (id: number) => void;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onOpenAutoFill,
  catalogItems,
  onRemoveCatalogItem,
  onToggleFeatureItem
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'users' | 'system'>('catalog');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0b0d14] border border-amber-500/30 shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden my-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <Crown className="w-5 h-5 fill-amber-300 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-display tracking-tight">
                  Super Admin Control Center
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
                  EXCLUSIVE: princefredkent@gmail.com
                </span>
              </div>
              <p className="text-xs text-slate-400">Full platform authorization • Catalog editor • User permissions • System controls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-[#0b0d14] text-amber-400 border-t-2 border-amber-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Catalog Management ({catalogItems.length} Titles)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#0b0d14] text-amber-400 border-t-2 border-amber-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Roles & RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'system'
                ? 'bg-[#0b0d14] text-amber-400 border-t-2 border-amber-500 border-x border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">Master Movie & TV Catalog Control</h3>
                  <p className="text-xs text-slate-400">Add new blockbusters with auto-fill or delete items from the live feed.</p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAutoFill();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Auto-Fill & Add New Movie</span>
                </button>
              </div>

              {/* Items Table / List */}
              <div className="space-y-2">
                {catalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="w-12 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded uppercase">
                            {item.type}
                          </span>
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.genres?.join(' • ')}</p>
                        <span className="text-[10px] text-emerald-400 font-mono">★ {item.voteAverage} | {item.releaseDate?.slice(0, 4)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onToggleFeatureItem(item.id);
                          showToast(`Toggled feature status for "${item.title}"`);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                          item.isFeatured
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{item.isFeatured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onRemoveCatalogItem(item.id);
                          showToast(`Removed "${item.title}" from catalog.`);
                        }}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors"
                        title="Delete from catalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Security Rules</h3>
                    <p className="text-xs text-slate-400">Configured in <code className="text-amber-300">firestore.rules</code> with zero-trust validation.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">Super Admin (Full Access)</span>
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-xs font-mono text-white block">princefredkent@gmail.com</span>
                    <p className="text-[11px] text-slate-300">
                      Full read/write/delete access across all Firestore collections (`/users`, `/catalog`, `/system`).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Standard Streaming User</span>
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 block">All Other Authenticated Emails</span>
                    <p className="text-[11px] text-slate-400">
                      Access restricted strictly to personal watchlist, favorites, and watch history (`/users/{'{userId}'}`).
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Firestore Security Deployment</h4>
                  <p className="text-[11px] text-slate-400">Deployed rules version 2 to Firebase Project <code className="text-rose-400">ai-studio-streamsync-312cd8d5-306b-473e-94b9-4d16c05b1b61</code></p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                  ● LIVE & DEPLOYED
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Express Backend API Proxy</h4>
                  <p className="text-[11px] text-slate-400">Node.js server listening on port 3000 handling <code className="text-rose-400">/api/search-movie</code> requests</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                  ● ACTIVE
                </span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
