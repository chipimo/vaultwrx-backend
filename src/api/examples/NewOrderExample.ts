/**
 * Example template for creating a new Order object
 * This shows the structure and default values for a new order
 */
export const NewOrderExample = {
  // Required fields (will be set automatically or from headers)
  // companyId: string - Set from header 'company-id'
  
  // Optional user/entity references (UUIDs)
  userId: null as string | null,
  retailerId: null as string | null,
  customerId: null as string | null,
  directorId: null as string | null,
  staffId: null as string | null,
  locationId: null as string | null,

  // Order status (defaults to 'draft')
  status: 'draft' as 'draft' | 'pending' | 'confirmed' | 'processing' | 'in_progress' | 'completed' | 'cancelled' | 'delivered' | 'shipped' | 'returned',

  // Financial fields (defaults to 0)
  total: 0,
  subtotal: 0,
  discount: 0,
  salesTax: 0,
  serviceTypePrice: 0,
  applyPlatformFee: false,

  // Service information
  serviceTypeName: null as string | null, // e.g., 'Traditional', 'Cremation', 'Memorial', 'Graveside'
  cemetery: null as string | null,
  dateOfService: null as string | null, // ISO date string: 'YYYY-MM-DD'
  timeOfService: null as string | null, // Time string: 'HH:mm:ss'
  arrivalTime: null as string | null, // Time string: 'HH:mm:ss'

  // Contact information
  contact: null as string | null,
  email: null as string | null,
  cellPhone: null as string | null,

  // Order details
  comments: null as string | null,
  deliveryInstructions: null as string | null,
  orderDStatus: null as string | null,
  productPaintColorOptions: null as string | null,
  emblem: null as string | null,
  serviceExtras: null as string | null,
  image: null as string | null,

  // Store information
  storeName: null as string | null,
  storeAddress1: null as string | null,
  storeAddress2: null as string | null,
  storeCity: null as string | null,
  storeState: null as string | null,
  storeZip: null as string | null,

  // Boolean flags (defaults to false)
  isDeleted: false,
  isEdited: false,
  isParent: false,
  delivered: false,
  confirmed: false,
  newOrderNotificationsSent: false,

  // Related entities (arrays - can be added after order creation)
  // orderItems: OrderItem[]
  // deceased: Deceased[]
  // photos: Photo[]
  // orderExtraCharges: OrderExtraCharge[]
  // contacts: OrderContact[]
};

/**
 * Example of a minimal new order object
 */
export const MinimalNewOrderExample = {
  status: 'draft',
  total: 0,
  subtotal: 0,
  discount: 0,
  salesTax: 0,
  serviceTypePrice: 0,
  applyPlatformFee: false,
  isDeleted: false,
  isEdited: false,
  isParent: false,
  delivered: false,
  confirmed: false,
  newOrderNotificationsSent: false,
};

/**
 * Example of a new order with common fields filled
 */
export const FilledNewOrderExample = {
  customerId: '32d2bae6-2724-4ff6-9020-cf57e9188a2e',
  retailerId: '38325d81-0a3d-42bd-8eea-64ded877b370',
  staffId: '7954720a-d129-4130-8570-20b76b56ccc9',
  locationId: '1fbcca7f-866c-4e7e-aaa8-6a57f07a0dd3',
  status: 'pending',
  serviceTypeName: 'Traditional',
  serviceTypePrice: 200.00,
  cemetery: 'Pineview Memorial Park',
  dateOfService: '2025-11-22',
  timeOfService: '10:00:00',
  arrivalTime: '09:30:00',
  contact: 'Alice Customer',
  email: 'customer1@abcfuneralservices.com',
  cellPhone: '555-1001',
  comments: 'Standard vault order with red paint and military emblem',
  productPaintColorOptions: 'Red',
  emblem: 'Military',
  total: 0,
  subtotal: 0,
  discount: 0,
  salesTax: 0,
  applyPlatformFee: false,
  isDeleted: false,
  isEdited: false,
  isParent: false,
  delivered: false,
  confirmed: false,
  newOrderNotificationsSent: false,
};

