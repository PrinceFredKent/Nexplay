import React, { useState } from 'react';
import { Layers, Plus, Play, Trash2, Sparkles, Film, ArrowRight, X } from 'lucide-react';
import { CustomCollection, MediaItem } from '../types/movie';
import { getCustomCollections, saveCustomCollections } from '../services/storageService';
import { MediaCard } from './MediaCard';

interface CollectionsViewProps {
  activeProfileId: string;
  allCatalog: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onOpenDetails: (media: MediaItem) => void;
  watchlistIds: number[];
  onToggleWatchlist: (mediaId: number) => void;
  favoriteIds: number[];
  onToggleFavorite: (mediaId: number) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  activeProfileId,
  allCatalog,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  favoriteIds,
  onToggleFavorite
}) => {
  const [collections, setCollections] = useState<CustomCollection[]>(() => getCustomCollections(activeProfileId));
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || '');
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

  const activeCollection = collections.find(c => c.id === activeCollectionId) || collections[0];
  const activeItems = allCatalog.filter(m => activeCollection?.mediaIds.includes(m.id));

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: CustomCollection = {
      id: `col-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom curated watchlist',
      mediaIds: selectedMediaIds.length > 0 ? selectedMediaIds : [allCatalog[0]?.id, allCatalog[1]?.id].filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newCol, ...collections];
    setCollections(updated);
    saveCustomCollections(activeProfileId, updated);
    setActiveCollectionId(newCol.id);
    setIsCreatingModal(false);
    setNewTitle('');
    setNewDescription('');
    setSelectedMediaIds([]);
  };

  const handleDeleteCollection = (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    saveCustomCollections(activeProfileId, updated);
    if (activeCollectionId === id && updated.length > 0) {
      setActiveCollectionId(updated[0].id);
    }
  };

  const toggleSelectMedia = (id: number) => {
    setSelectedMediaIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Playlists</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Custom Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Group your favorite cinematic franchises, mood marathons, and binge lists.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Selector Bar */}
      {collections.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCollectionId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeCollection?.id === c.id
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
              }`}
            >
              <span>{c.title}</span>
              <span className="font-mono-data opacity-60">({c.mediaIds.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Collection Showcase */}
      {activeCollection ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{activeCollection.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{activeCollection.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteCollection(activeCollection.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                title="Delete collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {activeItems.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                isInWatchlist={watchlistIds.includes(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                isFavorite={favoriteIds.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10 p-8 space-y-4 max-w-lg mx-auto">
          <Layers className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No collections created yet</h3>
          <p className="text-xs text-slate-400">
            Create your first themed movie marathon list now!
          </p>
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl glass-dropdown p-6 space-y-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Create New Collection
              </h3>
              <button onClick={() => setIsCreatingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Collection Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Weekend Cyberpunk Marathon, Christopher Nolan Epics..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief note about this curated playlist..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Select items */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Add Films & Series</label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {allCatalog.map(item => {
                    const isSelected = selectedMediaIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectMedia(item.id)}
                        className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border transition-colors ${
                          isSelected ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={item.posterPath} alt={item.title} className="w-6 h-8 rounded object-cover" />
                          <span className="text-xs font-medium truncate">{item.title}</span>
                        </div>
                        <span className="text-xs font-mono-data text-slate-400">{item.releaseDate.slice(0, 4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
