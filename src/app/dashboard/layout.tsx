import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Ordering, Tracking and Billing - VaultWrx Online helps your vault business be more competitive.'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar_state')?.value;
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === 'true';
  return (
    <AuthGuard>
      <KBar>
        <SidebarProvider className='rounded-xl' defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            <div className='flex flex-1 flex-col'>{children}</div>
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthGuard>
  );
}
