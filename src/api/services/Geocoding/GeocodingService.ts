import { Service } from 'typedi';

export interface LocationSuggestion {
  placeId: string;
  displayName: string;
  name: string;
  address: {
    houseNumber?: string;
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  lat: string;
  lon: string;
  type: string;
  category: string;
  importance: number;
  boundingBox?: string[];
}

export interface ReverseGeocodingResult {
  placeId: string;
  displayName: string;
  address: {
    houseNumber?: string;
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
  };
  lat: string;
  lon: string;
}

@Service()
export class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'VaultWrx/1.0';

  /**
   * Search for locations based on a query string (autocomplete/suggestions)
   * @param query - The search query
   * @param limit - Maximum number of results (default: 5, max: 10)
   * @param countryCode - Country code to limit results (default: 'US')
   */
  public async searchLocations(
    query: string,
    limit: number = 5,
    countryCode: string = 'US'
  ): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    } 

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      addressdetails: '1',
      limit: Math.min(limit, 10).toString(),
    });

    if (countryCode) {
      params.append('countrycodes', countryCode.toLowerCase());
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapSearchResults(data);
    } catch (error) {
      console.error('Geocoding search error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param lat - Latitude
   * @param lon - Longitude
   */
  public async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodingResult | null> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      addressdetails: '1',
    });

    try {
      const response = await fetch(`${this.baseUrl}/reverse?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        return null;
      }

      return {
        placeId: data.place_id?.toString() || '',
        displayName: data.display_name || '',
        address: this.mapAddress(data.address || {}),
        lat: data.lat || '',
        lon: data.lon || '',
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Search for addresses with structured query
   * @param street - Street address
   * @param city - City name
   * @param state - State/province
   * @param postalCode - Postal/ZIP code
   * @param country - Country name or code
   */
  public async searchStructured(
    street?: string,
    city?: string,
    state?: string,
    postalCode?: string,
    country?: string
  ): Promise<LocationSuggestion[]> {
    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: '5',
    });

    if (street) params.append('street', street);
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (postalCode) params.append('postalcode', postalCode);
    if (country) params.append('country', country);

    try {
      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapSearchResults(data);
    } catch (error) {
      console.error('Structured geocoding error:', error);
      throw error;
    }
  }

  private mapSearchResults(data: any[]): LocationSuggestion[] {
    return data.map((item) => ({
      placeId: item.place_id?.toString() || '',
      displayName: item.display_name || '',
      name: item.name || '',
      address: this.mapAddress(item.address || {}),
      lat: item.lat || '',
      lon: item.lon || '',
      type: item.type || '',
      category: item.class || '',
      importance: item.importance || 0,
      boundingBox: item.boundingbox || [],
    }));
  }

  private mapAddress(address: any) {
    return {
      houseNumber: address.house_number,
      road: address.road,
      city: address.city || address.town || address.village || address.municipality,
      county: address.county,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
      countryCode: address.country_code?.toUpperCase(),
    };
  }
}

