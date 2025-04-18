// js/geocodingService.js

class ReverseGeocodingService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org/reverse';
    }

    async reverseGeocode(lat, lng, zoom) {
        const url = `${this.baseUrl}?lat=${lat}&lon=${lng}&zoom=${zoom}&format=json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Reverse geocoding failed.");
            }
            const data = await response.json();
            return data.display_name;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return "Unable to fetch address.";
        }
    }
    setBaseUrl(url) {
        this.baseUrl = url;
    }
}

export default ReverseGeocodingService;