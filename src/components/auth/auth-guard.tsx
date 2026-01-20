'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Check token expiry every 30 seconds
const TOKEN_CHECK_INTERVAL = 30 * 1000;
// Show warning when less than 5 minutes remaining
const WARNING_THRESHOLD = 5 * 60 * 1000;

/**
 * AuthGuard component that protects routes by checking authentication status
 * Redirects to sign-in if user is not authenticated
 * Also monitors token expiry and logs out user when token expires
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkTokenValidity, getTokenTimeRemaining, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check token and handle expiry
  const performTokenCheck = useCallback(() => {
    const timeRemaining = getTokenTimeRemaining();
    
    // Show warning toast when approaching expiry (but only once)
    if (timeRemaining > 0 && timeRemaining <= WARNING_THRESHOLD && !warningShownRef.current) {
      warningShownRef.current = true;
      const minutesRemaining = Math.ceil(timeRemaining / 60000);
      toast.warning(`Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`, {
        duration: 10000,
        id: 'session-warning'
      });
    }

    // Reset warning flag if we have more time (e.g., token refreshed)
    if (timeRemaining > WARNING_THRESHOLD) {
      warningShownRef.current = false;
    }

    // Check if token is expired and sign out if so
    if (!checkTokenValidity()) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      toast.error('Your session has expired. Please sign in again.', {
        duration: 5000,
        id: 'session-expired'
      });
    }
  }, [checkTokenValidity, getTokenTimeRemaining]);

  // Set up token expiry checking interval
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Perform initial check
      performTokenCheck();

      // Set up periodic checking
      intervalRef.current = setInterval(performTokenCheck, TOKEN_CHECK_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated, isLoading, performTokenCheck]);

  // Handle visibility change - check token when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        performTokenCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, performTokenCheck]);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to sign-in with callback URL
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/auth/sign-in?callbackUrl=${callbackUrl}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground text-sm'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
