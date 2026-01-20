/**
 * Production-ready API client for communicating with Express backend using Axios
 * Follows industry best practices for error handling, retries, and security
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://vaultwrx-backend.netlify.app';
const API_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || '30000',
  10
);
const MAX_RETRY_ATTEMPTS = parseInt(
  process.env.NEXT_PUBLIC_API_MAX_RETRIES || '3',
  10
);
const RETRY_DELAY = parseInt(
  process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000',
  10
);
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: any;
  timestamp?: string;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
  retry?: boolean;
  retryCount?: number;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId?: string;
    startTime?: number;
    retryCount?: number;
  };
}

export class ApiClientError extends Error {
  code?: string | number;
  status?: number;
  details?: any;
  timestamp: string;

  constructor(
    message: string,
    code?: string | number,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: false,
  validateStatus: (status) => status < 500
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const extendedConfig = config as ExtendedAxiosRequestConfig;
    extendedConfig.metadata = {
      ...extendedConfig.metadata,
      requestId,
      startTime: Date.now()
    };

    if (!(config as ApiRequestConfig).skipAuth) {
      const explicitToken = (config.headers as any)?.Authorization?.replace(
        'Bearer ',
        ''
      );

      const token = explicitToken || getStoredAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (IS_DEVELOPMENT) {
        // eslint-disable-next-line no-console
        console.warn(
          `[API Client] No access token found for request: ${config.method?.toUpperCase()} ${config.url}`
        );
      }

      const userData = getStoredUserData();
      if (userData?.company_id) {
        config.headers['x-company-id'] = userData.company_id;
      }
    }

    config.headers['X-Request-ID'] = requestId;

    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          requestId,
          headers: config.headers,
          data: config.data
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as ExtendedAxiosRequestConfig;
    const duration = config.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : 0;

    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data
        }
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as ExtendedAxiosRequestConfig &
      ApiRequestConfig;

    if (!error.response) {
      const apiError = new ApiClientError(
        error.message || 'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0,
        { originalError: error.message }
      );

      if (config && shouldRetry(error, config)) {
        return retryRequest(config);
      }

      if (IS_DEVELOPMENT) {
        // eslint-disable-next-line no-console
        console.error('[API Network Error]', apiError);
      }

      return Promise.reject(apiError);
    }

    const status = error.response.status;
    const responseData = error.response.data as any;

    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      getDefaultErrorMessage(status) ||
      'An unexpected error occurred';

    const apiError = new ApiClientError(
      errorMessage,
      responseData?.code || `HTTP_${status}`,
      status,
      {
        response: responseData,
        url: error.config?.url,
        method: error.config?.method
      }
    );

    switch (status) {
      case 401:
        handleUnauthorized();
        break;
      case 403:
        apiError.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        apiError.message = 'The requested resource was not found.';
        break;
      case 429:
        if (config && shouldRetry(error, config)) {
          const retryAfter =
            parseInt(error.response.headers['retry-after'] || '0', 10) * 1000 ||
            RETRY_DELAY * 2;
          await delay(retryAfter);
          return retryRequest(config);
        }
        apiError.message = 'Too many requests. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        if (config && shouldRetry(error, config)) {
          return retryRequest(config);
        }
        apiError.message = 'Server error. Please try again later.';
        break;
    }

    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Error]', {
        status,
        message: apiError.message,
        details: apiError.details
      });
    }

    return Promise.reject(apiError);
  }
);

export interface UserData {
  id: string;
  email: string;
  role: string;
  roleType: string;
  company_id: string;
  owned_company_id?: string | null;
  retailer?: {
    id: string;
    company: {
      id: string;
      name: string;
    };
  };
  permissions: Array<{ resource: string; action: string }>;
}

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('access_token') || null;
  } catch {
    return null;
  }
}

function setStoredAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('access_token', token);
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to store access token:', error);
    }
  }
}

function removeStoredAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('access_token');
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to remove access token:', error);
    }
  }
}

function getStoredUserData(): UserData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

function setStoredUserData(userData: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('user_data', JSON.stringify(userData));
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to store user data:', error);
    }
  }
}

function removeStoredUserData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('user_data');
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to remove user data:', error);
    }
  }
}

// ============================================================================
// Token Expiry Management
// ============================================================================

function getStoredTokenExpiry(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const expiry = localStorage.getItem('token_expiry');
    return expiry ? parseInt(expiry, 10) : null;
  } catch {
    return null;
  }
}

function setStoredTokenExpiry(expiryTimestamp: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('token_expiry', expiryTimestamp.toString());
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to store token expiry:', error);
    }
  }
}

function removeStoredTokenExpiry(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('token_expiry');
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error('[API Client] Failed to remove token expiry:', error);
    }
  }
}

/**
 * Parse expires_in value and calculate expiry timestamp
 * Supports formats: "1h", "24h", "7d", "30m", or numeric seconds
 */
