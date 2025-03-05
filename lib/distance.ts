import { loadGoogleMaps } from "./google-maps";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const calculateDistance = async (origin: Coordinates, destination: Coordinates): Promise<number> => {
  await loadGoogleMaps();
  
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [{ lat: origin.latitude, lng: origin.longitude }],
        destinations: [{ lat: destination.latitude, lng: destination.longitude }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const distance = response.rows[0]?.elements[0]?.distance?.value;
          // Convert meters to kilometers
          resolve(distance ? distance / 1000 : 0);
        } else {
          reject(new Error('Failed to calculate distance'));
        }
      }
    );
  });
};

export const calculateDeliveryFee = (distance: number): number => {
  if (distance <= 1) {
    return 15; // Fixed fee for distances up to 1km
  } else if (distance <= 2) {
    return 20; // Fixed fee for distances between 1km and 2km
  } else if (distance <= 10) {
    // For distances > 2km and <= 10km: 17 cedis base price + 2.5 cedis per km beyond 2km
    return 17 + ((distance - 2) * 2.5);
  } else {
    // For distances above 10km: 3.5 * distance + 20
    return (3.5 * distance) + 20;
  }
}; 