import { DataSource } from 'typeorm';
import { User, UserType, UserStatus, AuthProvider } from '@base/api/models/Auth/User';
import { UserProfile, ProfileType } from '@base/api/models/Auth/UserProfile';
import { Customer, CustomerStatus, CustomerType } from '@base/api/models/Store-employee-management/Customer';
import { Staff, StaffStatus, StaffPosition } from '@base/api/models/Store-employee-management/Staff';
import { AuditLog, AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';
import { Role, RoleType } from '@base/api/models/Store-employee-management/Role';
import { UserRole } from '@base/api/models/Store-employee-management/UserRole';

export class UserSeeds {
  constructor(private dataSource: DataSource) {}

  public async seed(): Promise<void> {
    console.log('🌱 Starting User System Seeds...');

    // Create roles first
    await this.createRoles();
    
    // Create users
    await this.createUsers();
    
    // Create retailers
    await this.createRetailers();
    
    // Create customers
    await this.createCustomers();
    
    // Create staff
    await this.createStaff();
    
    // Create user profiles
    await this.createUserProfiles();
    
    // Create user roles
    await this.createUserRoles();
    
    // Create audit logs
    await this.createAuditLogs();

    console.log('✅ User System Seeds completed successfully!');
  }

  private async createRoles(): Promise<void> {
    console.log('📋 Creating roles...');
    
    const roleRepository = this.dataSource.getRepository(Role);
    
    const roles = [
      {
        name: 'voteworks_super_admin',
        displayName: 'VoteWorks Super Admin',
        description: 'Full system access with all permissions',
        roleType: RoleType.VOTEWORKS_SUPER_ADMIN,
        isActive: true,
        isSystemRole: true,
        priority: 100,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'voteworks_admin',
        displayName: 'VoteWorks Admin',
        description: 'VoteWorks platform administrator',
        roleType: RoleType.VOTEWORKS_ADMIN,
        isActive: true,
        isSystemRole: true,
        priority: 90,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'voteworks_manager',
        displayName: 'VoteWorks Manager',
        description: 'VoteWorks platform manager',
        roleType: RoleType.VOTEWORKS_MANAGER,
        isActive: true,
        isSystemRole: true,
        priority: 80,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'voteworks_staff',
        displayName: 'VoteWorks Staff',
        description: 'VoteWorks platform staff member',
        roleType: RoleType.VOTEWORKS_STAFF,
        isActive: true,
        isSystemRole: true,
        priority: 70,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'retailer_owner',
        displayName: 'Retailer Owner',
        description: 'Funeral home or cemetery owner',
        roleType: RoleType.RETAILER_OWNER,
        isActive: true,
        isSystemRole: false,
        priority: 60,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'retailer_manager',
        displayName: 'Retailer Manager',
        description: 'Funeral home or cemetery manager',
        roleType: RoleType.RETAILER_MANAGER,
        isActive: true,
        isSystemRole: false,
        priority: 50,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'retailer_staff',
        displayName: 'Retailer Staff',
        description: 'Funeral home or cemetery staff member',
        roleType: RoleType.RETAILER_STAFF,
        isActive: true,
        isSystemRole: false,
        priority: 40,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'customer',
        displayName: 'Customer',
        description: 'Funeral service customer',
        roleType: RoleType.CUSTOMER,
        isActive: true,
        isSystemRole: false,
        priority: 30,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        name: 'customer_admin',
        displayName: 'Customer Admin',
        description: 'Customer with administrative privileges',
        roleType: RoleType.CUSTOMER_ADMIN,
        isActive: true,
        isSystemRole: false,
        priority: 35,
        companyId: null,
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`✅ Created role: ${roleData.displayName}`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.displayName}`);
      }
    }
  }

  private async createUsers(): Promise<void> {
    console.log('👤 Creating users...');
    
    const userRepository = this.dataSource.getRepository(User);
    
    const users = [
      {
        firebaseUid: 'firebase-uid-super-admin',
        email: 'superadmin@vaultwrx.com',
        phone: '+1-555-0001',
        userType: UserType.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.FIREBASE,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: true,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatars/superadmin.jpg',
        metadata: JSON.stringify({
          displayName: 'Super Admin',
          photoURL: 'https://example.com/avatars/superadmin.jpg',
          providerData: [{ providerId: 'firebase' }]
        })
      },
      {
        firebaseUid: 'firebase-uid-admin',
        email: 'admin@vaultwrx.com',
        phone: '+1-555-0002',
        userType: UserType.ADMIN,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.FIREBASE,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: true,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatars/admin.jpg',
        metadata: JSON.stringify({
          displayName: 'Platform Admin',
          photoURL: 'https://example.com/avatars/admin.jpg',
          providerData: [{ providerId: 'firebase' }]
        })
      },
      {
        firebaseUid: 'firebase-uid-retailer-owner-1',
        email: 'owner@peacefulgardens.com',
        phone: '+1-555-0101',
        userType: UserType.RETAILER,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.FIREBASE,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: false,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatars/retailer1.jpg',
        metadata: JSON.stringify({
          displayName: 'John Smith',
          photoURL: 'https://example.com/avatars/retailer1.jpg',
          providerData: [{ providerId: 'firebase' }]
        })
      },
      {
        firebaseUid: 'firebase-uid-staff-1',
        email: 'manager@peacefulgardens.com',
        phone: '+1-555-0102',
        userType: UserType.STAFF,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.FIREBASE,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: false,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatars/staff1.jpg',
        metadata: JSON.stringify({
          displayName: 'Sarah Johnson',
          photoURL: 'https://example.com/avatars/staff1.jpg',
          providerData: [{ providerId: 'firebase' }]
        })
      },
      {
        firebaseUid: 'firebase-uid-customer-1',
        email: 'customer@example.com',
        phone: '+1-555-0201',
        userType: UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.FIREBASE,
        isEmailVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: false,
        preferredLanguage: 'en',
        timezone: 'America/New_York',
        avatarUrl: 'https://example.com/avatars/customer1.jpg',
        metadata: JSON.stringify({
          displayName: 'Michael Brown',
          photoURL: 'https://example.com/avatars/customer1.jpg',
          providerData: [{ providerId: 'firebase' }]
        })
      }
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({ where: { firebaseUid: userData.firebaseUid } });
      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }
  }

  private async createRetailers(): Promise<void> {
    console.log('🏢 Creating retailers...');
    
    const retailerRepository = this.dataSource.getRepository(Retailer);
    const userRepository = this.dataSource.getRepository(User);
    
    // Get the retailer owner user
    const ownerUser = await userRepository.findOne({ where: { email: 'owner@peacefulgardens.com' } });
    
    if (!ownerUser) {
      console.log('❌ Retailer owner user not found, skipping retailer creation');
      return;
    }

    const retailers = [
      {
        ownerUserId: ownerUser.id,
        name: 'Peaceful Gardens Funeral Home',
        email: 'info@peacefulgardens.com',
        cellPhone: '+1-555-0100',
        fax: '+1-555-0101',
        status: RetailerStatus.ACTIVE,
        businessType: BusinessType.FUNERAL_HOME,
        businessLicense: 'FH-2024-001',
        taxId: '12-3456789',
        website: 'https://peacefulgardens.com',
        addressLine1: '123 Memorial Drive',
        addressLine2: 'Suite 100',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
        disabledDates: JSON.stringify(['2024-12-25', '2024-01-01']),
        paymentFrequency: PaymentFrequency.MONTHLY,
        saturdayCharge: 150.00,
        sundayCharge: 200.00,
        holidayCharge: 250.00,
        platformFeeCustomer: true,
        platformFeeAmount: 2.5,
        creditCardFee: 2.9,
        achFee: 0.5,
        onAccountFee: 0.0,
        businessHours: JSON.stringify({
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
          saturday: { open: '09:00', close: '15:00' },
          sunday: { open: '10:00', close: '14:00' }
        }),
        contactPerson: 'John Smith',
        contactEmail: 'john@peacefulgardens.com',
        contactPhone: '+1-555-0101',
        logoUrl: 'https://example.com/logos/peacefulgardens.png',
        description: 'Family-owned funeral home serving the community for over 50 years',
        notes: 'Specializes in traditional and cremation services',
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    for (const retailerData of retailers) {
      const existingRetailer = await retailerRepository.findOne({ where: { email: retailerData.email } });
      if (!existingRetailer) {
        const retailer = retailerRepository.create(retailerData);
        await retailerRepository.save(retailer);
        console.log(`✅ Created retailer: ${retailerData.name}`);
      } else {
        console.log(`⏭️  Retailer already exists: ${retailerData.name}`);
      }
    }
  }

  private async createCustomers(): Promise<void> {
    console.log('👥 Creating customers...');
    
    const customerRepository = this.dataSource.getRepository(Customer);
    const retailerRepository = this.dataSource.getRepository(Retailer);
    const userRepository = this.dataSource.getRepository(User);
    
    // Get the retailer and customer user
    const retailer = await retailerRepository.findOne({ where: { email: 'info@peacefulgardens.com' } });
    const customerUser = await userRepository.findOne({ where: { email: 'customer@example.com' } });
    
    if (!retailer) {
      console.log('❌ Retailer not found, skipping customer creation');
      return;
    }

    const customers = [
      {
        userId: customerUser?.id,
        retailerId: retailer.id,
        name: 'Michael Brown',
        email: 'customer@example.com',
        phone: '+1-555-0201',
        status: CustomerStatus.ACTIVE,
        customerType: CustomerType.INDIVIDUAL,
        address: '456 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
        dateOfBirth: new Date('1980-05-15'),
        emergencyContactName: 'Jane Brown',
        emergencyContactPhone: '+1-555-0202',
        emergencyContactRelationship: 'Spouse',
        preferredContactMethod: 'phone',
        notes: 'Prefers morning appointments',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        userId: null, // Customer without user account
        retailerId: retailer.id,
        name: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        phone: '+1-555-0203',
        status: CustomerStatus.ACTIVE,
        customerType: CustomerType.INDIVIDUAL,
        address: '789 Pine Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA',
        dateOfBirth: new Date('1975-08-22'),
        emergencyContactName: 'Mary Wilson',
        emergencyContactPhone: '+1-555-0204',
        emergencyContactRelationship: 'Sister',
        preferredContactMethod: 'email',
        notes: 'Family prefers cremation services',
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    for (const customerData of customers) {
      const existingCustomer = await customerRepository.findOne({ where: { email: customerData.email } });
      if (!existingCustomer) {
        const customer = customerRepository.create(customerData);
        await customerRepository.save(customer);
        console.log(`✅ Created customer: ${customerData.name}`);
      } else {
        console.log(`⏭️  Customer already exists: ${customerData.name}`);
      }
    }
  }

  private async createStaff(): Promise<void> {
    console.log('👨‍💼 Creating staff...');
    
    const staffRepository = this.dataSource.getRepository(Staff);
    const retailerRepository = this.dataSource.getRepository(Retailer);
    const userRepository = this.dataSource.getRepository(User);
    
    // Get the retailer and staff user
    const retailer = await retailerRepository.findOne({ where: { email: 'info@peacefulgardens.com' } });
    const staffUser = await userRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });
    
    if (!retailer) {
      console.log('❌ Retailer not found, skipping staff creation');
      return;
    }

    const staffMembers = [
      {
        userId: staffUser?.id,
        retailerId: retailer.id,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'manager@peacefulgardens.com',
        phone: '+1-555-0102',
        status: StaffStatus.ACTIVE,
        position: StaffPosition.MANAGER,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        userId: null, // Staff without user account
        retailerId: retailer.id,
        firstName: 'David',
        lastName: 'Miller',
        email: 'david@peacefulgardens.com',
        phone: '+1-555-0103',
        status: StaffStatus.ACTIVE,
        position: StaffPosition.STAFF,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        userId: null, // Staff without user account
        retailerId: retailer.id,
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa@peacefulgardens.com',
        phone: '+1-555-0104',
        status: StaffStatus.ACTIVE,
        position: StaffPosition.COORDINATOR,
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    for (const staffData of staffMembers) {
      const existingStaff = await staffRepository.findOne({ where: { email: staffData.email } });
      if (!existingStaff) {
        const staff = staffRepository.create(staffData);
        await staffRepository.save(staff);
        console.log(`✅ Created staff: ${staffData.firstName} ${staffData.lastName}`);
      } else {
        console.log(`⏭️  Staff already exists: ${staffData.firstName} ${staffData.lastName}`);
      }
    }
  }

  private async createUserProfiles(): Promise<void> {
    console.log('👤 Creating user profiles...');
    
    const userProfileRepository = this.dataSource.getRepository(UserProfile);
    const userRepository = this.dataSource.getRepository(User);
    const retailerRepository = this.dataSource.getRepository(Retailer);
    const customerRepository = this.dataSource.getRepository(Customer);
    const staffRepository = this.dataSource.getRepository(Staff);
    
    // Get entities
    const retailerOwnerUser = await userRepository.findOne({ where: { email: 'owner@peacefulgardens.com' } });
    const staffUser = await userRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });
    const customerUser = await userRepository.findOne({ where: { email: 'customer@example.com' } });
    
    const retailer = await retailerRepository.findOne({ where: { email: 'info@peacefulgardens.com' } });
    const customer = await customerRepository.findOne({ where: { email: 'customer@example.com' } });
    const staff = await staffRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });

    const profiles = [
      // Retailer owner profile
      {
        userId: retailerOwnerUser?.id,
        profileType: ProfileType.RETAILER,
        profileEntityId: retailer?.id,
        isPrimary: true,
        isActive: true,
        retailerId: retailer?.id,
        notes: 'Primary retailer owner profile'
      },
      // Staff profile
      {
        userId: staffUser?.id,
        profileType: ProfileType.STAFF,
        profileEntityId: staff?.id,
        isPrimary: true,
        isActive: true,
        staffId: staff?.id,
        notes: 'Primary staff profile'
      },
      // Customer profile
      {
        userId: customerUser?.id,
        profileType: ProfileType.CUSTOMER,
        profileEntityId: customer?.id,
        isPrimary: true,
        isActive: true,
        customerId: customer?.id,
        notes: 'Primary customer profile'
      }
    ].filter(profile => profile.userId); // Only create profiles for users that exist

    for (const profileData of profiles) {
      const existingProfile = await userProfileRepository.findOne({ 
        where: { 
          userId: profileData.userId,
          profileType: profileData.profileType
        } 
      });
      
      if (!existingProfile) {
        const profile = userProfileRepository.create(profileData);
        await userProfileRepository.save(profile);
        console.log(`✅ Created user profile: ${profileData.profileType} for user ${profileData.userId}`);
      } else {
        console.log(`⏭️  User profile already exists: ${profileData.profileType} for user ${profileData.userId}`);
      }
    }
  }

  private async createUserRoles(): Promise<void> {
    console.log('🔐 Creating user roles...');
    
    const userRoleRepository = this.dataSource.getRepository(UserRole);
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);
    
    // Get users and roles
    const superAdminUser = await userRepository.findOne({ where: { email: 'superadmin@vaultwrx.com' } });
    const adminUser = await userRepository.findOne({ where: { email: 'admin@vaultwrx.com' } });
    const retailerOwnerUser = await userRepository.findOne({ where: { email: 'owner@peacefulgardens.com' } });
    const staffUser = await userRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });
    const customerUser = await userRepository.findOne({ where: { email: 'customer@example.com' } });
    
    const superAdminRole = await roleRepository.findOne({ where: { name: 'voteworks_super_admin' } });
    const adminRole = await roleRepository.findOne({ where: { name: 'voteworks_admin' } });
    const retailerOwnerRole = await roleRepository.findOne({ where: { name: 'retailer_owner' } });
    const retailerManagerRole = await roleRepository.findOne({ where: { name: 'retailer_manager' } });
    const customerRole = await roleRepository.findOne({ where: { name: 'customer' } });

    const userRoles = [
      {
        userId: superAdminUser?.id,
        userType: 'admin',
        roleId: superAdminRole?.id,
        companyId: null,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        notes: 'System super admin role'
      },
      {
        userId: adminUser?.id,
        userType: 'admin',
        roleId: adminRole?.id,
        companyId: null,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        notes: 'Platform admin role'
      },
      {
        userId: retailerOwnerUser?.id,
        userType: 'retailer',
        roleId: retailerOwnerRole?.id,
        companyId: null, // Will be set to retailer ID in real implementation
        isActive: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        notes: 'Retailer owner role'
      },
      {
        userId: staffUser?.id,
        userType: 'staff',
        roleId: retailerManagerRole?.id,
        companyId: null, // Will be set to retailer ID in real implementation
        isActive: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        notes: 'Retailer manager role'
      },
      {
        userId: customerUser?.id,
        userType: 'customer',
        roleId: customerRole?.id,
        companyId: null,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: 'system',
        notes: 'Customer role'
      }
    ].filter(userRole => userRole.userId && userRole.roleId);

    for (const userRoleData of userRoles) {
      const existingUserRole = await userRoleRepository.findOne({ 
        where: { 
          userId: userRoleData.userId,
          roleId: userRoleData.roleId
        } 
      });
      
      if (!existingUserRole) {
        const userRole = userRoleRepository.create(userRoleData);
        await userRoleRepository.save(userRole);
        console.log(`✅ Created user role: ${userRoleData.userType} for user ${userRoleData.userId}`);
      } else {
        console.log(`⏭️  User role already exists: ${userRoleData.userType} for user ${userRoleData.userId}`);
      }
    }
  }

  private async createAuditLogs(): Promise<void> {
    console.log('📊 Creating audit logs...');
    
    const auditLogRepository = this.dataSource.getRepository(AuditLog);
    const userRepository = this.dataSource.getRepository(User);
    const retailerRepository = this.dataSource.getRepository(Retailer);
    const customerRepository = this.dataSource.getRepository(Customer);
    const staffRepository = this.dataSource.getRepository(Staff);
    
    // Get entities
    const superAdminUser = await userRepository.findOne({ where: { email: 'superadmin@vaultwrx.com' } });
    const retailerOwnerUser = await userRepository.findOne({ where: { email: 'owner@peacefulgardens.com' } });
    const staffUser = await userRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });
    const customerUser = await userRepository.findOne({ where: { email: 'customer@example.com' } });
    
    const retailer = await retailerRepository.findOne({ where: { email: 'info@peacefulgardens.com' } });
    const customer = await customerRepository.findOne({ where: { email: 'customer@example.com' } });
    const staff = await staffRepository.findOne({ where: { email: 'manager@peacefulgardens.com' } });

    const auditLogs = [
      {
        userId: superAdminUser?.id,
        action: AuditActionType.CREATE,
        resourceType: AuditResourceType.USER,
        resourceId: retailerOwnerUser?.id,
        resourceName: 'Retailer Owner User',
        description: 'Created new retailer owner user account',
        oldValues: null,
        newValues: JSON.stringify({ email: 'owner@peacefulgardens.com', userType: 'retailer' }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        endpoint: '/api/users',
        method: 'POST',
        isSuccessful: true,
        responseTime: 150
      },
      {
        userId: retailerOwnerUser?.id,
        staffId: staff?.id,
        retailerId: retailer?.id,
        action: AuditActionType.CREATE,
        resourceType: AuditResourceType.RETAILER,
        resourceId: retailer?.id,
        resourceName: 'Peaceful Gardens Funeral Home',
        description: 'Created new retailer account',
        oldValues: null,
        newValues: JSON.stringify({ name: 'Peaceful Gardens Funeral Home', status: 'active' }),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        endpoint: '/api/retailers',
        method: 'POST',
        isSuccessful: true,
        responseTime: 200
      },
      {
        userId: staffUser?.id,
        staffId: staff?.id,
        retailerId: retailer?.id,
        action: AuditActionType.CREATE,
        resourceType: AuditResourceType.CUSTOMER,
        resourceId: customer?.id,
        resourceName: 'Michael Brown',
        description: 'Created new customer record',
        oldValues: null,
        newValues: JSON.stringify({ name: 'Michael Brown', email: 'customer@example.com' }),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        endpoint: '/api/customers',
        method: 'POST',
        isSuccessful: true,
        responseTime: 180
      },
      {
        userId: customerUser?.id,
        customerId: customer?.id,
        action: AuditActionType.LOGIN,
        resourceType: AuditResourceType.SYSTEM,
        resourceId: customerUser?.id,
        resourceName: 'Customer Login',
        description: 'Customer logged into the system',
        oldValues: null,
        newValues: JSON.stringify({ lastLoginAt: new Date().toISOString() }),
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        endpoint: '/api/auth/login',
        method: 'POST',
        isSuccessful: true,
        responseTime: 120
      }
    ].filter(auditLog => auditLog.userId);

    for (const auditLogData of auditLogs) {
      const auditLog = auditLogRepository.create(auditLogData);
      await auditLogRepository.save(auditLog);
      console.log(`✅ Created audit log: ${auditLogData.action} ${auditLogData.resourceType}`);
    }
  }
}
