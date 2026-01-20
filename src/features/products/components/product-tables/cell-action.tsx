'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Product } from '@/constants/data';
import { IconEdit, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const variantsCount = Number((data as any)?.variantsCount ?? 0);
  const hasVariants = Number.isFinite(variantsCount) && variantsCount > 0;

  const onConfirm = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/products?id=${encodeURIComponent(data.id)}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Failed to delete product');
      }

      toast('Product deleted.');
      setOpen(false);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete product';
      toast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title={hasVariants ? "Can't delete product" : 'Are you sure?'}
        description={
          hasVariants
            ? `This product has ${variantsCount} variant${
                variantsCount === 1 ? '' : 's'
              }. Delete all variants first to delete the product.`
            : 'This action cannot be undone.'
        }
        confirmText={hasVariants ? 'Delete variants first' : 'Delete'}
        confirmDisabled={hasVariants}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/product/${data.id}`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