function parseExpiresIn(expiresIn: string | number): number {
  const now = Date.now();

  if (typeof expiresIn === 'number') {
    // Assume seconds
    return now + expiresIn * 1000;
  }

  const value = parseInt(expiresIn, 10);
  if (isNaN(value)) {
    // Default to 1 hour if parsing fails
    return now + 60 * 60 * 1000;
  }

  const unit = expiresIn.replace(/[0-9]/g, '').toLowerCase();

  switch (unit) {
    case 'd':
      return now + value * 24 * 60 * 60 * 1000;
    case 'h':
      return now + value * 60 * 60 * 1000;
    case 'm':
      return now + value * 60 * 1000;
    case 's':
      return now + value * 1000;
    default:
      // Assume seconds if no unit
      return now + value * 1000;
  }
}

/**
 * Check if the current token is expired
 * Returns true if expired or no expiry is set
 */
function checkTokenExpired(): boolean {
  const expiry = getStoredTokenExpiry();
  if (!expiry) {
    // If no expiry stored, check if we have a token
    // If we have a token but no expiry, assume it's valid (for backwards compatibility)
    return !getStoredAccessToken();
  }

  // Add a 30-second buffer to handle clock skew and give time for logout
  const buffer = 30 * 1000;
  return Date.now() >= expiry - buffer;
}

/**
 * Get the remaining time until token expires in milliseconds
 * Returns 0 if expired or no expiry is set
 */
function getTokenTimeRemaining(): number {
  const expiry = getStoredTokenExpiry();
  if (!expiry) {
    return 0;
  }

  const remaining = expiry - Date.now();
  return remaining > 0 ? remaining : 0;
}

function getDefaultErrorMessage(status: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    401: 'Authentication required. Please sign in.',
    403: 'Access denied. You do not have permission.',
    404: 'Resource not found.',
    409: 'Conflict. The resource already exists.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error. Please try again later.',
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. The request took too long.'
  };

  return errorMessages[status] || `HTTP ${status} error occurred.`;
}

function shouldRetry(
  error: AxiosError,
  config: ExtendedAxiosRequestConfig & ApiRequestConfig
): boolean {
  if (config.retry === false) {
    return false;
  }

  if (
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500
  ) {
    return error.response.status === 429;
  }

  const retryCount = config.metadata?.retryCount || 0;
  return retryCount < MAX_RETRY_ATTEMPTS;
}

