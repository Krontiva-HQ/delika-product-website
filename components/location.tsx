/**
 * Represents delivery location data including coordinates and address information
 * Used for storing and managing delivery addresses throughout the application
 */
export interface DeliveryLocationData {
    /** Longitude coordinate of the delivery location */
    longitude: number;
    /** Latitude coordinate of the delivery location */
    latitude: number;
    /** Name or label of the delivery location */
    name: string;
    /** Full delivery address */
    address: string;
    /** City of the delivery location */
    city: string;
}