import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a vendor is currently open based on their working hours
 * @param activeHours - Array of working hours for each day
 * @returns boolean - true if vendor is open, false otherwise
 */
export const isVendorOpen = (activeHours?: Array<{
  day: string;
  openingTime: string;
  closingTime: string;
  isActive?: boolean;
}>): boolean => {
  if (!activeHours || activeHours.length === 0) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[currentDay];

  // Find today's hours - try multiple matching strategies
  let todayHours = activeHours.find(hour => 
    hour.day.toLowerCase() === currentDayName.toLowerCase()
  );

  // If not found, try matching just the first 3 characters (Mon, Tue, etc.)
  if (!todayHours) {
    todayHours = activeHours.find(hour => 
      hour.day.toLowerCase().substring(0, 3) === currentDayName.toLowerCase().substring(0, 3)
    );
  }

  if (!todayHours) {
    return false;
  }

  // Check if isActive field exists and is false
  if (todayHours.hasOwnProperty('isActive') && !todayHours.isActive) {
    return false;
  }

  // Parse time to minutes helper function
  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    
    // Handle different time formats
    const time = timeStr.toLowerCase().trim();
    
    // Handle "HH:MM AM/PM" format
    const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
    if (amPmMatch) {
      let hours = parseInt(amPmMatch[1]);
      const minutes = parseInt(amPmMatch[2]);
      const amPm = amPmMatch[3];
      
      if (amPm === 'pm' && hours !== 12) {
        hours += 12;
      } else if (amPm === 'am' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    }
    
    // Handle "HH:MM" format (24-hour)
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return hours * 60 + minutes;
    }
    
    return null;
  };

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const openTimeInMinutes = parseTimeToMinutes(todayHours.openingTime);
  const closeTimeInMinutes = parseTimeToMinutes(todayHours.closingTime);
  
  if (openTimeInMinutes === null || closeTimeInMinutes === null) {
    return false;
  }

  // Handle cases where closing time is next day (e.g., open until 2 AM)
  if (closeTimeInMinutes < openTimeInMinutes) {
    return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
  }

  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
};

/**
 * Check if a vendor is currently open based on their working hours and type
 * @param activeHours - Array of working hours for each day
 * @param vendorType - Type of vendor (restaurant, grocery, pharmacy)
 * @returns boolean - true if vendor is open, false otherwise
 */
export const isVendorOpenByType = (
  activeHours?: Array<{
    day: string;
    openingTime: string;
    closingTime: string;
    isActive?: boolean;
  }>,
  vendorType?: string
): boolean => {
  // Pharmacies are always open
  if (vendorType === 'pharmacy') {
    return true;
  }

  // For other vendor types, use the original isVendorOpen logic
  return isVendorOpen(activeHours);
};

/**
 * Safe localStorage utilities to handle quota exceeded errors
 */

// Maximum size for localStorage (4MB to be safe)
const MAX_LOCAL_STORAGE_SIZE = 4 * 1024 * 1024;

/**
 * Check if data size is within localStorage limits
 */
export const checkDataSize = (data: any): { size: number; isWithinLimit: boolean } => {
  const dataString = JSON.stringify(data);
  const size = new Blob([dataString]).size;
  return {
    size,
    isWithinLimit: size <= MAX_LOCAL_STORAGE_SIZE
  };
};

/**
 * Safely set localStorage item with size checking and compression
 */
export const safeSetLocalStorage = (key: string, data: any, compressIfNeeded = true): boolean => {
  try {
    const { size, isWithinLimit } = checkDataSize(data);
    
    if (isWithinLimit) {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
    
    if (!compressIfNeeded) {
      console.warn(`Data for key '${key}' is too large (${size} bytes), not storing`);
      return false;
    }
    
    console.warn(`Data for key '${key}' is too large (${size} bytes), attempting compression...`);
    
    // Try to clear some space first
    try {
      const keysToRemove = ['vendorDataCache', 'allData', 'deliveryCalculationData'];
      keysToRemove.forEach(keyToRemove => {
        try {
          localStorage.removeItem(keyToRemove);
        } catch {}
      });
    } catch (clearError) {
      console.warn('Failed to clear localStorage:', clearError);
    }
    
    // Try storing minimal data
    const minimalData = typeof data === 'object' && data !== null ? 
      Object.keys(data).reduce((acc, key) => {
        if (key === 'lastFetched' || key === 'timestamp') {
          acc[key] = data[key];
        }
        return acc;
      }, {} as any) : data;
    
    const { size: minimalSize, isWithinLimit: minimalWithinLimit } = checkDataSize(minimalData);
    
    if (minimalWithinLimit) {
      localStorage.setItem(key, JSON.stringify(minimalData));
      console.log(`Stored minimal data for key '${key}' (${minimalSize} bytes)`);
      return true;
    }
    
    console.warn(`Even minimal data for key '${key}' is too large (${minimalSize} bytes)`);
    return false;
    
  } catch (error) {
    console.warn(`Failed to store data for key '${key}':`, error);
    return false;
  }
};

/**
 * Get localStorage item with fallback
 */
export const safeGetLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to get data for key '${key}':`, error);
    return fallback;
  }
};

/**
 * Remove localStorage item safely
 */
export const safeRemoveLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove data for key '${key}':`, error);
    return false;
  }
};

