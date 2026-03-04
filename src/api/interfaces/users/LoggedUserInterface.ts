/** Role with optional permissions (used when JWT includes full role data) */
export interface LoggedUserRole {
  id?: string;
  name: string;
  company?: { id: string };
  employeePermissions?: Array< { permissionKey: string; allowed: boolean } >;
  customerPermissions?: Array< { permissionKey: string; allowed: boolean } >;
}

/** Company reference (used when user has company context) */
export interface LoggedUserCompany {
  id: string;
}

export interface LoggedUserInterface {
  userId: number;
  email: string;
  role_id: number;
  role: string;
  iat: number;
  exp: number;
  /** Optional: full roles array when present in JWT */
  roles?: LoggedUserRole[];
  /** Optional: 'employee' | 'customer' etc. */
  userType?: string;
  /** Optional: primary company id */
  companyId?: string;
  /** Optional: companies the user belongs to */
  companies?: LoggedUserCompany[];
}
