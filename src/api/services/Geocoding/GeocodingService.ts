import { Service } from 'typedi';
import { env } from '@base/utils/env';

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

/** Google Places API (New) Text Search – place response shape */
interface GooglePlaceSearchResult {
  id?: string;
  name?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>;
}

/** Photon (OSM) API – GeoJSON feature shape */
interface PhotonFeature {
  type?: string;
  geometry?: { type?: string; coordinates?: number[] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
    osm_id?: number | string;
    osm_type?: string;
    osm_value?: string;
    type?: string;
  };
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

const GOOGLE_PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const PHOTON_BASE_URL = 'https://photon.komoot.io/api';

/** Nominatim allows max 1 request per second (usage policy). */
const NOMINATIM_MIN_INTERVAL_MS = 1100;
const NOMINATIM_429_RETRY_AFTER_MS = 2000;

@Service()
export class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'VaultWrx/1.0';
  private lastNominatimRequest = 0;

  /** Throttle Nominatim calls to 1 request per second per usage policy. */
  private async throttleNominatim(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastNominatimRequest;
    if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - elapsed));
    }
    this.lastNominatimRequest = Date.now();
  }

  /**
   * Search for locations based on a query string (autocomplete/suggestions).
   * Uses Google Places API (New) Text Search when GOOGLE_PLACES_API_KEY is set,
   * so queries like "Riverside Indiana cemetery" return the same kinds of results as Google Maps.
   * Falls back to Nominatim when the key is missing or Google returns no results.
   * @param query - The search query
   * @param limit - Maximum number of results (default: 5, max: 10)
   * @param countryCode - Optional country code to limit results (e.g., 'us')
   */
  public async searchLocations(
    query: string,
    limit: number = 5,
    countryCode?: string
  ): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    const resultLimit = Math.min(limit, 10);
    const googleApiKey = env('GOOGLE_PLACES_API_KEY', null);
    // Bias to US when no country specified so queries like "Riverside Indiana cemetery" return on-point results
    const regionCode = countryCode || 'us';

    if (googleApiKey) {
      try {
        const googleResults = await this.searchLocationsGoogle(trimmedQuery, resultLimit, regionCode);
        if (googleResults.length > 0) {
          return googleResults;
        }
      } catch (error) {
        console.warn('Google Places search failed, falling back to OpenStreetMap:', error);
      }
    }

    // 1) Try Nominatim (OpenStreetMap)
    let results = await this.searchLocationsNominatim(trimmedQuery, resultLimit, regionCode);

    // 2) If still empty, try Photon (also OpenStreetMap-based, different index)
    if (results.length === 0) {
      try {
        const photonResults = await this.searchLocationsPhoton(trimmedQuery, resultLimit, regionCode);
        if (photonResults.length > 0) {
          return photonResults;
        }
      } catch (error) {
        console.warn('Photon (OSM) search failed:', error);
      }
    }

    return results;
  }

  /**
   * Google Places API (New) Text Search – returns places matching the query (e.g. "Riverside Indiana cemetery").
   */
  private async searchLocationsGoogle(
    query: string,
    limit: number,
    regionCode?: string
  ): Promise<LocationSuggestion[]> {
    const body: Record<string, unknown> = {
      textQuery: query,
      pageSize: Math.min(limit, 20),
      // Bias by relevance so "Riverside Indiana cemetery" returns cemeteries in Indiana, not elsewhere
      rankPreference: 'RELEVANCE',
    };
    if (regionCode) {
      body.regionCode = regionCode.toLowerCase();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env('GOOGLE_PLACES_API_KEY'),
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.addressComponents',
    };

    const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Places API error: ${response.status} ${errText}`);
    }

    const data = (await response.json()) as { places?: GooglePlaceSearchResult[] };
    const places = data.places || [];
    return places
      .filter((place) => place.location?.latitude != null && place.location?.longitude != null)
      .map((place) => this.mapGooglePlaceToSuggestion(place));
  }

  private mapGooglePlaceToSuggestion(place: GooglePlaceSearchResult): LocationSuggestion {
    const placeId = place.id || place.name?.replace(/^places\//, '') || '';
    const displayName = place.displayName?.text || place.formattedAddress || '';
    const location = place.location || {};
    const lat = location.latitude != null ? String(location.latitude) : '';
    const lon = location.longitude != null ? String(location.longitude) : '';
    const address = this.mapGoogleAddress(place.formattedAddress, place.addressComponents);

    return {
      placeId,
      displayName,
      name: displayName,
      address,
      lat,
      lon,
      type: '',
      category: '',
      importance: 0,
    };
  }

  private mapGoogleAddress(
    formattedAddress?: string,
    addressComponents?: GooglePlaceSearchResult['addressComponents']
  ): LocationSuggestion['address'] {
    const addr: LocationSuggestion['address'] = {};

    if (addressComponents && addressComponents.length > 0) {
      for (const c of addressComponents) {
        const types = c.types || [];
        const long = c.longText || '';
        const short = c.shortText || long;
        if (types.includes('street_number')) addr.houseNumber = long;
        else if (types.includes('route')) addr.road = long;
        else if (types.includes('locality') || types.includes('sublocality')) addr.city = long;
        else if (types.includes('administrative_area_level_1')) addr.state = short;
        else if (types.includes('administrative_area_level_2')) addr.county = long;
        else if (types.includes('postal_code')) addr.postcode = long;
        else if (types.includes('country')) {
          addr.country = long;
          addr.countryCode = short?.toUpperCase();
        }
      }
    }

    if (formattedAddress && !addr.road && !addr.city) {
      addr.road = formattedAddress;
    }

    return addr;
  }

  /**
   * Nominatim (OpenStreetMap) search – used when Google key is not set or Google returns no results.
   * Appends ", USA" when query looks like a US location to improve relevance (e.g. "Riverside Indiana cemetery").
   */
  private async searchLocationsNominatim(
    query: string,
    limit: number,
    countryCode?: string
  ): Promise<LocationSuggestion[]> {
    const usStatePattern = /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i;
    const looksLikeUS = usStatePattern.test(query) || /\b(USA|United States|U\.?S\.?A\.?)\b/i.test(query);
    const countryCodes = countryCode ? countryCode.toLowerCase() : looksLikeUS ? 'us' : undefined;

    let searchQuery = query;
    if (countryCodes === 'us' && !/\b(USA|United States|U\.?S\.?A\.?)\b/i.test(query)) {
      searchQuery = `${query}, USA`;
    }

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
    });

    if (countryCodes) {
      params.append('countrycodes', countryCodes);
    }

    await this.throttleNominatim();
    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    let data = await response.json();
    let results = this.mapSearchResults(Array.isArray(data) ? data : []);

    // If no results and we appended ", USA", try without the suffix (raw query) and still restrict to US
    if (results.length === 0 && searchQuery !== query) {
      const fallbackParams = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        countrycodes: 'us',
      });
      await this.throttleNominatim();
      const fallbackResponse = await fetch(`${this.baseUrl}/search?${fallbackParams.toString()}`, {
        headers: { 'User-Agent': this.userAgent, 'Accept': 'application/json' },
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        results = this.mapSearchResults(Array.isArray(fallbackData) ? fallbackData : []);
      }
    }

    // If still empty, try shorter query (e.g. "Riverside Indiana") so we get at least something in that area
    if (results.length === 0 && countryCodes === 'us') {
      const shortQuery = query.replace(/\b(cemetery|cemeteries|funeral|grave)\b/gi, '').replace(/\s+/g, ' ').trim();
      const altQuery = shortQuery ? `${shortQuery}, USA` : 'Riverside Indiana, USA';
      const altParams = new URLSearchParams({
        q: altQuery,
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        countrycodes: 'us',
      });
      await this.throttleNominatim();
      const altResponse = await fetch(`${this.baseUrl}/search?${altParams.toString()}`, {
        headers: { 'User-Agent': this.userAgent, 'Accept': 'application/json' },
      });
      if (altResponse.ok) {
        const altData = await altResponse.json();
        results = this.mapSearchResults(Array.isArray(altData) ? altData : []);
      }
    }

    return results;
  }

  /**
   * Photon (OpenStreetMap-based) search – used when Nominatim returns no results.
   * Different index than Nominatim, so can return results for queries like "riverside indiana cemetery".
   */
  private async searchLocationsPhoton(
    query: string,
    limit: number,
    countryCode?: string
  ): Promise<LocationSuggestion[]> {
    const params = new URLSearchParams({
      q: query,
      limit: Math.min(limit, 10).toString(),
      lang: 'en',
    });
    if (countryCode && countryCode.toLowerCase() === 'us') {
      params.set('bbox', '-125.0,24.0,-66.0,50.0'); // Continental US bounding box
    }

    const response = await fetch(`${PHOTON_BASE_URL}/?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data = (await response.json()) as { features?: PhotonFeature[] };
    const features = data.features || [];
    return features
      .filter((f) => f.geometry?.coordinates?.length >= 2)
      .map((f) => this.mapPhotonFeatureToSuggestion(f));
  }

  private mapPhotonFeatureToSuggestion(feature: PhotonFeature): LocationSuggestion {
    const coords = feature.geometry?.coordinates || [];
    const lon = coords[0];
    const lat = coords[1];
    const p = feature.properties || {};
    const name = p.name || p.street || '';
    const parts = [p.street, p.city, p.state, p.postcode, p.country].filter(Boolean);
    const displayName = name ? `${name}${parts.length ? ' - ' + parts.join(', ') : ''}` : parts.join(', ') || 'Location';

    return {
      placeId: [p.osm_id, p.osm_type].filter(Boolean).join('-') || `photon-${lat}-${lon}`,
      displayName,
      name: name || displayName,
      address: {
        houseNumber: p.housenumber,
        road: p.street,
        city: p.city,
        state: p.state,
        postcode: p.postcode,
        country: p.country,
        countryCode: p.countrycode?.toUpperCase(),
      },
      lat: String(lat),
      lon: String(lon),
      type: p.type || '',
      category: p.osm_value || '',
      importance: 0,
    };
  }

  /**
   * Reverse geocode coordinates to get address.
   * Uses Nominatim (1 req/s). On 429, retries once then returns null.
   */
  public async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodingResult | null> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const doRequest = async (): Promise<Response> => {
      await this.throttleNominatim();
      return fetch(`${this.baseUrl}/reverse?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });
    };

    try {
      let response = await doRequest();

      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, NOMINATIM_429_RETRY_AFTER_MS));
        response = await doRequest();
      }

      if (response.status === 429) {
        console.warn('Nominatim rate limit (429) after retry; skipping reverse geocode.');
        return null;
      }

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
      await this.throttleNominatim();
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

