'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthRedirectProps {
  redirectTo: string;
  requireAuth?: boolean;
  fallbackTo?: string;
}

/**
 * Component that redirects based on authentication status
 * - If requireAuth is false (default): redirects to redirectTo if authenticated, otherwise renders nothing
 * - If requireAuth is true: redirects to fallbackTo if not authenticated
 */
export default function AuthRedirect({
  redirectTo,
  requireAuth = false,
  fallbackTo = '/auth/sign-in'
}: AuthRedirectProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Access localStorage only on client side after mount
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;
    
    const isAuthenticated = !!token;

    if (requireAuth && !isAuthenticated) {
      // Auth required but not authenticated - redirect to sign-in
      setShouldRedirect(true);
      router.replace(fallbackTo);
    } else if (!requireAuth && isAuthenticated) {
      // On public page but authenticated - redirect to dashboard
      setShouldRedirect(true);
      router.replace(redirectTo);
    }
    // Otherwise, don't redirect - just render nothing
  }, [mounted, router, redirectTo, fallbackTo, requireAuth]);

  // Only show loader if we're actually redirecting
  if (shouldRedirect) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // Not redirecting - render nothing, let the page content show
  return null;
}
