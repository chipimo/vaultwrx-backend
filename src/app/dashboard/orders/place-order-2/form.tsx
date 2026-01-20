'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconCalendar,
  IconCheck,
  IconHelpCircle,
  IconX,
  IconAlertTriangle
} from '@tabler/icons-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCustomers, getLocations, createOrder, getUserData } from '@/lib/api-client';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { VaultsForm } from './product-forms/vaults-form';
import { CasketForm } from './product-forms/casket-form';
import { UrnsForm } from './product-forms/urns-form';
import { GraveDiggingForm } from './product-forms/grave-digging-form';
import { CremationForm } from './product-forms/cremation-form';
import { MonumentForm } from './product-forms/monument-form';
import { BulkPrecastForm } from './product-forms/bulk-precast-form';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  locationId: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  deceasedName: z.string().optional(),
  deceasedDateOfBirth: z.string().optional(),
  deceasedDateOfDeath: z.string().optional(),
 
  productData: z
    .record(
      z.object({
        // Product selection
        productName: z.string().optional(),
        productId: z.string().optional(),
        productPaintColorOptions: z.string().optional(),
        emblem: z.string().optional(),
        theme: z.string().optional(),
        // Product-specific options (varies by product type)
        engraving: z
          .object({
            enabled: z.boolean().optional(),
            position: z.string().optional(), 
            message: z.string().optional(),
            font: z.string().optional(),
            fillColor: z.string().optional()
          })
          .optional(),
        graveType: z.string().optional(),
        graveOpeningClosing: z.boolean().optional(),
        graveOpeningOnly: z.boolean().optional(),
        graveClosingOnly: z.boolean().optional(),
        section: z.string().optional(),
        graveSpace: z.string().optional(),
        serviceTime: z.string().optional(),
        monumentInPlace: z.boolean().optional(),
        nameOnStone: z.string().optional(),
        graveSize: z.string().optional(),
        lastDayLettering: z.boolean().optional(),
        completionDate: z.string().optional(),
        cremationType: z.string().optional(), 
        bodyContainer: z.string().optional(),
        witnessesPresent: z.boolean().optional(),
        witnessType: z.string().optional(),
        cremainsContainer: z.string().optional(),
        // Order extras
        extras: z.string().optional(),
        customization: z.boolean().optional(),
        // Funeral Service Details
        cemetery: z.string().optional(),
        funeralServiceType: z.string().optional(),
        serviceLocation: z.string().optional(),
        dateOfService: z.string().optional(),
        timeOfService: z.string().optional(),
        arrivalTime: z.string().optional(),
        // Delivery
        deliveryLocation: z.string().optional(),
        deliveryDate: z.string().optional(),
        deliveryTime: z.string().optional(),
        deliverByDate: z.string().optional(),
        deliverByTime: z.string().optional(),
        // Attachments (stored as file names or IDs)
        attachments: z.array(z.string()).optional(),
        // Comments
        comments: z.string().optional(),
        deliveryInstructions: z.string().optional()
      })
    )
    .optional(),
  cemetery: z.string().optional(),
  serviceTypeName: z.string().optional(),
  serviceLocation: z.string().optional(),
  dateOfService: z.string().optional(),
  timeOfService: z.string().optional(),
  arrivalTime: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const PlaceOrderForm = () => {
  const router = useRouter();
  const [productFiles, setProductFiles] = useState<Record<string, File[]>>({});
  const [customizationChecked, setCustomizationChecked] = useState<
    Record<string, boolean>
  >({});
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([
    'vault'
  ]);
  const [openProductSections, setOpenProductSections] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    if (selectedProductTypes.length > 0) {
      initial[selectedProductTypes[0]] = true;
    }
    return initial;
  });
  const [customerOpen, setCustomerOpen] = useState(false);

  useEffect(() => {
    setOpenProductSections((prev) => {
      const newState = { ...prev };
      let hasChanges = false;

      selectedProductTypes.forEach((typeId) => {
        if (!(typeId in newState)) {
          newState[typeId] = typeId === selectedProductTypes[0];
          hasChanges = true;
        }
      });

      // Remove state for unselected types
      Object.keys(newState).forEach((typeId) => {
        if (!selectedProductTypes.includes(typeId)) {
          delete newState[typeId];
          hasChanges = true;
        }
      });

      return hasChanges ? newState : prev;
    });
  }, [selectedProductTypes]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      locationId: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      deceasedName: '',
      deceasedDateOfBirth: '',
      deceasedDateOfDeath: '',
      productData: {},
      cemetery: '',
      serviceTypeName: '',
      serviceLocation: '',
      dateOfService: '',
      timeOfService: '',
      arrivalTime: ''
    }
  });
  const userData = getUserData();

  useEffect(() => {
    console.log('userData', userData?.retailer?.id);
    
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [customersResponse, locationsResponse] = await Promise.all([
          getCustomers({ relations: ['user', 'company'], limit: 100 }),
          getLocations({ limit: 100 })
        ]);

        if (customersResponse.success && customersResponse.data) {
          setCustomers(customersResponse.data.rows || []);
        }

        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data.rows || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load customers and locations');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const selectedCustomerId = form.watch('customerId');
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (selectedCustomer?.user) {
      const firstName = selectedCustomer.user.first_name || '';
      const lastName = selectedCustomer.user.last_name || '';
      form.setValue('contactName', `${firstName} ${lastName}`.trim());
      form.setValue('contactEmail', selectedCustomer.user.email || '');
      form.setValue('contactPhone', selectedCustomer.phone || '');
    }
  }, [selectedCustomerId, selectedCustomer, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      if (selectedProductTypes.length === 0) {
        toast.error('Please select at least one product type');
        setIsLoading(false);
        return;
      }

      const orderItems = selectedProductTypes.map((typeId) => {
        const productType = productTypes.find((pt) => pt.id === typeId);
        const productInfo = values.productData?.[typeId] || {};

        return {
          productType: productType?.backendId || typeId,
          productPaintColorOptions: productInfo.productPaintColorOptions,
          emblem: productInfo.emblem,
          productName: productInfo.productName,
          productId: productInfo.productId
        };
      });

      // Get funeral service details from the first selected product type (typically vault)
      const primaryProductData = values.productData?.[selectedProductTypes[0]] || {};

      const orderData: any = {
        customerId: values.customerId,
        userId: userData?.id || null,
        retailerId: userData?.retailer?.id || null,
        locationId: values.locationId || undefined,
        contact: values.contactName || undefined,
        email: values.contactEmail || undefined,
        cellPhone: values.contactPhone || undefined,
        // Funeral service details from productData
        cemetery: primaryProductData.cemetery || values.cemetery || null,
        serviceTypeName: primaryProductData.funeralServiceType || values.serviceTypeName || null,
        serviceLocation: primaryProductData.serviceLocation || null,
        dateOfService: primaryProductData.dateOfService || values.dateOfService || null,
        timeOfService: primaryProductData.timeOfService || values.timeOfService || null,
        arrivalTime: primaryProductData.arrivalTime || values.arrivalTime || null,
        status: 'draft', 
        orderItems: orderItems 
      };

      if (
        values.deceasedName ||
        values.deceasedDateOfBirth ||
        values.deceasedDateOfDeath
      ) {
        // Note: Deceased might need to be created separately
        // Adjust based on backend API structure
      }

      const response = await createOrder(orderData);

      if (response.success) {
        toast.success('Order created successfully');
        // Redirect to tracking page to see the new order in the grouped view
        router.push('/dashboard/orders/track');
      } else {
        toast.error(response.error?.message || 'Failed to create order');
      }
    } catch (error: any) {
      toast.error('An error occurred while creating order');
      console.error('Error creating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const productTypes = [
    { id: 'vault', label: 'Vaults', backendId: 'vault' },
    { id: 'casket', label: 'Casket', backendId: 'casket' },
    { id: 'urn', label: 'Urn', backendId: 'urn' },
    { id: 'grave_digging', label: 'Grave Digging', backendId: 'grave_digging' },
    { id: 'cremation', label: 'Cremation', backendId: 'cremation' },
    { id: 'monument', label: 'Monument', backendId: 'monument' },
    { id: 'bulk_precast', label: 'Bulk / Precast', backendId: 'bulk_precast' }
  ];

  // Define required fields for each product type to calculate progress
  const productRequiredFields: Record<string, string[]> = {
    vault: ['productId', 'cemetery', 'dateOfService', 'timeOfService'],
    casket: ['productId', 'cemetery', 'dateOfService', 'timeOfService'],
    urn: ['productId', 'cemetery', 'dateOfService'],
    grave_digging: ['graveType', 'section', 'graveSpace', 'serviceTime'],
    cremation: ['cremationType', 'bodyContainer', 'cremainsContainer'],
    monument: ['productId', 'cemetery', 'completionDate'],
    bulk_precast: ['productId', 'deliveryDate']
  };

  // Calculate form progress for a specific product type
  const getFormProgress = (typeId: string): { filled: number; total: number; percentage: number } => {
    const requiredFields = productRequiredFields[typeId] || [];
    const productData = form.watch('productData')?.[typeId] || {};
    
    let filledCount = 0;
    requiredFields.forEach((field) => {
      const value = (productData as Record<string, unknown>)[field];
      if (value !== undefined && value !== null && value !== '') {
        filledCount++;
      }
    });

    const total = requiredFields.length;
    const percentage = total > 0 ? Math.round((filledCount / total) * 100) : 0;

    return { filled: filledCount, total, percentage };
  };

  const toggleProductType = (typeId: string) => {
    setSelectedProductTypes((prev) => {
      const isRemoving = prev.includes(typeId);
      const newTypes = isRemoving
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId];

      if (isRemoving) {
        // Clean up form data and open state when removing
        const currentData = form.getValues('productData') || {};
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [typeId]: _, ...rest } = currentData;
        form.setValue('productData', rest);

        setOpenProductSections((prevOpen) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [typeId]: __, ...restOpen } = prevOpen;
          return restOpen;
        });
      } else {
        // If adding a new product type, open it by default if it's the first one
        if (newTypes.length === 1) {
          setOpenProductSections({ [typeId]: true });
        } else {
          // Open the newly added section
          setOpenProductSections((prev) => ({
            ...prev,
            [typeId]: true
          }));
        }
      }

      return newTypes;
    });
  };

  const toggleProductSection = (typeId: string) => {
    setOpenProductSections((prev) => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  // Helper to get customer display name
  const getCustomerDisplayName = (customer: Customer): string => {
    if (customer.user) {
      const firstName = customer.user.first_name || '';
      const lastName = customer.user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || customer.user.email || customer.id;
    }
    return customer.id;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-4'>
        {/* Product Type Selection */}
        <Card className='p-2 pt-3'>
          <CardHeader className='relative pb-1'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle className='text-base'>
                  Select The Types Of Products To Order
                </CardTitle>
                <p className='mt-1 text-sm text-gray-500'>
                  Each order can include multiple items, but must be for a
                  single deceased individual and delivered to one address.
                </p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-10 w-10 rounded-full text-xl'
              >
                <IconHelpCircle className='h-10 w-10 text-gray-400' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex flex-wrap gap-2'>
              {productTypes.map((type) => {
                const isSelected = selectedProductTypes.includes(type.id);
                return (
                  <Button
                    key={type.id}
                    type='button'
                    variant={isSelected ? 'default' : 'outline'}
                    className={
                      isSelected
                        ? 'bg-green-700 text-white hover:bg-green-800'
                        : ''
                    }
                    onClick={() => toggleProductType(type.id)}
                  >
                    {isSelected && <IconCheck className='mr-2 h-4 w-4' />}
                    {type.label}
                  </Button>
                );
              })}
            </div>
            <div className='mt-4 flex items-center justify-between border-t pt-3'>
              <div className='flex flex-wrap gap-2'>
                {selectedProductTypes.length > 0 && (
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      Selected:
                    </span>
                    {selectedProductTypes.map((typeId) => {
                      const productType = productTypes.find(
                        (pt) => pt.id === typeId
                      );
                      const progress = getFormProgress(typeId);
                      const isComplete = progress.percentage === 100;
                      
                      return (
                        <div
                          key={typeId}
                          className={cn(
                            'relative inline-flex flex-col rounded-md px-2 py-1 text-xs font-medium overflow-hidden',
                            isComplete
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {/* Progress bar background */}
                          {!isComplete && progress.percentage > 0 && (
                            <div
                              className='absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-300'
                              style={{ width: `${progress.percentage}%` }}
                            />
                          )}
                          {isComplete && (
                            <div className='absolute bottom-0 left-0 h-1 w-full bg-green-500' />
                          )}
                          <div className='flex items-center gap-1'>
                            {isComplete ? (
                              <IconCheck className='h-3 w-3' />
                            ) : (
                              <IconAlertTriangle className='h-3 w-3 text-amber-500' />
                            )}
                            {productType?.label || typeId}
                            {!isComplete && (
                              <span className='ml-1 text-[10px] text-gray-400'>
                                {progress.percentage}%
                              </span>
                            )}
                            <button
                              type='button'
                              onClick={() => toggleProductType(typeId)}
                              className={cn(
                                'ml-1 rounded-full p-0.5 transition-colors hover:bg-opacity-50',
                                isComplete
                                  ? 'hover:bg-green-200'
                                  : 'hover:bg-gray-200'
                              )}
                            >
                              <IconX className='h-3 w-3' />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className='text-sm text-gray-500'>
                {selectedProductTypes.length} Item
                {selectedProductTypes.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Left Column */}
          <div className='space-y-6 lg:col-span-1'>
            {/* Customer Section */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='customerId'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel>Search Customer</FormLabel>
                      <Popover
                        open={customerOpen}
                        onOpenChange={setCustomerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type='button'
                              variant='outline'
                              role='combobox'
                              aria-expanded={customerOpen}
                              className='h-9 w-full justify-between font-normal'
                              disabled={isLoadingData}
                            >
                              <div className='flex min-w-0 flex-1 items-center gap-2'>
                                <IconSearch className='h-4 w-4 shrink-0 text-gray-400' />
                                <span
                                  className={cn(
                                    'truncate',
                                    !field.value && 'text-gray-500'
                                  )}
                                >
                                  {field.value
                                    ? getCustomerDisplayName(
                                        customers.find(
                                          (c) => c.id === field.value
                                        )!
                                      )
                                    : 'Select customer...'}
                                </span>
                              </div>
                              <IconChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-[var(--radix-popover-trigger-width)] p-0'
                          align='start'
                        >
                          <Command>
                            <CommandInput placeholder='Search customer...' />
                            <CommandList>
                              <CommandEmpty>No customer found.</CommandEmpty>
                              <CommandGroup>
                                {customers.map((customer) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={getCustomerDisplayName(customer)}
                                    onSelect={() => {
                                      field.onChange(customer.id);
                                      setCustomerOpen(false);
                                    }}
                                  >
                                    <IconCheck
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === customer.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className='flex flex-col'>
                                      <span>
                                        {getCustomerDisplayName(customer)}
                                      </span>
                                      {customer.user?.email && (
                                        <span className='text-xs text-gray-500'>
                                          {customer.user.email}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='locationId'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel>Select Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select location' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} - {location.city},{' '}
                              {location.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='contactName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Contact name'
                          disabled={isLoading || isLoadingData}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='contactPhone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Phone number'
                          disabled={isLoading || isLoadingData}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='contactEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Email address'
                          disabled={isLoading || isLoadingData}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Deceased Section */}
            <Card>
              <CardHeader>
                <CardTitle>Deceased</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='deceasedName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter name'
                          disabled={isLoading || isLoadingData}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='deceasedDateOfBirth'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <div className='relative'>
                          <FormControl>
                            <Input
                              type='date'
                              className='pr-9'
                              disabled={isLoading || isLoadingData}
                              {...field}
                            />
                          </FormControl>
                          <IconCalendar className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='deceasedDateOfDeath'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Death</FormLabel>
                        <div className='relative'>
                          <FormControl>
                            <Input
                              type='date'
                              className='pr-9'
                              disabled={isLoading || isLoadingData}
                              {...field}
                            />
                          </FormControl>
                          <IconCalendar className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Dynamic Product Type Sections - Each with complete form */}
            {selectedProductTypes.map((typeId) => {
              const productType = productTypes.find((pt) => pt.id === typeId);
              const isOpen = openProductSections[typeId] ?? false;
              const files = productFiles[typeId] || [];
              const customization = customizationChecked[typeId] ?? false;

              return (
                <Collapsible
                  key={typeId}
                  open={isOpen}
                  onOpenChange={() => toggleProductSection(typeId)}
                  className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm p-0'
                >
                  {(() => {
                    const progress = getFormProgress(typeId);
                    const isComplete = progress.percentage === 100;
                    
                    return (
                      <div className='relative'>
                        {/* Progress bar at the top of the card */}
                        <div className='absolute top-0 left-0 right-0 h-1 bg-gray-200'>
                          <div
                            className={cn(
                              'h-full transition-all duration-300',
                              isComplete ? 'bg-green-500' : 'bg-amber-400'
                            )}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-1 pt-2'>
                          <div className='flex items-center gap-3'>
                            <CollapsibleTrigger asChild>
                              <div className='flex size-8 cursor-pointer items-center justify-center rounded bg-white'>
                                <IconChevronRight
                                  className={cn(
                                    'h-5 w-5 transition-transform',
                                    isOpen && 'rotate-90'
                                  )}
                                />
                              </div>
                            </CollapsibleTrigger>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <h3 className='text-lg font-semibold text-gray-900'>
                                  {productType?.label || typeId} Information
                                </h3>
                                {!isComplete && (
                                  <div className='flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'>
                                    <IconAlertTriangle className='h-3 w-3' />
                                    {progress.percentage}% complete
                                  </div>
                                )}
                                {isComplete && (
                                  <div className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                                    <IconCheck className='h-3 w-3' />
                                    Complete
                                  </div>
                                )}
                              </div>
                              <p className='text-sm text-gray-500'>
                                {typeId === 'vault' && 'Choose A Vault'}
                                {typeId === 'casket' && 'Choose A Casket'}
                                {typeId === 'urn' && 'Choose An Urn'}
                                {typeId === 'grave_digging' &&
                                  'Grave Digging Details'}
                                {typeId === 'cremation' && 'Cremation Details'}
                                {typeId === 'monument' && 'Monument Details'}
                                {typeId === 'bulk_precast' &&
                                  'Bulk / Precast Details'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductType(typeId);
                            }}
                          >
                            <IconX className='h-4 w-4 text-red-500' />
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                  <CollapsibleContent className='p-0'>
                    {typeId === 'vault' && (
                      <VaultsForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'casket' && (
                      <CasketForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'urn' && (
                      <UrnsForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'grave_digging' && (
                      <GraveDiggingForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'cremation' && (
                      <CremationForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'monument' && (
                      <MonumentForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                    {typeId === 'bulk_precast' && (
                      <BulkPrecastForm
                        typeId={typeId}
                        productType={productType}
                        form={form}
                        isLoading={isLoading}
                        isLoadingData={isLoadingData}
                        files={files}
                        setProductFiles={setProductFiles}
                        customization={customization}
                        setCustomizationChecked={setCustomizationChecked}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end gap-4 pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading || isLoadingData}>
            {isLoading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlaceOrderForm;
