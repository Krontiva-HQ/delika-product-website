import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '@/components/location';

interface LocationInputProps {
    label: string;
    onLocationSelect: (location: LocationData) => void;
    prefillData?: LocationData;
    disabled?: boolean;
}

interface Suggestion {
    description: string;
    place_id: string;
}

export default function LocationInput({ label, onLocationSelect, prefillData, disabled }: LocationInputProps) {
    const [value, setValue] = useState(prefillData?.address || '');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Google Maps services
    useEffect(() => {
        // Add script only if it hasn't been added yet
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAdv28EbwKXqvlKo2henxsKMD-4EKB20l8&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                // Initialize services after script loads
                autocompleteService.current = new google.maps.places.AutocompleteService();
                const dummyDiv = document.createElement('div');
                const map = new google.maps.Map(dummyDiv, {});
                placesService.current = new google.maps.places.PlacesService(map);
            };

            document.head.appendChild(script);
        }

        // Click outside handler
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (prefillData && !value) {
            setValue(prefillData.address);
            onLocationSelect(prefillData);
        }
    }, [prefillData, value, onLocationSelect]);

    // Handle input changes
    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setValue(inputValue);

        if (!inputValue || inputValue.length < 3 || !autocompleteService.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const request = {
                input: inputValue,
                componentRestrictions: { country: 'gh' },
                location: new google.maps.LatLng(5.6037, -0.1870), // Accra
                radius: 50000 // 50km
            };

            autocompleteService.current.getPlacePredictions(
                request,
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion: Suggestion) => {
        if (!placesService.current) return;

        placesService.current.getDetails(
            { placeId: suggestion.place_id },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    const location: LocationData = {
                        address: place.formatted_address || '',
                        name: place.name || '',
                        latitude: place.geometry?.location?.lat() || 0,
                        longitude: place.geometry?.location?.lng() || 0,
                        city: place.address_components?.find(component => component.types.includes('administrative_area_level_2'))?.long_name || ''
                    };

                    setValue(location.address);
                    onLocationSelect(location);
                    setShowSuggestions(false);
                }
            }
        );
    };

    return (
        <div className="w-full" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    disabled={disabled}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm 
                               focus:ring-purple-500 focus:border-purple-500
                               disabled:bg-gray-50 disabled:text-gray-500"
                />
                
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg 
                                    max-h-60 rounded-md py-1 text-base overflow-auto">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                                {suggestion.description}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}