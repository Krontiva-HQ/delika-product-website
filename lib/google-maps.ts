declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;

export function loadGoogleMaps(): Promise<void> {
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
    window.initMap = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    const script = document.createElement("script");
    script.id = "google-maps";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding&callback=initMap`;
    script.async = true;
    script.onerror = () => {
      isLoading = false;
      reject(new Error("Failed to load Google Maps API"));
    };

    document.head.appendChild(script);
  });
} 