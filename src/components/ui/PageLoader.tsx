import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const location = useLocation();
  const fadingRef = useRef(false);

  useEffect(() => {
    setIsVisible(true);
    setIsFading(false);
    fadingRef.current = false;
    let cancelled = false;

    const startFade = () => {
      if (cancelled || fadingRef.current) return;
      fadingRef.current = true;
      setTimeout(() => {
        if (cancelled) return;
        setIsFading(true);
        setTimeout(() => {
          if (!cancelled) setIsVisible(false);
        }, 500);
      }, 300);
    };

    // Continuously poll: only fade when ALL current images are complete
    // and the DOM has stabilized (no new images appearing)
    let lastImageCount = 0;
    let stableChecks = 0;

    const poll = setInterval(() => {
      if (cancelled || fadingRef.current) return;

      const images = Array.from(document.images);
      const total = images.length;

      if (total === 0) {
        // No images yet, keep waiting (up to fallback)
        return;
      }

      const allComplete = images.every(
        (img) => img.complete && img.naturalHeight > 0
      );

      if (allComplete) {
        // Check if image count is stable (no new images being added)
        if (total === lastImageCount) {
          stableChecks++;
        } else {
          stableChecks = 0;
          lastImageCount = total;
        }

        // Wait for 3 consecutive stable checks (~450ms of stability)
        if (stableChecks >= 3) {
          clearInterval(poll);
          startFade();
        }
      } else {
        // Reset stability counter if not all loaded
        stableChecks = 0;
        lastImageCount = total;
      }
    }, 150);

    // Hard fallback: 15 seconds max
    const fallback = setTimeout(() => {
      clearInterval(poll);
      startFade();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearTimeout(fallback);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#16493C' }}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
    </div>
  );
}
