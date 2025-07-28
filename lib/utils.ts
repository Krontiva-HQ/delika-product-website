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

  // Get current time in minutes
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
