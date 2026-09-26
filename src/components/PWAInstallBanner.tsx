import React, { useState } from 'react';
import { Sparkles, Download, X, Smartphone, ArrowDown } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) return null;

  return (
    <>
      {/* Subtle In-App Install Banner */}
      {(isInstallable || isIOS) && (
        <div className="bg-gradient-to-r from-rose-950/70 via-indigo-950/60 to-[#090a0f] border-b border-rose-500/20 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-slate-200">
                Install <strong>Lumina Stream</strong> for instant offline movie playback and fullscreen streaming.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isInstallable && (
                <button
                  onClick={install}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Install Now
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors"
                >
                  Install on iOS
                </button>
              )}

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Sheet */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl glass-dropdown p-6 space-y-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                Install on iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.04]">
                <span className="font-mono-data font-bold text-rose-400">1.</span>
                <span>Tap the <strong>Share</strong> icon in the Safari toolbar at the bottom of your screen.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.04]">
                <span className="font-mono-data font-bold text-rose-400">2.</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.04]">
                <span className="font-mono-data font-bold text-rose-400">3.</span>
                <span>Launch Lumina from your home screen for full native offline streaming!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
