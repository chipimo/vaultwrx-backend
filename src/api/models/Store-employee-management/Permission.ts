import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { RolePermission } from './RolePermission';

// Enum for permission categories
export enum PermissionCategory {
  ORDERS = 'ORDERS',
  CUSTOMERS = 'CUSTOMERS',
  EMPLOYEES = 'EMPLOYEES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN',
  INVENTORY = 'INVENTORY',
  PAYMENTS = 'PAYMENTS',
  AUDIT = 'AUDIT'
}

// Enum for permission actions
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  MANAGE = 'MANAGE'
}

@ObjectType()
@Entity({ name: 'permissions' })
export class Permission {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  key: string; // e.g., 'orders.create', 'customers.read'

  @Field()
  @Column()
  name: string; // e.g., 'Create Orders'

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({
    type: 'enum',
    enum: PermissionCategory
  })
  category: PermissionCategory;

  @Field()
  @Column({
    type: 'enum',
    enum: PermissionAction
  })
  action: PermissionAction;

  @Field()
  @Column()
  resource: string; // e.g., 'orders', 'customers', 'employees'

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: false })
  isSystemPermission: boolean; // System permissions cannot be deleted

  @Field()
  @Column({ default: 0 })
  priority: number; // Higher number = higher priority

  // Relationships
  @Field(() => [RolePermission])
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];

  // Audit fields
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field()
  @Column({ name: 'created_by' })
  createdBy: string;

  @Field()
  @Column({ name: 'updated_by' })
  updatedBy: string;

  // Helper methods
  public getFullKey(): string {
    return `${this.resource}.${this.action.toLowerCase()}`;
  }

  public isOrderPermission(): boolean {
    return this.category === PermissionCategory.ORDERS;
  }

  public isCustomerPermission(): boolean {
    return this.category === PermissionCategory.CUSTOMERS;
  }

  public isAdminPermission(): boolean {
    return this.category === PermissionCategory.ADMIN;
  }

  public isReadPermission(): boolean {
    return this.action === PermissionAction.READ;
  }

  public isWritePermission(): boolean {
    return [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE].includes(this.action);
  }
}
