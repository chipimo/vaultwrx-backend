'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import NewCustomerModal from './new-customer-modal';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function NewCustomerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Check if user has permission (admin or retailer)
  const canCreateCustomer =
    user?.roleType === 'admin' || user?.roleType === 'retailer';

  if (!canCreateCustomer) {
    return null;
  }

  const handleSuccess = () => {
    setIsOpen(false);
    // Refresh the page to show the new customer
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(buttonVariants(), 'text-xs md:text-sm')}
      >
        <IconPlus className='mr-2 h-4 w-4' /> Add New
      </Button>
      <NewCustomerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
