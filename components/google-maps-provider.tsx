'use client';

import { useEffect, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent multiple initialization attempts
    let isMounted = true;

    const initializeMaps = async () => {
      try {
        await loadGoogleMaps();
        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
          console.error('Google Maps initialization error:', err);
        }
      }
    };

    // Only initialize if not already loaded
    if (!window.google?.maps?.places) {
      initializeMaps();
    } else {
      setIsLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Prevent duplicate Google Maps elements
  useEffect(() => {
    // Remove any duplicate Google Maps elements
    const removeDuplicateElements = () => {
      // List of all Google Maps element names that can be duplicated
      const googleMapsElementNames = [
        'gmp-internal-google-attribution',
        'gmp-internal-dialog',
        'gmp-internal-element-support-verification',
        'gmp-internal-basic-disclosure',
        'gmp-internal-basic-disclosure-section',
        'gmp-internal-attribution',
        'gmp-internal-link-button',
        'gmp-internal-rating',
        'gmp-internal-tabbed-layout',
        'gmp-internal-place-opening-hours',
        'gmp-internal-place-rating-summary',
        'gmp-internal-place-basic-info',
        'gmp-internal-place-review',
        'gmp-internal-status-text',
        'gmp-internal-circular-loader',
        'gmp-internal-place-carousel',
        'gmp-internal-place-search-list-item',
        'gmp-map',
        'gmp-place-autocomplete',
        'gmp-basic-place-autocomplete',
        'gmp-place-search',
        'gmp-place-text-search-request',
        'gmp-place-nearby-search-request',
        'gmp-place-details',
        'gmp-place-details-compact',
        'gmp-place-details-place-request',
        'gmp-place-details-location-request',
        'gmp-place-content-config',
        'gmp-place-standard-content',
        'gmp-place-all-content',
        'gmp-place-media',
        'gmp-place-address',
        'gmp-place-rating',
        'gmp-place-type',
        'gmp-place-price',
        'gmp-place-accessible-entrance-icon',
        'gmp-place-open-now-status',
        'gmp-place-attribution',
        'gmp-place-website',
        'gmp-place-phone-number',
        'gmp-place-opening-hours',
        'gmp-place-summary',
        'gmp-place-type-specific-highlights',
        'gmp-place-reviews',
        'gmp-place-plus-code',
        'gmp-place-feature-list',
        'gmp-internal-pin'
      ];
      
      googleMapsElementNames.forEach(elementName => {
        const elements = document.querySelectorAll(`[name="${elementName}"]`);
        
        // Keep only the first element of each type
        if (elements.length > 1) {
          console.log(`Removing ${elements.length - 1} duplicate ${elementName} elements`);
          for (let i = 1; i < elements.length; i++) {
            elements[i].remove();
          }
        }
      });
    };

    // Run immediately and also set up a mutation observer
    removeDuplicateElements();

    const observer = new MutationObserver(() => {
      removeDuplicateElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Prevent multiple Google Maps script loading
  useEffect(() => {
    const preventMultipleScripts = () => {
      // Check for multiple Google Maps script tags
      const scriptTags = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      
      if (scriptTags.length > 1) {
        console.warn(`Found ${scriptTags.length} Google Maps script tags, removing duplicates`);
        
        // Keep only the first script tag
        for (let i = 1; i < scriptTags.length; i++) {
          scriptTags[i].remove();
        }
      }
    };

    // Run immediately
    preventMultipleScripts();

    // Set up observer for script additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT' && element.getAttribute('src')?.includes('maps.googleapis.com')) {
                preventMultipleScripts();
              }
            }
          });
        }
      });
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (error) {
    console.warn('Google Maps failed to load:', error);
    // Continue rendering children even if Google Maps fails
  }

  return <>{children}</>;
} 