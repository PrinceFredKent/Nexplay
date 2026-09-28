import { useEffect } from 'react';

interface TvRemoteNavigationOptions {
  onBack?: () => void;
  onPlayPause?: () => void;
}

export function useTvRemoteNavigation({ onBack, onPlayPause }: TvRemoteNavigationOptions = {}) {
  useEffect(() => {
    // Directional keys
    const isDirectionalKey = (key: string, keyCode: number) => {
      return (
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        keyCode === 38 ||
        keyCode === 40 ||
        keyCode === 37 ||
        keyCode === 39 ||
        keyCode === 29460 || // Tizen / WebOS up
        keyCode === 29461    // Tizen / WebOS down
      );
    };

    // Back keys (Escape, Android TV Remote Back, Tizen 10009, WebOS 461)
    const isBackKey = (key: string, keyCode: number, isInput: boolean) => {
      // NEVER treat Backspace / keyCode 8 as a navigation back key
      if (key === 'Backspace' || keyCode === 8) {
        return false;
      }

      // If typing in any input field or textarea, only Escape closes the modal or dismisses
      if (isInput) {
        return key === 'Escape' || keyCode === 27;
      }

      return (
        key === 'Escape' ||
        key === 'Back' ||
        key === 'BrowserBack' ||
        keyCode === 27 ||
        keyCode === 10009 ||
        keyCode === 461
      );
    };

    // Media keys
    const isMediaPlayPause = (key: string, keyCode: number) => {
      return (
        key === 'MediaPlayPause' ||
        key === 'MediaPlay' ||
        key === 'MediaPause' ||
        keyCode === 415 ||
        keyCode === 19 ||
        keyCode === 179
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Add TV remote active indicator to document
      if (!document.body.classList.contains('tv-navigation-active')) {
        document.body.classList.add('tv-navigation-active');
      }

      // Detect if user is focused on an input, textarea, select, or contenteditable element
      const target = e.target as HTMLElement | null;
      const activeEl = document.activeElement as HTMLElement | null;
      const targetTag = target?.tagName?.toLowerCase() || '';
      const activeTag = activeEl?.tagName?.toLowerCase() || '';
      
      const isInput = 
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        Boolean(target?.isContentEditable) ||
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        Boolean(activeEl?.isContentEditable) ||
        ['input', 'textarea', 'select'].includes(targetTag) ||
        ['input', 'textarea', 'select'].includes(activeTag);

      // If user is pressing Backspace, always preserve standard native character deletion!
      if (e.key === 'Backspace' || e.keyCode === 8) {
        return;
      }

      // 1. Handle Back Key
      if (isBackKey(e.key, e.keyCode, isInput)) {
        if (onBack) {
          e.preventDefault();
          onBack();
          return;
        }
      }

      // 2. Handle Media Play/Pause
      if (isMediaPlayPause(e.key, e.keyCode)) {
        if (onPlayPause) {
          e.preventDefault();
          onPlayPause();
          return;
        }
      }

      // 3. Handle Directional Navigation (D-Pad)
      if (isDirectionalKey(e.key, e.keyCode) && !isInput) {
        e.preventDefault();

        // Get container scope (if modal is open, scope to top modal, else document)
        const openModal = document.querySelector<HTMLElement>('[role="dialog"], .fixed.inset-0.z-50');
        const container = openModal || document.body;

        // Query all focusable interactive elements
        const focusableSelector = [
          'button:not([disabled])',
          'a[href]',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
          '[role="button"]'
        ].join(', ');

        const focusables = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
          });

        if (focusables.length === 0) return;

        const currentEl = document.activeElement as HTMLElement | null;
        
        // If nothing is focused yet, focus the first visible candidate
        if (!currentEl || !focusables.includes(currentEl)) {
          const first = focusables[0];
          first.focus();
          first.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          return;
        }

        const currentRect = currentEl.getBoundingClientRect();
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;

        let bestCandidate: HTMLElement | null = null;
        let bestDistance = Infinity;

        const direction = e.key === 'ArrowUp' || e.keyCode === 38 ? 'up'
          : e.key === 'ArrowDown' || e.keyCode === 40 ? 'down'
          : e.key === 'ArrowLeft' || e.keyCode === 37 ? 'left'
          : 'right';

        for (const candidate of focusables) {
          if (candidate === currentEl) continue;

          const rect = candidate.getBoundingClientRect();
          const candCenterX = rect.left + rect.width / 2;
          const candCenterY = rect.top + rect.height / 2;

          const dx = candCenterX - currentCenterX;
          const dy = candCenterY - currentCenterY;

          // Spatial cone filters
          let isValid = false;
          let primaryDist = 0;
          let secondaryDist = 0;

          if (direction === 'right') {
            if (candCenterX > currentCenterX + 5) {
              isValid = true;
              primaryDist = dx;
              secondaryDist = Math.abs(dy);
            }
          } else if (direction === 'left') {
            if (candCenterX < currentCenterX - 5) {
              isValid = true;
              primaryDist = -dx;
              secondaryDist = Math.abs(dy);
            }
          } else if (direction === 'down') {
            if (candCenterY > currentCenterY + 5) {
              isValid = true;
              primaryDist = dy;
              secondaryDist = Math.abs(dx);
            }
          } else if (direction === 'up') {
            if (candCenterY < currentCenterY - 5) {
              isValid = true;
              primaryDist = -dy;
              secondaryDist = Math.abs(dx);
            }
          }

          if (isValid) {
            // Give higher weight to alignment along the primary axis
            const distance = primaryDist + secondaryDist * 2.2;
            if (distance < bestDistance) {
              bestDistance = distance;
              bestCandidate = candidate;
            }
          }
        }

        if (bestCandidate) {
          bestCandidate.focus();
          bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, onPlayPause]);
}
