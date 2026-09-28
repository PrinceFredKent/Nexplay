import React from 'react';
import { X, Bell, Film, Sparkles, CheckCheck, Play, DownloadCloud, Tv } from 'lucide-react';
import { MediaItem } from '../types/movie';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'release' | 'feature' | 'system';
  media?: MediaItem;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayMedia: (media: MediaItem) => void;
  featuredMedia?: MediaItem[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onPlayMedia,
  featuredMedia = []
}) => {
  if (!isOpen) return null;

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'New 4K Release Available',
      message: 'Love, Death & Robots Season 3 is now streaming in 4K Ultra HD with HDR10 audio.',
      time: '10m ago',
      type: 'release',
      media: featuredMedia[0]
    },
    {
      id: '2',
      title: 'High-Speed CDN Active',
      message: 'All 6 stream servers (SuperEmbed, AutoEmbed, VidSrc) are running at 60fps edge caching.',
      time: '1h ago',
      type: 'system'
    },
    {
      id: '3',
      title: 'Offline Downloads Ready',
      message: 'You can download full episodes for offline viewing without consuming mobile data.',
      time: '3h ago',
      type: 'feature'
    },
    {
      id: '4',
      title: 'Trending Blockbusters Added',
      message: 'Dune: Part Two & Arcane Season 2 have been added to the master cinema collection.',
      time: 'Yesterday',
      type: 'release',
      media: featuredMedia[1] || featuredMedia[0]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#12141e] border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notifications</h3>
              <p className="text-[11px] text-slate-400">Stream alerts & new releases</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 space-y-2 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-4">
                {item.message}
              </p>

              {item.media && (
                <div className="pl-4 pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-rose-400 truncate max-w-[200px]">
                    {item.media.title}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      if (item.media) onPlayMedia(item.media);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md transition-all active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Play Now</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">All feeds updated</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
