declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;

export function loadGoogleMaps(): Promise<void> {
  // Add debug logging
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not defined');
    return Promise.reject(new Error('Google Maps API key is not defined'));
  }

  if (isLoaded) return Promise.resolve();
  if (isLoading) return new Promise((resolve) => {
    const checkLoaded = setInterval(() => {
      if (isLoaded) {
        clearInterval(checkLoaded);
        resolve();
      }
    }, 100);
  });

  isLoading = true;

  return new Promise((resolve, reject) => {
    try {
      window.initMap = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      const script = document.createElement("script");
      script.id = "google-maps";
      const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=initMap`;
      script.src = url;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        isLoading = false;
        reject(new Error("Failed to load Google Maps API"));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in loadGoogleMaps:', error);
      isLoading = false;
      reject(error);
    }
  });
} 