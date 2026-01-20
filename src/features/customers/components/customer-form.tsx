'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createCustomer } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  // User fields
  first_name: z.string().min(2, {
    message: 'First name must be at least 2 characters.'
  }),
  last_name: z.string().min(2, {
    message: 'Last name must be at least 2 characters.'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.'
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.'
  }),
  // Customer fields
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  isActive: z.boolean().default(true)
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({
  onSuccess,
  onCancel
}: CustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      preferredContactMethod: '',
      isActive: true
    }
  });

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      setIsLoading(true);

      // Note: The backend might need user creation first, then customer creation
      // For now, we'll send all data and let the backend handle it
      // Adjust based on your backend API structure
      const customerData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zipCode: values.zipCode || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        preferredContactMethod: values.preferredContactMethod || undefined,
        isActive: values.isActive
      };

      const response = await createCustomer(customerData);

      if (response.success) {
        toast.success('Customer created successfully');
        form.reset();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error(response.error?.message || 'Failed to create customer');
      }
    } catch (error: any) {
      toast.error('An error occurred while creating customer');
      console.error('Error creating customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <div className='text-muted-foreground text-sm font-medium'>
            User Information
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='last_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='john.doe@example.com'
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='••••••'
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-4'>
          <div className='text-muted-foreground text-sm font-medium'>
            Contact Information
          </div>

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder='555-1234'
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder='123 Main St'
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Springfield'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='state'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder='IL' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='zipCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='62701'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='dateOfBirth'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type='date' disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='preferredContactMethod'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Contact Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select contact method' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='phone'>Phone</SelectItem>
                    <SelectItem value='text'>Text Message</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex items-center justify-end space-x-2 pt-4'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
