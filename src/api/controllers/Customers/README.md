# Customer Management API Endpoints

This document outlines all the customer management API endpoints that align with the frontend dashboard structure.

## Base URL
All endpoints are prefixed with `/customers`

## Authentication
All endpoints require authentication with appropriate permissions.

## Main Dashboard Endpoints

### 1. Customer Dashboard Overview
- **GET** `/customers/dashboard/overview`
- **Description**: Main dashboard overview with statistics and recent issues
- **Response**: Complete dashboard data including stats, quick stats, recent issues, and missed demand overview

### 2. Active Clients
- **GET** `/customers/dashboard/active-clients`
- **Query Parameters**: `days` (default: 30)
- **Description**: Get all active customers with recent activity
- **Response**: Active customers list with business/individual breakdown and growth metrics

### 3. Inactive Clients
- **GET** `/customers/dashboard/inactive-clients`
- **Query Parameters**: `days` (default: 30)
- **Description**: Get inactive customers and reactivation opportunities
- **Response**: Inactive customers with reactivation suggestions

### 4. Client Issues
- **GET** `/customers/dashboard/client-issues`
- **Description**: Get customer issues and problems
- **Response**: Issues categorized by type and severity

### 5. Missed Demand
- **GET** `/customers/dashboard/missed-demand`
- **Query Parameters**: `period` (default: '30d')
- **Description**: Analyze missed demand opportunities
- **Response**: Missed demand analysis with revenue estimates

### 6. Top Clients
- **GET** `/customers/dashboard/top-clients`
- **Query Parameters**: `limit` (default: 10), `period` (default: 'all')
- **Description**: Get high-value customers
- **Response**: Top customers by loyalty points and estimated revenue

### 7. Client Accounts
- **GET** `/customers/dashboard/client-accounts`
- **Description**: Get account summary and payment status
- **Response**: Account types, payment status, and account statistics

### 8. Missed Item Insights
- **GET** `/customers/dashboard/missed-item-insights`
- **Description**: Analyze missed item opportunities
- **Response**: Item insights and recommendations

### 9. Basket Change
- **GET** `/customers/dashboard/basket-change`
- **Query Parameters**: `period` (default: '30d')
- **Description**: Analyze customer basket changes
- **Response**: Basket change trends and analysis

## Core Customer Management Endpoints

### Customer CRUD Operations
- **GET** `/customers` - List customers with pagination and filtering
- **GET** `/customers/:id` - Get specific customer
- **POST** `/customers` - Create new customer
- **PUT** `/customers/:id` - Update customer
- **DELETE** `/customers/:id` - Delete customer

### Customer Search and Filtering
- **GET** `/customers/search/:term` - Search customers
- **GET** `/customers/stats/overview` - Customer statistics
- **GET** `/customers/loyalty/range` - Customers by loyalty range
- **GET** `/customers/loyalty/top` - Top customers by loyalty
- **GET** `/customers/tax-type/:taxType` - Customers by tax type
- **GET** `/customers/role/:roleId` - Customers by role
- **GET** `/customers/recent-activity` - Customers with recent activity
- **GET** `/customers/date-range` - Customers by date range

### Customer Authentication
- **POST** `/customers/auth/login` - Customer login
- **POST** `/customers/auth/logout` - Customer logout
- **POST** `/customers/auth/refresh` - Refresh token
- **POST** `/customers/password/reset-request` - Request password reset
- **POST** `/customers/password/reset` - Reset password
- **POST** `/customers/password/change` - Change password

### Customer Profile Management
- **GET** `/customers/profile` - Get current profile
- **PUT** `/customers/profile` - Update profile
- **GET** `/customers/profile/orders` - Get customer orders
- **GET** `/customers/profile/payments` - Get customer payments
- **GET** `/customers/profile/invoices` - Get customer invoices

### Customer Loyalty System
- **GET** `/customers/loyalty/:customerId/points` - Get loyalty points
- **POST** `/customers/loyalty/:customerId/points/add` - Add loyalty points
- **POST** `/customers/loyalty/:customerId/points/redeem` - Redeem loyalty points
- **GET** `/customers/loyalty/:customerId/history` - Loyalty history
- **GET** `/customers/loyalty/tiers` - Get loyalty tiers
- **GET** `/customers/loyalty/stats` - Loyalty statistics

### Customer Reports and Analytics
- **GET** `/customers/reports/dashboard` - Customer dashboard
- **GET** `/customers/reports/growth` - Growth analysis
- **GET** `/customers/reports/segmentation` - Customer segmentation
- **GET** `/customers/reports/lifetime-value` - LTV analysis
- **GET** `/customers/reports/retention` - Retention analysis
- **GET** `/customers/reports/activity` - Activity analysis
- **GET** `/customers/reports/satisfaction` - Satisfaction analysis
- **GET** `/customers/reports/export` - Data export

## Data Models

### Customer Object
```typescript
{
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'prospects' | 'suspended';
  category: 'individual' | 'business' | 'government';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  company: Company;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  creditLimit?: number;
  paymentTerms?: string;
  taxNumber?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}
```

### Dashboard Overview Response
```typescript
{
  customerStats: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    topCustomers: number;
    customersWithIssues: number;
    missedDemandValue: number;
    totalRevenue: number;
  };
  quickStats: Array<{
    title: string;
    value: string;
    description: string;
    color: string;
  }>;
  recentIssues: Array<{
    customer: string;
    issue: string;
    value: number;
    date: string;
    status: string;
  }>;
  missedDemandOverview: {
    totalMissedDemand: number;
    potentialRecovery: number;
    customersAffected: number;
  };
}
```

## Frontend Alignment

The API endpoints are designed to match the frontend dashboard structure:

- `/dashboard/customers` → `/customers/dashboard/overview`
- `/dashboard/customers/active-clients` → `/customers/dashboard/active-clients`
- `/dashboard/customers/inactive-clients` → `/customers/dashboard/inactive-clients`
- `/dashboard/customers/client-issues` → `/customers/dashboard/client-issues`
- `/dashboard/customers/missed-demand` → `/customers/dashboard/missed-demand`
- `/dashboard/customers/top-clients` → `/customers/dashboard/top-clients`
- `/dashboard/customers/client-accounts` → `/customers/dashboard/client-accounts`
- `/dashboard/customers/missed-item-insights` → `/customers/dashboard/missed-item-insights`
- `/dashboard/customers/basket-change` → `/customers/dashboard/basket-change`

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Pagination

List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## Filtering and Search

Search and filter endpoints support various parameters:
- `searchTerm`: General search term
- `firstName`, `lastName`, `email`: Specific field searches
- `isCompany`: Filter by customer type
- `taxType`: Filter by tax type
- `minLoyaltyPoints`, `maxLoyaltyPoints`: Loyalty point range
- `dateFrom`, `dateTo`: Date range filtering
- `sortBy`, `sortOrder`: Sorting options
