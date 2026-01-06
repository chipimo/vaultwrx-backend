export interface RolePermission {
  permissionKey: string;
  allowed: boolean;
}

export interface UserRole {
  id?: string;
  name: string;
  company?: {
    id: string;
    name?: string;
  };
  employeePermissions?: RolePermission[];
  customerPermissions?: RolePermission[];
}

export interface UserCompany {
  id: string;
  name?: string;
}

export interface LoggedUserInterface {
  userId: number;
  email: string;
  role_id: number;
  role: string;
  iat: number;
  exp: number;
  // Extended properties for multi-role/company support
  roles?: UserRole[];
  companies?: UserCompany[];
  userType?: 'employee' | 'customer' | 'admin';
  companyId?: string;
}
