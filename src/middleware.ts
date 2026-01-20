import { NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = (pathname: string) => {
  return pathname.startsWith('/dashboard');
};

const isPublicRoute = (pathname: string) => {
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  );
};

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for protected routes
  if (isProtectedRoute(pathname)) {
    // Check for access token in cookie (if set)
    // Note: Client-side AuthGuard will also check localStorage and redirect if needed
    const accessToken = req.cookies.get('access_token')?.value;

    // If no token in cookie, let client-side AuthGuard handle the redirect
    // This allows for localStorage-based auth while still providing server-side hints
    if (!accessToken) {
      // Client-side AuthGuard will check localStorage and redirect if needed
      return NextResponse.next();
    }

    // Token exists in cookie, allow request
    // Client-side AuthGuard will still verify the token is valid
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
