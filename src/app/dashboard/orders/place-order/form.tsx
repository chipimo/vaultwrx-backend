'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPlus,
  IconLoader2
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getCustomers,
  getLocations,
  createOrder,
  getUserData,
  getPrimaryContactsByCustomer,
  createPrimaryContact,
  getPrimaryContactDisplayName,
  PrimaryContact
} from '@/lib/api-client';
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
import { Heading } from '@/components/ui/heading';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  primaryContactIds: z
    .array(z.string())
    .max(3, 'Maximum 3 primary contacts allowed')
    .optional(),
  locationId: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  deceasedName: z.string().optional(),
  // Date of Birth - split into DD, MM, YYYY (only year required)
  deceasedDobDay: z.string().optional(),
  deceasedDobMonth: z.string().optional(),
  deceasedDobYear: z.string().optional(),
  // Date of Death - split into DD, MM, YYYY (only year required)
  deceasedDodDay: z.string().optional(),
  deceasedDodMonth: z.string().optional(),
  deceasedDodYear: z.string().optional(),

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
  const [activeProductTab, setActiveProductTab] = useState<string>('vault');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Primary contacts state
  const [primaryContacts, setPrimaryContacts] = useState<PrimaryContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      primaryContactIds: [],
      locationId: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      deceasedName: '',
      deceasedDobDay: '',
      deceasedDobMonth: '',
      deceasedDobYear: '',
      deceasedDodDay: '',
      deceasedDodMonth: '',
      deceasedDodYear: '',
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
    // Auto-select first location if customer has locations
    if (selectedCustomer?.locations && selectedCustomer.locations.length > 0) {
      form.setValue('locationId', selectedCustomer.locations[0].id);
    } else {
      form.setValue('locationId', '');
    }
  }, [selectedCustomerId, selectedCustomer, form]);

  // Fetch primary contacts when customer changes
  useEffect(() => {
    const fetchPrimaryContacts = async () => {
      if (!selectedCustomerId) {
        setPrimaryContacts([]);
        form.setValue('primaryContactIds', []);
        return;
      }

      setIsLoadingContacts(true);
      try {
        const response = await getPrimaryContactsByCustomer(selectedCustomerId);
        if (response.success && response.data) {
          setPrimaryContacts(response.data);
          // Auto-select first contact if available
          if (response.data.length > 0) {
            form.setValue('primaryContactIds', [response.data[0].id]);
          }
        }
      } catch (error) {
        console.error('Error fetching primary contacts:', error);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchPrimaryContacts();
  }, [selectedCustomerId, form]);

  // Toggle primary contact selection (up to 3)
  const togglePrimaryContact = (contactId: string) => {
    const currentIds = form.getValues('primaryContactIds') || [];
    if (currentIds.includes(contactId)) {
      form.setValue(
        'primaryContactIds',
        currentIds.filter((id) => id !== contactId)
      );
    } else if (currentIds.length < 3) {
      form.setValue('primaryContactIds', [...currentIds, contactId]);
    } else {
      toast.error('Maximum 3 primary contacts allowed per order');
    }
  };

  // Create new primary contact
  const handleCreateContact = async () => {
    if (!selectedCustomerId || !newContactName.trim()) {
      toast.error('Please enter a contact name');
      return;
    }

    setIsCreatingContact(true);
    try {
      const response = await createPrimaryContact({
        company_id: userData?.company_id || '',
        customer_id: selectedCustomerId,
        name: newContactName.trim(),
        email: newContactEmail.trim() || undefined,
        phone: newContactPhone.trim() || undefined
      });

      if (response.success && response.data) {
        setPrimaryContacts((prev) => [...prev, response.data!]);
        // Auto-select the new contact if under 3
        const currentIds = form.getValues('primaryContactIds') || [];
        if (currentIds.length < 3) {
          form.setValue('primaryContactIds', [...currentIds, response.data.id]);
        }
        toast.success('Primary contact created successfully');
        setShowAddContactDialog(false);
        setNewContactName('');
        setNewContactEmail('');
        setNewContactPhone('');
      } else {
        toast.error(response.error?.message || 'Failed to create contact');
      }
    } catch (error: any) {
      toast.error('Failed to create primary contact');
      console.error('Error creating contact:', error);
    } finally {
      setIsCreatingContact(false);
    }
  };

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
      const primaryProductData =
        values.productData?.[selectedProductTypes[0]] || {};

      const orderData: any = {
        customerId: values.customerId,
        userId: userData?.id || null,
        retailerId: userData?.retailer?.id || null,
        locationId: values.locationId || undefined,
        contact: values.contactName || undefined,
        email: values.contactEmail || undefined,
        cellPhone: values.contactPhone || undefined,
        // Primary contacts (up to 3)
        primaryContactIds: values.primaryContactIds || [],
        // Funeral service details from productData
        cemetery: primaryProductData.cemetery || values.cemetery || null,
        serviceTypeName:
          primaryProductData.funeralServiceType ||
          values.serviceTypeName ||
          null,
        serviceLocation: primaryProductData.serviceLocation || null,
        dateOfService:
          primaryProductData.dateOfService || values.dateOfService || null,
        timeOfService:
          primaryProductData.timeOfService || values.timeOfService || null,
        arrivalTime:
          primaryProductData.arrivalTime || values.arrivalTime || null,
        status: 'draft',
        orderItems: orderItems
      };

      if (
        values.deceasedName ||
        values.deceasedDobYear ||
        values.deceasedDodYear
      ) {
        // Note: Deceased might need to be created separately
        // Adjust based on backend API structure
        // Combine date parts if needed: YYYY-MM-DD format
        // DOB: `${values.deceasedDobYear}-${values.deceasedDobMonth || '01'}-${values.deceasedDobDay || '01'}`
        // DOD: `${values.deceasedDodYear}-${values.deceasedDodMonth || '01'}-${values.deceasedDodDay || '01'}`
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
  const getFormProgress = (
    typeId: string
  ): { filled: number; total: number; percentage: number } => {
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
        // Clean up form data when removing
        const currentData = form.getValues('productData') || {};
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [typeId]: _, ...rest } = currentData;
        form.setValue('productData', rest);

        // If removing the active tab, switch to another tab
        if (activeProductTab === typeId && newTypes.length > 0) {
          setActiveProductTab(newTypes[0]);
        }
      } else {
        // When adding a new product type, make it the active tab
        setActiveProductTab(typeId);
      }

      return newTypes;
    });
  };

  const removeProductTab = (typeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleProductType(typeId);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        {/* Header with Title and Product Type Selection */}
        <div className='flex w-full items-start gap-3 py-1'>
          <div className='shrink-0'>
            <Heading title='PLACE ORDER' description='' />
          </div>

          <div className='flex flex-1 flex-col gap-1'>
            <div className='flex flex-wrap items-center gap-1.5'>
              {productTypes.map((type) => {
                const isSelected = selectedProductTypes.includes(type.id);
                const progress = getFormProgress(type.id);
                const isComplete = progress.percentage === 100;
                // Calculate opacity based on progress (0.65 at 0%, 1 at 100%)
                const greenOpacity = isSelected
                  ? 0.65 + (progress.percentage / 100) * 0.35
                  : 1;

                return (
                  <button
                    key={type.id}
                    type='button'
                    onClick={() => toggleProductType(type.id)}
                    className={cn(
                      'relative flex flex-col items-center overflow-hidden rounded-md border px-3 py-1 text-sm font-medium transition-all',
                      isSelected
                        ? 'border-green-600/60 text-white'
                        : 'border-border bg-card text-foreground hover:border-ring hover:bg-muted'
                    )}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `rgba(21, 128, 61, ${greenOpacity})` // green-700 with dynamic opacity
                          }
                        : undefined
                    }
                  >
                    <div className='flex items-center gap-1.5'>
                      {isSelected && !isComplete && (
                        <IconAlertTriangle className='h-3.5 w-3.5 text-yellow-300' />
                      )}
                      {isSelected && isComplete && (
                        <IconCheck className='h-3.5 w-3.5 text-white' />
                      )}
                      <span>{type.label}</span>
                      {isSelected && !isComplete && (
                        <span className='text-[10px] font-normal text-white/70'>
                          {progress.percentage}%
                        </span>
                      )}
                    </div>
                    {/* Progress bar at the bottom of the button - only show when not complete */}
                    {isSelected && !isComplete && (
                      <div className='absolute right-0 bottom-0 left-0 h-0.5 bg-transparent'>
                        <div
                          className='h-full bg-yellow-400 transition-all duration-300'
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className='text-muted-foreground text-xs'>
              Each order can include multiple items, but must be for a single
              deceased individual and delivered to one address.
            </div>
          </div>
        </div>

        <div className='mb-6' />

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Left Column */}
          <div className='space-y-4 lg:col-span-1'>
            {/* Customer Section */}
            <Card>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='customerId'
                  render={({ field }) => {
                    return (
                      <FormItem className='space-y-1'>
                        <FormLabel className='text-foreground text-sm font-medium'>
                          Search Customer
                        </FormLabel>
                        <Popover
                          open={customerOpen}
                          onOpenChange={setCustomerOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type='button'
                                variant='ghost'
                                role='combobox'
                                aria-expanded={customerOpen}
                                className='border-input h-10 w-full justify-between rounded-none border-0 border-b bg-transparent px-0 font-normal hover:bg-transparent focus:ring-0'
                                disabled={isLoadingData}
                              >
                                <div className='flex min-w-0 flex-1 items-center gap-2'>
                                  <IconSearch className='text-muted-foreground h-4 w-4 shrink-0' />
                                  <span
                                    className={cn(
                                      'truncate',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value
                                      ? getCustomerDisplayName(selectedCustomer!)
                                      : 'Search Customer'}
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
                                      <div
                                        className={cn(
                                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                          field.value === customer.id
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-input [&_svg]:invisible'
                                        )}
                                      >
                                        <IconCheck className='h-3.5 w-3.5' />
                                      </div>
                                      <div className='flex flex-col'>
                                        <span>
                                          {getCustomerDisplayName(customer)}
                                        </span>
                                        {customer.user?.email && (
                                          <span className='text-muted-foreground text-xs'>
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
                    );
                  }}
                />

                {/* Location Select - only show when customer has locations */}
                {selectedCustomer?.locations && selectedCustomer.locations.length > 0 && (
                  <FormField
                    control={form.control}
                    name='locationId'
                    render={({ field }) => {
                      const selectedLocation = selectedCustomer.locations?.find(
                        (l) => l.id === field.value
                      );

                      return (
                        <FormItem className='space-y-1'>
                          <FormLabel className='text-foreground text-sm font-medium'>
                            Location
                          </FormLabel>
                          <Popover
                            open={locationOpen}
                            onOpenChange={setLocationOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  role='combobox'
                                  aria-expanded={locationOpen}
                                  className='border-input h-10 w-full justify-between rounded-none border-0 border-b bg-transparent px-0 font-normal hover:bg-transparent focus:ring-0'
                                >
                                  <span
                                    className={cn(
                                      'truncate',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {selectedLocation
                                      ? selectedLocation.name
                                      : 'Select location'}
                                  </span>
                                  <IconChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-[var(--radix-popover-trigger-width)] p-0'
                              align='start'
                            >
                              <Command>
                                <CommandInput placeholder='Search location...' />
                                <CommandList>
                                  <CommandEmpty>No location found.</CommandEmpty>
                                  <CommandGroup>
                                    {selectedCustomer.locations?.map((location) => (
                                      <CommandItem
                                        key={location.id}
                                        value={location.name}
                                        onSelect={() => {
                                          field.onChange(location.id);
                                          setLocationOpen(false);
                                        }}
                                      >
                                        <div
                                          className={cn(
                                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                            field.value === location.id
                                              ? 'bg-primary border-primary text-primary-foreground'
                                              : 'border-input [&_svg]:invisible'
                                          )}
                                        >
                                          <IconCheck className='h-3.5 w-3.5' />
                                        </div>
                                        <div className='flex flex-col'>
                                          <span>{location.name}</span>
                                          {location.address && (
                                            <span className='text-muted-foreground text-xs'>
                                              {location.address}
                                              {location.city && `, ${location.city}`}
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
                      );
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card>
              <CardContent className='space-y-4'>
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-foreground text-sm font-medium'>
                      Select Primary Contact
                      
                    </FormLabel>
                    <Dialog
                      open={showAddContactDialog}
                      onOpenChange={setShowAddContactDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='text-primary h-auto p-0 text-xs'
                          disabled={!selectedCustomerId}
                        >
                          <IconPlus className='mr-1 h-3 w-3' />
                          Add Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-[425px]'>
                        <DialogHeader>
                          <DialogTitle>Add New Primary Contact</DialogTitle>
                          <DialogDescription>
                            Create a new primary contact for this customer. This
                            contact can be selected for orders.
                          </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                          <div className='grid gap-2'>
                            <Label htmlFor='contact-name'>Name *</Label>
                            <Input
                              id='contact-name'
                              placeholder='Enter contact name'
                              value={newContactName}
                              onChange={(e) =>
                                setNewContactName(e.target.value)
                              }
                              disabled={isCreatingContact}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='contact-email'>Email</Label>
                            <Input
                              id='contact-email'
                              type='email'
                              placeholder='Enter email address'
                              value={newContactEmail}
                              onChange={(e) =>
                                setNewContactEmail(e.target.value)
                              }
                              disabled={isCreatingContact}
                            />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='contact-phone'>Phone</Label>
                            <Input
                              id='contact-phone'
                              type='tel'
                              placeholder='Enter phone number'
                              value={newContactPhone}
                              onChange={(e) =>
                                setNewContactPhone(e.target.value)
                              }
                              disabled={isCreatingContact}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => setShowAddContactDialog(false)}
                            disabled={isCreatingContact}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='button'
                            onClick={handleCreateContact}
                            disabled={
                              isCreatingContact || !newContactName.trim()
                            }
                          >
                            {isCreatingContact ? (
                              <>
                                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                                Creating...
                              </>
                            ) : (
                              'Create Contact'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        role='combobox'
                        className='border-input h-10 w-full justify-between rounded-none border-0 border-b bg-transparent px-0 font-normal hover:bg-transparent focus:ring-0'
                        disabled={
                          !selectedCustomerId ||
                          isLoadingContacts ||
                          (form.watch('primaryContactIds') || []).length >= 3
                        }
                      >
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <IconSearch className='text-muted-foreground h-4 w-4 shrink-0' />
                          <span className='text-muted-foreground truncate'>
                            {isLoadingContacts
                              ? 'Loading contacts...'
                              : !selectedCustomerId
                                ? 'Select a customer first'
                                : (form.watch('primaryContactIds') || [])
                                      .length >= 3
                                  ? 'Maximum contacts selected'
                                  : 'Search contact...'}
                          </span>
                        </div>
                        {isLoadingContacts ? (
                          <IconLoader2 className='ml-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
                        ) : (
                          <IconChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0'
                      align='start'
                    >
                      <Command>
                        <CommandInput placeholder='Search contact...' />
                        <CommandList>
                          <CommandEmpty>No contact found.</CommandEmpty>
                          <CommandGroup>
                            {primaryContacts.map((contact) => {
                              const selectedIds =
                                form.watch('primaryContactIds') || [];
                              const isSelected = selectedIds.includes(
                                contact.id
                              );
                              const displayName =
                                getPrimaryContactDisplayName(contact);
                              const contactEmail =
                                contact.email || contact.user?.email || '';

                              return (
                                <CommandItem
                                  key={contact.id}
                                  value={displayName}
                                  onSelect={() =>
                                    togglePrimaryContact(contact.id)
                                  }
                                >
                                  <div
                                    className={cn(
                                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                      isSelected
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-input [&_svg]:invisible'
                                    )}
                                  >
                                    <IconCheck className='h-3.5 w-3.5' />
                                  </div>
                                  <div className='flex flex-col'>
                                    <span>{displayName}</span>
                                    {contactEmail && (
                                      <span className='text-muted-foreground text-xs'>
                                        {contactEmail}
                                      </span>
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected contacts list */}
                  {!isLoadingContacts &&
                    (form.watch('primaryContactIds') || []).length > 0 && (
                      <div className='space-y-2 pt-3'>
                        {(() => {
                          const selectedIds =
                            form.watch('primaryContactIds') || [];
                          const selectedContacts = primaryContacts.filter((c) =>
                            selectedIds.includes(c.id)
                          );
                          return selectedContacts.map((contact) => {
                            const displayName =
                              getPrimaryContactDisplayName(contact);
                            const contactPhone = contact.phone || '';
                            const contactEmail =
                              contact.email || contact.user?.email || '';

                            return (
                              <div
                                key={contact.id}
                                className='border-primary/20 bg-primary/5 flex items-start justify-between rounded-md border p-3'
                              >
                                <div className='space-y-0.5'>
                                  <p className='text-foreground text-sm font-medium'>
                                    {displayName}
                                  </p>
                                  {contactPhone && (
                                    <p className='text-muted-foreground text-sm'>
                                      {contactPhone}
                                    </p>
                                  )}
                                  {contactEmail && (
                                    <p className='text-muted-foreground text-sm'>
                                      {contactEmail}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='text-muted-foreground hover:text-foreground h-6 w-6 shrink-0'
                                  onClick={() =>
                                    togglePrimaryContact(contact.id)
                                  }
                                >
                                  <IconX className='h-4 w-4' />
                                </Button>
                              </div>
                            );
                          });
                        })()}
                        <p className='text-muted-foreground text-xs'>
                          {(form.watch('primaryContactIds') || []).length}/3
                          contacts selected
                        </p>
                      </div>
                    )}
                </FormItem>
              </CardContent>
            </Card>

            {/* Deceased Section */}
            <Card>
              <CardContent className='px-4 py-1'>
                <h4 className='text-foreground mb-3 text-sm font-semibold'>
                  Deceased
                </h4>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='deceasedName'
                    render={({ field }) => (
                      <FormItem className='space-y-1'>
                        <FormControl>
                          <Input
                            placeholder='Name'
                            className='border-input focus-visible:border-ring h-9 rounded-none border-0 border-b bg-transparent px-0 shadow-none focus-visible:ring-0'
                            disabled={isLoading || isLoadingData}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dates Row - DOB and DOD side by side */}
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Date of Birth - DD MM YYYY */}
                    <div className='space-y-0.5'>
                      <FormLabel className='text-muted-foreground text-[10px]'>
                        Date of Birth
                      </FormLabel>
                      <div className='flex gap-1'>
                        <FormField
                          control={form.control}
                          name='deceasedDobDay'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='DD'
                                  maxLength={2}
                                  className='border-input focus-visible:border-ring h-6 w-8 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='deceasedDobMonth'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='MM'
                                  maxLength={2}
                                  className='border-input focus-visible:border-ring h-6 w-8 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='deceasedDobYear'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='YYYY'
                                  maxLength={4}
                                  className='border-input focus-visible:border-ring h-6 w-11 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Date of Death - DD MM YYYY */}
                    <div className='space-y-0.5'>
                      <FormLabel className='text-muted-foreground text-[10px]'>
                        Date of Death
                      </FormLabel>
                      <div className='flex gap-1'>
                        <FormField
                          control={form.control}
                          name='deceasedDodDay'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='DD'
                                  maxLength={2}
                                  className='border-input focus-visible:border-ring h-6 w-8 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='deceasedDodMonth'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='MM'
                                  maxLength={2}
                                  className='border-input focus-visible:border-ring h-6 w-8 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='deceasedDodYear'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder='YYYY'
                                  maxLength={4}
                                  className='border-input focus-visible:border-ring h-6 w-11 rounded border bg-transparent px-0.5 text-center text-[10px] shadow-none focus-visible:ring-0'
                                  disabled={isLoading || isLoadingData}
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs for Product Forms */}
          <div className='lg:col-span-2'>
            {selectedProductTypes.length > 0 ? (
              <Tabs
                value={activeProductTab}
                onValueChange={setActiveProductTab}
                className='w-full'
              >
                {/* Custom Tab List with X buttons */}
                <TabsList className='border-border h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0'>
                  {selectedProductTypes.map((typeId) => {
                    const productType = productTypes.find(
                      (pt) => pt.id === typeId
                    );
                    return (
                      <div
                        key={typeId}
                        className={cn(
                          'group border-border flex items-center border-r',
                          activeProductTab === typeId
                            ? 'bg-card'
                            : 'bg-muted/50'
                        )}
                      >
                        <TabsTrigger
                          value={typeId}
                          className='data-[state=active]:bg-card h-9 rounded-none border-0 px-4 text-sm font-medium data-[state=active]:shadow-none'
                        >
                          {productType?.label || typeId}
                        </TabsTrigger>
                        <button
                          type='button'
                          onClick={(e) => removeProductTab(typeId, e)}
                          className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive mr-2 rounded p-0.5'
                        >
                          <IconX className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    );
                  })}
                </TabsList>

                {/* Tab Content */}
                {selectedProductTypes.map((typeId) => {
                  const productType = productTypes.find(
                    (pt) => pt.id === typeId
                  );
                  const files = productFiles[typeId] || [];
                  const customization = customizationChecked[typeId] ?? false;

                  return (
                    <TabsContent
                      key={typeId}
                      value={typeId}
                      className='border-border bg-card mt-0 border border-t-0 p-0'
                    >
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
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <div className='border-border bg-muted/30 flex h-64 items-center justify-center rounded-lg border border-dashed'>
                <p className='text-muted-foreground'>
                  Select a product type to begin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end gap-4 pt-4'>
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
