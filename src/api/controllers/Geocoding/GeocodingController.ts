import { Get, JsonController, QueryParam, UseBefore, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { GeocodingService, LocationSuggestion, ReverseGeocodingResult } from '@api/services/Geocoding/GeocodingService';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { BadRequestError } from 'routing-controllers';
import { Request } from 'express';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/geocoding')
@UseBefore(AuthCheck)
export class GeocodingController {
  constructor(private geocodingService: GeocodingService) {}

  /**
   * Search for location suggestions based on query string (autocomplete)
   * @param q - Search query (minimum 2 characters)
   * @param limit - Maximum number of results (1-10, default: 5)
   * @param country - Optional country code to filter results (e.g., 'us', 'ca')
   */
  @Get('/search')
  @OpenAPI({
    summary: 'Search for location suggestions',
    description: 'Provides autocomplete suggestions for locations based on the search query using Nominatim (OpenStreetMap)',
  })
  public async searchLocations(
    @Req() request: Request,
    @QueryParam('q') query?: string,
    @QueryParam('limit') limit?: number,
    @QueryParam('country') country?: string
  ): Promise<{ success: boolean; data: LocationSuggestion[] }> {
    // Get query from request.query directly as fallback
    const searchQuery = query || (request.query.q as string) || (request.query.query as string);
    const searchLimit = limit || parseInt(request.query.limit as string) || 5;
    const searchCountry = country || (request.query.country as string);

    if (!searchQuery || searchQuery.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters');
    }

    const results = await this.geocodingService.searchLocations(
      searchQuery,
      searchLimit,
      searchCountry
    );

    return {
      success: true,
      data: results,
    };
  }

  /**
   * Autocomplete endpoint (alias for search)
   * @param q - Search query (minimum 2 characters)
   * @param limit - Maximum number of results (1-10, default: 5)
   * @param country - Optional country code to filter results
   */
  @Get('/autocomplete')
  @OpenAPI({
    summary: 'Location autocomplete',
    description: 'Provides autocomplete suggestions for locations (alias for /search)',
  })
  public async autocomplete(
    @Req() request: Request,
    @QueryParam('q') query?: string,
    @QueryParam('limit') limit?: number,
    @QueryParam('country') country?: string
  ): Promise<{ success: boolean; data: LocationSuggestion[] }> {
    return this.searchLocations(request, query, limit, country);
  }

  /**
   * Reverse geocode coordinates to get address
   * @param lat - Latitude
   * @param lon - Longitude
   */
  @Get('/reverse')
  @OpenAPI({
    summary: 'Reverse geocoding',
    description: 'Get address from coordinates',
  })
  public async reverseGeocode(
    @QueryParam('lat') lat: number,
    @QueryParam('lon') lon: number
  ): Promise<{ success: boolean; data: ReverseGeocodingResult | null }> {
    if (lat === undefined || lon === undefined) {
      throw new BadRequestError('Latitude and longitude are required');
    }

    if (lat < -90 || lat > 90) {
      throw new BadRequestError('Latitude must be between -90 and 90');
    }

    if (lon < -180 || lon > 180) {
      throw new BadRequestError('Longitude must be between -180 and 180');
    }

    const result = await this.geocodingService.reverseGeocode(lat, lon);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Search with structured address components
   */
  @Get('/search-structured')
  @OpenAPI({
    summary: 'Structured address search',
    description: 'Search for locations using individual address components',
  })
  public async searchStructured(
    @QueryParam('street') street?: string,
    @QueryParam('city') city?: string,
    @QueryParam('state') state?: string,
    @QueryParam('postalCode') postalCode?: string,
    @QueryParam('country') country?: string
  ): Promise<{ success: boolean; data: LocationSuggestion[] }> {
    if (!street && !city && !state && !postalCode && !country) {
      throw new BadRequestError('At least one address component is required');
    }

    const results = await this.geocodingService.searchStructured(
      street,
      city,
      state,
      postalCode,
      country
    );

    return {
      success: true,
      data: results,
    };
  }
}

