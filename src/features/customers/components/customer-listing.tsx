'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api-client';
import { Customer } from '@/types/customer';
import { CustomerTable } from './customer-tables';
import { columns } from './customer-tables/columns';
import { toast } from 'sonner';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';

export default function CustomerListingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get search params using nuqs
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [search] = useQueryState('name', parseAsString);
  const [pageLimit] = useQueryState('perPage', parseAsInteger.withDefault(10));

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const filters: Record<string, any> = {
          page: page || 1,
          limit: pageLimit || 10,
          relations: ['user', 'company']
        };

        if (search) {
          filters.search = search;
        }

        const response = await getCustomers(filters);

        if (response.success && response.data) {
          setCustomers(response.data.rows || []);
          setTotalCustomers(response.data.total_data || 0);
        } else {
          toast.error(response.error?.message || 'Failed to fetch customers');
          setCustomers([]);
        }
      } catch (error: any) {
        toast.error('An error occurred while fetching customers');
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, pageLimit, search]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomerTable
      data={customers}
      totalItems={totalCustomers}
      columns={columns}
    />
  );
}
