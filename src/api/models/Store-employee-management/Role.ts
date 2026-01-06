import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { UserRole } from './UserRole';
import { RolePermission } from './RolePermission';

// Enum for role types in VoteWorks
export enum RoleType {
  // VoteWorks main company roles
  VOTEWORKS_ADMIN = 'VOTEWORKS_ADMIN',
  VOTEWORKS_MANAGER = 'VOTEWORKS_MANAGER',
  VOTEWORKS_STAFF = 'VOTEWORKS_STAFF',
  VOTEWORKS_SUPER_ADMIN = 'VOTEWORKS_SUPER_ADMIN',
  
  // Retailer company roles
  RETAILER_OWNER = 'RETAILER_OWNER',
  RETAILER_MANAGER = 'RETAILER_MANAGER',
  RETAILER_STAFF = 'RETAILER_STAFF',
  
  // Customer roles
  CUSTOMER = 'CUSTOMER',
  CUSTOMER_ADMIN = 'CUSTOMER_ADMIN'
}

@ObjectType()
@Entity({ name: 'roles' })
export class Role {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ nullable: true })
  displayName: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({
    type: 'enum',
    enum: RoleType,
    nullable: true
  })
  roleType: RoleType;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: false })
  isSystemRole: boolean; // System roles cannot be deleted

  @Field()
  @Column({ default: 0 })
  priority: number; // Higher number = higher priority

  @Field({ nullable: true })
  @Column({ nullable: true })
  companyId: string; // null for global roles

  // Relationships
  @Field(() => [UserRole])
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @Field(() => [RolePermission])
  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  // Audit fields
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field()
  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Field()
  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  // Helper methods
  public isVoteWorksAdmin(): boolean {
    return this.roleType === RoleType.VOTEWORKS_ADMIN || this.roleType === RoleType.VOTEWORKS_SUPER_ADMIN;
  }

  public isVoteWorksStaff(): boolean {
    return [
      RoleType.VOTEWORKS_ADMIN,
      RoleType.VOTEWORKS_MANAGER,
      RoleType.VOTEWORKS_STAFF,
      RoleType.VOTEWORKS_SUPER_ADMIN
    ].includes(this.roleType);
  }

  public isRetailerOwner(): boolean {
    return this.roleType === RoleType.RETAILER_OWNER;
  }

  public isRetailerStaff(): boolean {
    return [
      RoleType.RETAILER_OWNER,
      RoleType.RETAILER_MANAGER,
      RoleType.RETAILER_STAFF
    ].includes(this.roleType);
  }

  public isCustomer(): boolean {
    return this.roleType === RoleType.CUSTOMER || this.roleType === RoleType.CUSTOMER_ADMIN;
  }

  public canManageRetailers(): boolean {
    return this.isVoteWorksAdmin();
  }

  public canManageOrders(): boolean {
    return this.isVoteWorksStaff() || this.isRetailerStaff();
  }

  public canViewOrders(): boolean {
    return this.isVoteWorksStaff() || this.isRetailerStaff() || this.isCustomer();
  }

  public canManageCustomers(): boolean {
    return this.isVoteWorksStaff() || this.isRetailerStaff();
  }

  public canManageStaff(): boolean {
    return this.isVoteWorksAdmin() || this.isRetailerOwner() || this.roleType === RoleType.RETAILER_MANAGER;
  }
}
