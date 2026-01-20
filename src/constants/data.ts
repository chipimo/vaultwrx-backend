import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
  // Optional persisted product details (used by the mock API + product form)
  status?: 'active' | 'draft' | 'inactive' | string;
  trackQuantity?: boolean;
  locations?: { id: string; name: string; qty: number }[];
  stockMax?: number;
  stockMin?: number;
  priceLists?: { id: string; name: string; price: number }[];
  // Variant support
  parent_id?: number;
  variant_label?: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Home',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['h', 'h'],
    items: [] // Empty array as there are no child items for Home
  },
  {
    title: 'Orders',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'product',
    shortcut: ['o', 'o'],
    isActive: true,
    badge: '15', // Add badge for orders count
    items: [
      {
        title: 'Track Orders',
        url: '/dashboard/orders/track',
        icon: 'arrowRight',
        shortcut: ['t', 't']
      },
      {
        title: 'Ongoing Orders',
        url: '/dashboard/orders/ongoing',
        icon: 'arrowRight',
        shortcut: ['o', 'o']
      },
      {
        title: 'Order History',
        url: '/dashboard/orders/history',
        icon: 'arrowRight',
        shortcut: ['h', 'h']
      },
      {
        title: 'Calendar Option',
        url: '/dashboard/orders/calendar',
        icon: 'arrowRight',
        shortcut: ['c', 'c']
      }
    ]
  },
  {
    title: 'Product',
    url: '#',
    icon: 'product',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [
      {
        title: 'Products',
        url: '/dashboard/product',
        icon: 'arrowRight',
        shortcut: ['p', 'p']
      },
      {
        title: 'Inventory',
        url: '/dashboard/product/inventory',
        icon: 'arrowRight',
        shortcut: ['i', 'i']
      },
      {
        title: 'Variant Inventory',
        url: '/dashboard/product/variant-inventory',
        icon: 'arrowRight',
        shortcut: ['v', 'i']
      },
      {
        title: 'Builds',
        url: '/dashboard/product/builds',
        icon: 'arrowRight',
        shortcut: ['b', 'b']
      },
      {
        title: 'Transfers',
        url: '/dashboard/product/transfers',
        icon: 'arrowRight',
        shortcut: ['t', 't']
      }
    ]
  },
  {
    title: 'Customers',
    url: '/dashboard/customers',
    icon: 'user',
    shortcut: ['u', 'u'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: 'dashboard',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [] // No child items
  }
];

// Settings item for footer
export const settingsItem: NavItem = {
  title: 'Settings',
  url: '/dashboard/settings',
  icon: 'settings',
  shortcut: ['s', 's'],
  isActive: false,
  items: []
};

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
