'use client';

import { useEffect } from 'react';

interface BrowserHistoryManagerProps {
  onBackButton?: () => void;
  pageType?: 'home' | 'vendors' | 'restaurant' | 'grocery' | 'pharmacy';
  slug?: string;
}

export function BrowserHistoryManager({ 
  onBackButton, 
  pageType = 'home',
  slug 
}: BrowserHistoryManagerProps) {
  useEffect(() => {
    // Add history entry for this page without interfering with natural back button behavior
    if (typeof window !== 'undefined') {
      const state = { 
        page: pageType, 
        slug,
        timestamp: Date.now() 
      };
      
      // Only replace state if we don't already have a valid history entry
      // This prevents interfering with natural browser navigation
      if (!window.history.state || window.history.state.page !== pageType) {
        window.history.replaceState(state, '', window.location.href);
      }
    }

    // No popstate event listener - let browser handle back button naturally
    return () => {
      // Cleanup if needed
    };
  }, [pageType, slug]);

  return null; // This component doesn't render anything
} 