async function retryRequest(
  config: ExtendedAxiosRequestConfig & ApiRequestConfig
): Promise<AxiosResponse> {
  const retryCount = (config.metadata?.retryCount || 0) + 1;
  const delayTime = RETRY_DELAY * Math.pow(2, retryCount - 1);

  await delay(delayTime);

  config.metadata = {
    ...config.metadata,
    retryCount
  };

  if (IS_DEVELOPMENT) {
    // eslint-disable-next-line no-console
    console.log(`[API Retry] Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}`, {
      url: config.url,
      delay: `${delayTime}ms`
    });
  }

  return axiosInstance.request(config);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleUnauthorized(): void {
  removeStoredAccessToken();
  removeStoredUserData();
  removeStoredTokenExpiry();

  if (typeof window !== 'undefined') {
    if (!window.location.pathname.startsWith('/auth/')) {
      window.location.href = '/auth/sign-in';
    }
  }
}

export async function login(
  email: string,
  password: string
): Promise<
  ApiResponse<{ access_token: string; user: UserData; expires_in: string }>
> {
  try {
    const response = await axiosInstance.post(
      '/api/login',
      { email, password },
      { skipAuth: true } as ApiRequestConfig
    );

    if (response.data?.access_token) {
      setStoredAccessToken(response.data.access_token);
    }

    if (response.data?.user) {
      setStoredUserData(response.data.user);
    }

    // Store token expiry if provided
    if (response.data?.expires_in) {
      const expiryTimestamp = parseExpiresIn(response.data.expires_in);
      setStoredTokenExpiry(expiryTimestamp);
    }

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message || error.message || 'Login failed',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getUserInfo(accessToken?: string): Promise<ApiResponse> {
  try {
    if (accessToken) {
      setStoredAccessToken(accessToken);
    }

    const token = accessToken || getStoredAccessToken();

    if (!token) {
      return {
        error: new ApiClientError(
          'Access token is required for authentication',
          'MISSING_TOKEN',
          401
        ),
        success: false
      };
    }

    const response = await axiosInstance.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    } as ApiRequestConfig);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(error.message),
      success: false
    };
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  config: ApiRequestConfig = {},
  accessToken?: string
): Promise<ApiResponse<T>> {
  try {
    if (accessToken) {
      setStoredAccessToken(accessToken);
    }

    if (!config.skipAuth) {
      const token = accessToken || getStoredAccessToken();

      if (!token) {
        return {
          error: new ApiClientError(
            'Access token is required for this request',
            'MISSING_TOKEN',
            401
          ),
          success: false
        };
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }

    const response = await axiosInstance.request<T>({
      url: endpoint,
      ...config
    });

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(error.message),
      success: false
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),
  post: <T = any>(endpoint: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'POST', data }),
  put: <T = any>(endpoint: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'PUT', data }),
  patch: <T = any>(endpoint: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'PATCH', data }),
  delete: <T = any>(endpoint: string, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' })
};

export function getAccessToken(): string | null {
  return getStoredAccessToken();
}

export function setAccessToken(token: string): void {
  setStoredAccessToken(token);
}

export function clearAccessToken(): void {
  removeStoredAccessToken();
}

export function getUserData(): UserData | null {
  return getStoredUserData();
}

export function setUserData(userData: UserData): void {
  setStoredUserData(userData);
}

export function clearUserData(): void {
  removeStoredUserData();
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getTokenExpiry(): number | null {
  return getStoredTokenExpiry();
}

export function setTokenExpiry(expiresIn: string | number): void {
  const expiryTimestamp = parseExpiresIn(expiresIn);
  setStoredTokenExpiry(expiryTimestamp);
}

export function clearTokenExpiry(): void {
  removeStoredTokenExpiry();
}

export function isTokenExpired(): boolean {
  return checkTokenExpired();
}

export function getTimeUntilExpiry(): number {
  return getTokenTimeRemaining();
}

export async function getOrders(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: any[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/orders${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch orders',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getGroupedOrders(
  queryParams?: Record<string, any>
): Promise<ApiResponse<any[]>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(
      `/api/orders/grouped-by-date-and-product-type${queryString}`
    );

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch grouped orders',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getOrder(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<any>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/orders/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch order',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function updateOrder(
  id: string,
  orderData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await axiosInstance.put(`/api/orders/${id}`, orderData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update order',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getCustomers(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: any[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/customers${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch customers',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getCustomer(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<any>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(
      `/api/customers/${id}${queryString}`
    );

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch customer',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function createCustomer(
  customerData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await axiosInstance.post('/api/customers', customerData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create customer',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function updateCustomer(
  id: string,
  customerData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await axiosInstance.put(
      `/api/customers/${id}`,
      customerData
    );

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update customer',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function deleteCustomer(id: string): Promise<ApiResponse<void>> {
  try {
    await axiosInstance.delete(`/api/customers/${id}`);

    return {
      data: undefined,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to delete customer',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function createOrder(orderData: any): Promise<ApiResponse<any>> {
  try {
    const response = await axiosInstance.post('/api/orders/create', orderData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create order',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// Geocoding / Location Autocomplete
export interface GeocodingResult {
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
  type?: string;
  category?: string;
}

export async function searchLocations(
  query: string
): Promise<ApiResponse<GeocodingResult[]>> {
  try {
    if (!query || query.length < 2) {
      return { data: [], success: true };
    }
    
    const response = await axiosInstance.get('/api/geocoding/autocomplete', {
      params: { query }
    });

    // Handle various response structures
    const responseData = response.data;
    let results: GeocodingResult[] = [];
    
    if (Array.isArray(responseData)) {
      results = responseData;
    } else if (responseData?.predictions && Array.isArray(responseData.predictions)) {
      results = responseData.predictions;
    } else if (responseData?.results && Array.isArray(responseData.results)) {
      results = responseData.results;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      results = responseData.data;
    } else if (responseData?.rows && Array.isArray(responseData.rows)) {
      results = responseData.rows;
    }

    return {
      data: results,
      success: true
    };
  } catch (error: any) {
    return {
      data: [],
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to search locations',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export interface LocationData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive: boolean;
  color?: string;
  isDefault: boolean;
  companyId: string;
  retailerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive?: boolean;
  color?: string;
  isDefault?: boolean;
}

export async function getLocations(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: LocationData[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/locations${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch locations',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getLocation(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<LocationData>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/locations/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch location',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function createLocation(
  locationData: CreateLocationRequest
): Promise<ApiResponse<LocationData>> {
  try {
    const response = await axiosInstance.post('/api/locations', locationData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create location',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function updateLocation(
  id: string,
  locationData: Partial<CreateLocationRequest>
): Promise<ApiResponse<LocationData>> {
  try {
    const response = await axiosInstance.put(`/api/locations/${id}`, locationData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update location',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function deleteLocation(id: string): Promise<ApiResponse<void>> {
  try {
    await axiosInstance.delete(`/api/locations/${id}`);

    return {
      data: undefined,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to delete location',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Colors API
// ============================================================================

export enum ColorType {
  PAINT_COLOR = 'paint_color',
  LOCATION_COLOR = 'location_color'
}

export interface ColorData {
  id: string;
  name: string;
  hexCode?: string;
  type: ColorType;
  description?: string;
  isActive: boolean;
  companyId?: string;
  retailerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColorRequest {
  name: string;
  hexCode?: string;
  type?: ColorType;
  description?: string;
  isActive?: boolean;
}

export async function getColors(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: ColorData[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/colors${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch colors',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function getColor(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<ColorData>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/colors/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch color',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function createColor(
  colorData: CreateColorRequest
): Promise<ApiResponse<ColorData>> {
  try {
    const response = await axiosInstance.post('/api/colors', colorData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create color',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function updateColor(
  id: string,
  colorData: Partial<CreateColorRequest>
): Promise<ApiResponse<ColorData>> {
  try {
    const response = await axiosInstance.put(`/api/colors/${id}`, colorData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update color',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export async function deleteColor(id: string): Promise<ApiResponse<void>> {
  try {
    await axiosInstance.delete(`/api/colors/${id}`);

    return {
      data: undefined,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to delete color',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Primary Contacts (Funeral Directors) API
// ============================================================================

export interface PrimaryContact {
  id: string;
  user_id?: string | null;
  company_id: string;
  customer_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: Date | string | null;
  isVerified: boolean;
  specialization?: string | null;
  yearsOfExperience?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    isActive?: boolean;
  } | null;
  company?: {
    id: string;
    name?: string;
  };
  customer?: {
    id: string;
    user_id?: string;
  };
}

export interface PrimaryContactsResponse {
  success: boolean;
  data: PrimaryContact[];
  count: number;
}

export interface CreatePrimaryContactRequest {
  company_id: string;
  customer_id: string;
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
}

/**
 * Get primary contacts (funeral directors) for a specific customer
 */
export async function getPrimaryContactsByCustomer(
  customerId: string
): Promise<ApiResponse<PrimaryContact[]>> {
  try {
    const response = await axiosInstance.get(
      `/api/funeral-directors/customer/${customerId}`
    );

    return {
      data: response.data?.data || [],
      success: true
    };
  } catch (error: any) {
    return {
      data: [],
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch primary contacts',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Get primary contacts (funeral directors) for a specific company
 */
export async function getPrimaryContactsByCompany(
  companyId: string
): Promise<ApiResponse<PrimaryContact[]>> {
  try {
    const response = await axiosInstance.get(
      `/api/funeral-directors/company/${companyId}`
    );

    return {
      data: response.data?.data || [],
      success: true
    };
  } catch (error: any) {
    return {
      data: [],
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch primary contacts',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Create a new primary contact for a customer
 */
export async function createPrimaryContact(
  contactData: CreatePrimaryContactRequest
): Promise<ApiResponse<PrimaryContact>> {
  try {
    const response = await axiosInstance.post(
      '/api/funeral-directors/primary-contact',
      contactData
    );

    return {
      data: response.data?.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create primary contact',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Helper to get display name for a primary contact
 */
export function getPrimaryContactDisplayName(contact: PrimaryContact): string {
  if (contact.name) {
    return contact.name;
  }
  if (contact.user) {
    const firstName = contact.user.first_name || '';
    const lastName = contact.user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (contact.user.email) return contact.user.email;
  }
  return contact.email || contact.id;
}

// ============================================================================
// Holidays API
// ============================================================================

export interface Holiday {
  id: string;
  retailerId: string;
  companyId?: string | null;
  name: string;
  date: string;
  description?: string | null;
  isRecurring: boolean;
  isClosed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HolidaysResponse {
  success: boolean;
  data: Holiday[];
}

/**
 * Get all holidays for a retailer
 */
export async function getHolidaysByRetailer(
  retailerId: string
): Promise<ApiResponse<Holiday[]>> {
  try {
    const response = await axiosInstance.get(`/api/holidays/retailer/${retailerId}`);
    return {
      data: response.data?.data || [],
      success: true
    };
  } catch (error: any) {
    return {
      data: [],
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch holidays',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Get all holidays for a company
 */
export async function getHolidaysByCompany(
  companyId: string
): Promise<ApiResponse<Holiday[]>> {
  try {
    const response = await axiosInstance.get(`/api/holidays/company/${companyId}`);
    return {
      data: response.data?.data || [],
      success: true
    };
  } catch (error: any) {
    return {
      data: [],
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch holidays',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Staff API
// ============================================================================

export interface StaffMember {
  id: string;
  user_id: string;
  company_id: string;
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    isActive: boolean;
    role?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateStaffRequest {
  user_id: string;
  company_id: string;
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  isActive?: boolean;
}

/**
 * Get all staff members for the current company
 */
export async function getStaff(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: StaffMember[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '?includes=user,user.role';
    const response = await axiosInstance.get(`/api/staff${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch staff',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<StaffMember>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '?includes=user';
    const response = await axiosInstance.get(`/api/staff/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch staff member',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Create a new staff member
 */
export async function createStaff(
  staffData: CreateStaffRequest
): Promise<ApiResponse<StaffMember>> {
  try {
    const response = await axiosInstance.post('/api/staff', staffData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create staff member',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Update a staff member
 */
export async function updateStaff(
  id: string,
  staffData: Partial<CreateStaffRequest>
): Promise<ApiResponse<StaffMember>> {
  try {
    const response = await axiosInstance.put(`/api/staff/${id}`, staffData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update staff member',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Delete a staff member
 */
export async function deleteStaff(id: string): Promise<ApiResponse<void>> {
  try {
    await axiosInstance.delete(`/api/staff/${id}`);

    return {
      data: undefined,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to delete staff member',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Users API
// ============================================================================

export interface UserMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  company_id?: string;
  isActive: boolean;
  role?: {
    id: string;
    name: string;
  };
  retailer?: {
    id: string;
    company_id: string;
  };
  staff?: {
    id: string;
    position?: string;
  };
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id: string;
  company_id?: string;
  isActive?: boolean;
}

/**
 * Get all users
 */
export async function getUsers(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: UserMember[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '?includes=role,retailer';
    const response = await axiosInstance.get(`/api/users${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch users',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(
  id: number,
  queryParams?: Record<string, any>
): Promise<ApiResponse<UserMember>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '?includes=role';
    const response = await axiosInstance.get(`/api/users/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch user',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<ApiResponse<UserMember>> {
  try {
    const response = await axiosInstance.post('/api/users', userData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to create user',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Update a user
 */
export async function updateUser(
  id: number,
  userData: Partial<CreateUserRequest>
): Promise<ApiResponse<UserMember>> {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, userData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update user',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  try {
    await axiosInstance.delete(`/api/users/${id}`);

    return {
      data: undefined,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to delete user',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Audit Logs API
// ============================================================================

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditResource {
  ORDER = 'order',
  PRODUCT = 'product',
  CUSTOMER = 'customer',
  STAFF = 'staff',
  LOCATION = 'location',
  COLOR = 'color',
  SERVICE_EXTRA = 'service_extra',
  COMPANY = 'company',
  USER = 'user',
  RETAILER = 'retailer',
  FUNERAL_DIRECTOR = 'funeral_director',
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

/**
 * Get all audit logs for the current company
 */
export async function getAuditLogs(
  queryParams?: Record<string, any>
): Promise<ApiResponse<{ total_data: number; rows: AuditLog[] }>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/audit-logs${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch audit logs',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<AuditLog>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    const response = await axiosInstance.get(`/api/audit-logs/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch audit log',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

// ============================================================================
// Company API
// ============================================================================

export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  fax?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
  type: string;
  retailer_id?: string;
  createdAt: string;
  updatedAt: string;
  retailer?: {
    id: string;
    businessLicense?: string;
    taxId?: string;
    isVerified: boolean;
  };
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  fax?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
  type?: string;
}

/**
 * Get company by ID
 */
export async function getCompanyById(
  id: string,
  queryParams?: Record<string, any>
): Promise<ApiResponse<CompanyData>> {
  try {
    const queryString = queryParams
      ? '?' + new URLSearchParams(queryParams).toString()
      : '?includes=retailer';
    const response = await axiosInstance.get(`/api/companies/${id}${queryString}`);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to fetch company',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Update company by ID
 */
export async function updateCompany(
  id: string,
  companyData: UpdateCompanyRequest
): Promise<ApiResponse<CompanyData>> {
  try {
    const response = await axiosInstance.put(`/api/companies/${id}`, companyData);

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to update company',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

/**
 * Upload company logo
 */
export async function uploadCompanyLogo(
  companyId: string,
  file: File
): Promise<ApiResponse<{ logoUrl: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      `/api/companies/${companyId}/upload-logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      data: response.data,
      success: true
    };
  } catch (error: any) {
    return {
      error:
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error.response?.data?.message ||
                error.message ||
                'Failed to upload logo',
              error.response?.data?.code,
              error.response?.status
            ),
      success: false
    };
  }
}

export { axiosInstance };
