# 🔐 VoteWorks Role-Based Permission System

This document outlines the comprehensive role-based permission system implemented for VoteWorks, supporting retailers, customers, and admin users with granular access control.

## 🏗️ System Architecture

### Core Models

1. **Role** - Defines user roles (Admin, Retailer, Customer, Employee, Manager)
2. **Permission** - Granular permissions for specific actions
3. **UserRole** - Many-to-many relationship between users and roles
4. **RolePermission** - Many-to-many relationship between roles and permissions

### User Types

- **Admin** - Full system access
- **Retailer** - Can manage orders and customers
- **Customer** - Can create and view their own orders
- **Employee** - Can manage assigned orders
- **Manager** - Can manage employees and orders

## 🎯 Permission Categories

### Orders
- `orders.create` - Create new orders
- `orders.read` - View orders
- `orders.update` - Update orders
- `orders.delete` - Delete orders
- `orders.export` - Export orders
- `orders.assign` - Assign orders to employees
- `orders.approve` - Approve orders

### Customers
- `customers.create` - Create customers
- `customers.read` - View customers
- `customers.update` - Update customers
- `customers.delete` - Delete customers

### Employees
- `employees.create` - Create employees
- `employees.read` - View employees
- `employees.update` - Update employees
- `employees.delete` - Delete employees

### Reports
- `reports.read` - View reports
- `reports.export` - Export reports

### Admin
- `admin.manage` - Full system management
- `settings.manage` - Manage system settings

## 🔧 Usage Examples

### Using Permission Decorators

```typescript
import { RequirePermission, RequireRole } from '@base/infrastructure/middlewares/Auth/RequirePermission';

@Get('/orders')
@RequirePermission('orders.read')
public async getOrders() {
  // Only users with orders.read permission can access
}

@Post('/orders')
@RequirePermission('orders.create')
public async createOrder() {
  // Only users with orders.create permission can access
}

@Delete('/orders/:id')
@RequireRole('admin')
public async deleteOrder() {
  // Only admin users can access
}
```

### Using Permission Service

```typescript
import { PermissionService } from '@base/api/services/Security/PermissionService';

// Check if user has permission
const hasPermission = await permissionService.hasPermission(
  userId,
  userType,
  'orders.create',
  companyId
);

// Check if user has any of multiple permissions
const hasAnyPermission = await permissionService.hasAnyPermission(
  userId,
  userType,
  ['orders.create', 'orders.update'],
  companyId
);

// Check if user has role
const hasRole = await permissionService.hasRole(
  userId,
  userType,
  'admin',
  companyId
);
```

## 🎭 Default Role Permissions

### Super Admin
- All permissions (`*`)

### Admin
- All order permissions
- All customer permissions
- All employee permissions
- All report permissions
- Settings management

### Manager
- Create, read, update orders
- Assign orders
- Create, read, update customers
- Read employees
- Read and export reports

### Employee
- Read and update orders
- Assign orders
- Read customers
- Read reports

### Retailer
- Create, read, update orders
- Create, read, update customers
- Read reports

### Customer
- Create and read orders
- Read reports

## 🔄 Role Assignment

### Assign Role to User

```typescript
await permissionService.assignRole(
  userId,
  userType,
  roleId,
  companyId,
  assignedBy,
  expiresAt // optional
);
```

### Remove Role from User

```typescript
await permissionService.removeRole(
  userId,
  userType,
  roleId,
  companyId,
  removedBy
);
```

## 🛡️ Security Features

### Permission Inheritance
- Roles can have multiple permissions
- Users can have multiple roles
- Permissions are cumulative

### Expiration Support
- User roles can have expiration dates
- Automatic permission revocation on expiry

### Company Isolation
- All permissions are company-scoped
- Users can only access resources within their company

### Audit Trail
- All permission changes are logged
- Role assignments are tracked
- Permission checks are audited

## 🚀 Getting Started

### 1. Initialize Default Roles and Permissions

```typescript
import { PermissionService } from '@base/api/services/Security/PermissionService';

const permissionService = Container.get(PermissionService);
await permissionService.createDefaultRolesAndPermissions(companyId, 'system');
```

### 2. Assign Role to User

```typescript
await permissionService.assignRole(
  userId,
  'employee',
  roleId,
  companyId,
  'admin'
);
```

### 3. Protect Endpoints

```typescript
@Get('/orders')
@RequirePermission('orders.read')
public async getOrders() {
  // Protected endpoint
}
```

## 📊 Permission Matrix

| Role | Orders | Customers | Employees | Reports | Admin |
|------|--------|-----------|-----------|---------|-------|
| Super Admin | All | All | All | All | All |
| Admin | All | All | All | All | Settings |
| Manager | CRU+Assign | CRU | R | R+Export | - |
| Employee | RU+Assign | RU | - | R | - |
| Retailer | CRU | CRU | - | R | - |
| Customer | CR | - | - | R | - |

**Legend:** C=Create, R=Read, U=Update, D=Delete, +Assign=Can Assign, +Export=Can Export

## 🔍 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check if user has the required permission
   - Verify role assignment
   - Check role expiration

2. **Role Not Found**
   - Ensure role exists in the database
   - Check company ID matches

3. **Permission Not Working**
   - Verify permission key is correct
   - Check if permission is active
   - Ensure role has the permission

### Debug Permissions

```typescript
// Get all user permissions
const userPermissions = await permissionService.getUserPermissions(
  userId,
  userType,
  companyId
);

console.log('User roles:', userPermissions.roles);
console.log('User permissions:', userPermissions.permissions);
```

## 🎯 Best Practices

1. **Principle of Least Privilege**
   - Grant minimum required permissions
   - Use specific permissions over wildcards

2. **Role-Based Design**
   - Create roles based on job functions
   - Avoid too many custom roles

3. **Regular Audits**
   - Review user permissions regularly
   - Remove unused roles and permissions

4. **Permission Naming**
   - Use consistent naming convention
   - Group related permissions

5. **Testing**
   - Test permission boundaries
   - Verify role inheritance works correctly
