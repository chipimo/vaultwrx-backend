'use client';

import { Modal } from '@/components/ui/modal';
import CustomerForm from './customer-form';
import { useAuth } from '@/hooks/use-auth';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewCustomerModal({
  isOpen,
  onClose,
  onSuccess
}: NewCustomerModalProps) {
  const { user } = useAuth();

  // Check if user has permission (admin or retailer)
  const canCreateCustomer =
    user?.roleType === 'admin' || user?.roleType === 'retailer';

  if (!canCreateCustomer) {
    return null;
  }

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title='Create New Customer'
      description='Add a new customer to the system. Fill in all required information.'
      isOpen={isOpen}
      onClose={onClose}
    >
      <CustomerForm onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
}