/**
 * Clear specific localStorage keys
 */
export const clearLocalStorageKeys = (keys: string[]): void => {
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove key '${key}':`, error);
    }
  });
};

/**
 * Get localStorage usage statistics
 */
export const getLocalStorageUsage = (): { used: number; available: number; percentage: number } => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([key + value]).size;
        }
      }
    }
    
    const used = totalSize;
    const available = MAX_LOCAL_STORAGE_SIZE - used;
    const percentage = (used / MAX_LOCAL_STORAGE_SIZE) * 100;
    
    return { used, available, percentage };
  } catch (error) {
    console.warn('Failed to calculate localStorage usage:', error);
    return { used: 0, available: MAX_LOCAL_STORAGE_SIZE, percentage: 0 };
  }
};

/**
 * Clear localStorage and provide user feedback
 */
export const clearLocalStorageWithFeedback = (): { success: boolean; message: string } => {
  try {
    // Get usage before clearing
    const usageBefore = getLocalStorageUsage();
    
    // Clear localStorage
    localStorage.clear();
    
    // Get usage after clearing
    const usageAfter = getLocalStorageUsage();
    
    const freedSpace = usageBefore.used - usageAfter.used;
    
    return {
      success: true,
      message: `Successfully cleared localStorage. Freed ${(freedSpace / 1024 / 1024).toFixed(2)} MB of space.`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Get localStorage status for debugging
 */
export const getLocalStorageStatus = (): {
  isAvailable: boolean;
  usage: { used: number; available: number; percentage: number };
  keys: string[];
  totalItems: number;
} => {
  try {
    const usage = getLocalStorageUsage();
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    
    return {
      isAvailable: true,
      usage,
      keys,
      totalItems: localStorage.length
    };
  } catch (error) {
    return {
      isAvailable: false,
      usage: { used: 0, available: MAX_LOCAL_STORAGE_SIZE, percentage: 0 },
      keys: [],
      totalItems: 0
    };
  }
};

/**
 * Image loading utilities for LCP optimization
 */

/**
 * Check if an image should have priority loading (LCP candidate)
 */
export const shouldImageHavePriority = (
  src: string, 
  isAboveFold: boolean = false, 
  isHeroImage: boolean = false
): boolean => {
  // Always prioritize hero images and above-fold images
  if (isHeroImage || isAboveFold) {
    return true;
  }
  
  // Check if this is likely a main content image
  const isMainContentImage = src.includes('hero') || 
                            src.includes('banner') || 
                            src.includes('header') ||
                            src.includes('main') ||
                            src.includes('featured');
  
  return isMainContentImage;
};

/**
 * Get optimized image props for Next.js Image component
 */
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  options: {
    isAboveFold?: boolean;
    isHeroImage?: boolean;
    sizes?: string;
    className?: string;
  } = {}
): {
  src: string;
  alt: string;
  priority: boolean;
  sizes: string;
  className: string;
} => {
  const { isAboveFold = false, isHeroImage = false, sizes = "100vw", className = "" } = options;
  
  const priority = shouldImageHavePriority(src, isAboveFold, isHeroImage);
  
  return {
    src,
    alt,
    priority,
    sizes,
    className
  };
};

/**
 * Log LCP image warnings for debugging
 */
export const logLCPImageWarning = (src: string, componentName: string): void => {
  console.warn(
    `LCP Image Warning: Image "${src}" in component "${componentName}" should have priority prop. ` +
    `Add priority={true} to optimize Largest Contentful Paint.`
  );
};
