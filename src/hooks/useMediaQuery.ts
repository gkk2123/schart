// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Clean up
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Predefined breakpoints matching Tailwind CSS
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)'); // sm breakpoint
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)'); // sm to lg
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg and up
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)'); // xl and up

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen: isMobile || isTablet,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
}