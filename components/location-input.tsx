import React, { useState, useEffect, useRef } from 'react';
import { DeliveryLocationData } from '@/components/location';
import { loadGoogleMaps } from "@/lib/google-maps"

interface LocationInputProps {
    label: string;
    onLocationSelect: (location: DeliveryLocationData) => void;
    prefillData?: DeliveryLocationData;
    disabled?: boolean;
}

interface GooglePlace {
    description: string;
    place_id: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, onLocationSelect, prefillData, disabled }) => {
    const [address, setAddress] = useState(prefillData?.name || prefillData?.address || '');
    const [suggestions, setSuggestions] = useState<GooglePlace[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const initializationRef = useRef<boolean>(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (prefillData && (prefillData.name || prefillData.address)) {
            const newAddress = prefillData.name || prefillData.address;
            // Only update if the address is actually different
            if (newAddress !== address) {
                setAddress(newAddress);
                onLocationSelect(prefillData);
            }
        }
    }, [prefillData]); // Removed onLocationSelect to prevent loops

    useEffect(() => {
        // Prevent multiple initialization attempts
        if (initializationRef.current || isInitialized || isLoading) {
            return;
        }

        initializationRef.current = true;
        setIsLoading(true);

        const initializeGoogleMaps = async () => {
            try {
                await loadGoogleMaps();
                
                if (!window.google?.maps?.places) {
                    throw new Error('Google Maps Places API not available');
                }

                if (!mapRef.current) {
                    throw new Error('Map container not found');
                }

                // Initialize services
                const autoCompleteService = new window.google.maps.places.AutocompleteService();
                const mapDiv = mapRef.current;
                const map = new window.google.maps.Map(mapDiv, {
                    center: { lat: 5.6037, lng: -0.1870 },
                    zoom: 13,
                    disableDefaultUI: true
                });
                const placesServiceInstance = new window.google.maps.places.PlacesService(map);

                setAutocompleteService(autoCompleteService);
                setPlacesService(placesServiceInstance);
                setIsInitialized(true);
                
            } catch (error) {
                console.error('Error initializing Google Maps services:', error);
                // Reset initialization flag on error to allow retry
                initializationRef.current = false;
            } finally {
                setIsLoading(false);
            }
        };

        initializeGoogleMaps();
    }, []); // Empty dependency array - only run once

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddress(value);

        if (value.length > 2 && autocompleteService && window.google?.maps?.places) {
            try {
                const request = {
                    input: value,
                    componentRestrictions: { country: 'gh' },
                    location: new google.maps.LatLng(5.6037, -0.1870), // Accra coordinates
                    radius: 50000 // 50km radius
                };

                autocompleteService.getPlacePredictions(request, (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                });
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (place: GooglePlace) => {
        if (placesService) {
            placesService.getDetails(
                { placeId: place.place_id },
                (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                        const placeName = result.name || place.description.split(',')[0] || '';
                        const locationData: DeliveryLocationData = {
                            longitude: result.geometry?.location?.lng() || 0,
                            latitude: result.geometry?.location?.lat() || 0,
                            name: placeName,
                            address: result.formatted_address || '',
                            city: result.address_components?.find(component => component.types.includes('administrative_area_level_2'))?.long_name || ''
                        };

                        // Show the place name instead of formatted address in the input
                        setAddress(placeName);
                        setSuggestions([]);
                        setShowSuggestions(false);
                        onLocationSelect(locationData);
                    }
                }
            );
        }
    };

    return (
        <div className="w-full" style={{ width: '100%' }} ref={wrapperRef}>
            <div ref={mapRef} style={{ display: 'none' }}></div>
            <label className="block text-[14px] leading-[22px] font-sans text-black mb-2">{label}</label>
            <div className="relative w-full" style={{ width: '100%' }}>
                <input
                    placeholder={`Enter delivery ${label.toLowerCase()} location`}
                    value={address}
                    onChange={handleInputChange}
                    disabled={disabled || isLoading}
                    style={{ width: '100%' }}
                    className={`font-sans w-full border-[#efefef] border-[1px] border-solid [outline:none]
                    text-[13px] bg-[#fff] rounded-[8px]
                    py-[14px] px-[20px]
                    text-[#201a18] placeholder:text-[#b1b4b3]
                    box-border ${disabled || isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />

                {showSuggestions && suggestions.length > 0 && !isLoading && (
                    <div className="font-sans absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                        style={{ width: '100%' }}>
                        {suggestions.map((suggestion, index) => {
                            const parts = suggestion.description.split(',');
                            const placeName = parts[0];
                            const location = parts.slice(1).join(',').trim();
                            
                            return (
                                <div
                                    key={index}
                                    className="font-sans px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleSelect(suggestion)}
                                >
                                    <div className="font-medium text-gray-900">{placeName}</div>
                                    {location && (
                                        <div className="text-xs text-gray-500 mt-1">{location}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationInput;