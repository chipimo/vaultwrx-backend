'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  getUserInfo,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  getUserData,
  setUserData,
  clearUserData,
  setTokenExpiry,
  clearTokenExpiry,
  isTokenExpired,
  getTimeUntilExpiry,
  type UserData
} from '@/lib/api-client';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for authentication
 * Works with Express API backend using access tokens
 */
export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const storedUserData = getUserData();

      // Check if token is expired first
      if (token && isTokenExpired()) {
        // Token expired, clear everything and redirect
        clearAccessToken();
        clearUserData();
        clearTokenExpiry();
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (token && storedUserData) {
        // Use persisted user data
        setUser(storedUserData);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (token) {
        // Token exists but no user data - fetch from backend
        setIsAuthenticated(true);
        const userInfo = await getUserInfo();
        if (userInfo.success && userInfo.data) {
          setUser(userInfo.data);
          // Store user data for future use
          if (userInfo.data) {
            setUserData(userInfo.data);
          }
        } else {
          // Token invalid, clear everything
          clearAccessToken();
          clearUserData();
          clearTokenExpiry();
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      } else {
        // No token - not authenticated
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(
    async (accessToken: string, userData?: UserData, expiresIn?: string | number) => {
      try {
        // Store the token
        setAccessToken(accessToken);

        // Store token expiry if provided
        if (expiresIn) {
          setTokenExpiry(expiresIn);
        }

        // Use provided user data or fetch from backend
        if (userData) {
          setUserData(userData);
          setUser(userData);
          setIsAuthenticated(true);
          return userData;
        } else {
          // Fetch user info if not provided
          const userInfo = await getUserInfo(accessToken);
          if (userInfo.success && userInfo.data) {
            setUserData(userInfo.data);
            setUser(userInfo.data);
            setIsAuthenticated(true);
            return userInfo.data;
          } else {
            throw new Error(
              userInfo.error?.message || 'Failed to authenticate'
            );
          }
        }
      } catch (error: any) {
        clearAccessToken();
        clearUserData();
        clearTokenExpiry();
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      }
    },
    []
  );

  const signOut = useCallback(async (reason?: 'manual' | 'expired') => {
    try {
      clearAccessToken();
      clearUserData();
      clearTokenExpiry();
      setIsAuthenticated(false);
      setUser(null);
      
      // Include reason in redirect if token expired
      const redirectUrl = reason === 'expired' 
        ? '/auth/sign-in?expired=true' 
        : '/auth/sign-in';
      router.push(redirectUrl);
    } catch (error: any) {
      // Even if there's an error, clear local state
      clearAccessToken();
      clearUserData();
      clearTokenExpiry();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/auth/sign-in');
    }
  }, [router]);

  // Check if token is expired
  const checkTokenValidity = useCallback(() => {
    if (isTokenExpired()) {
      signOut('expired');
      return false;
    }
    return true;
  }, [signOut]);

  // Get remaining time until token expires
  const getTokenTimeRemaining = useCallback(() => {
    return getTimeUntilExpiry();
  }, []);

  const getToken = useCallback(() => {
    return getAccessToken();
  }, []);

  const fetchUserFromBackend = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return null;
    }

    const response = await getUserInfo(token);
    if (!response.success || response.error) {
      return null;
    }

    // Update stored user data
    if (response.data) {
      setUserData(response.data);
    }
    setUser(response.data);
    return response.data;
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    signIn,
    signOut,
    getAccessToken: getToken,
    fetchUserFromBackend,
    checkTokenValidity,
    getTokenTimeRemaining
  };
}
