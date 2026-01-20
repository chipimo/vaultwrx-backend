'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;
    
    if (token) {
      router.replace('/dashboard/overview');
    } else {
      router.replace('/auth/sign-in');
    }
  }, [mounted, router]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
        <p className='text-sm text-muted-foreground'>Loading...</p>
      </div>
    </div>
  );
}
