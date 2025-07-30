declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not defined');
    return Promise.reject(new Error('Google Maps API key is not defined'));
  }

  // Check if Google Maps is already loaded (by any method)
  if (window.google && window.google.maps && window.google.maps.places) {
    isLoaded = true;
    return Promise.resolve();
  }

  // If we already have a loading promise, return it
  if (loadPromise) {
    return loadPromise;
  }

  // Check if there's already a Google Maps script tag
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Script exists, wait for it to load
    loadPromise = new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          isLoaded = true;
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isLoaded) {
          console.error('Google Maps failed to load within timeout');
          loadPromise = null;
        }
      }, 10000);
    });
    return loadPromise;
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    try {
      // Set up the callback function
      window.initMap = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      // Create script element with proper async loading
      const script = document.createElement("script");
      script.id = "google-maps-custom";
      
      // Use the recommended loading pattern with loading=async
      const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=initMap&loading=async`;
      script.src = url;
      script.async = true;
      script.defer = true;
      
      // Add error handling
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        isLoading = false;
        loadPromise = null;
        reject(new Error("Failed to load Google Maps API"));
      };

      // Add load event handler
      script.onload = () => {
        // The script has loaded, but we need to wait for the callback
        // The initMap callback will handle the actual resolution
      };

      // Append to head
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in loadGoogleMaps:', error);
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });

  return loadPromise;
} 