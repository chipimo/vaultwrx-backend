import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from '../Auth/User';
import { Staff } from '../Store-employee-management/Staff';
import { Customer } from '../Store-employee-management/Customer';
import { Retailer } from '../Company/Retailer';

// Enum for audit action types
export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  TRANSFER = 'TRANSFER',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  PRINT = 'PRINT',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  NOTIFICATION = 'NOTIFICATION',
  SETTING_CHANGE = 'SETTING_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
}

// Enum for resource types
export enum AuditResourceType {
  BUDGET_ENTRY = 'BUDGET_ENTRY',
  BUDGET_CATEGORY = 'BUDGET_CATEGORY',
  BUDGET_ALLOCATION = 'BUDGET_ALLOCATION',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  INVENTORY = 'INVENTORY',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  INVOICE = 'INVOICE',
  COMPANY = 'COMPANY',
  BRANCH = 'BRANCH',
  DEPARTMENT = 'DEPARTMENT',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  SETTING = 'SETTING',
  REPORT = 'REPORT',
  DOCUMENT = 'DOCUMENT',
  ASSET = 'ASSET',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  TAX = 'TAX',
  DISCOUNT = 'DISCOUNT',
  REFUND = 'REFUND',
  SUBSCRIPTION = 'SUBSCRIPTION',
  NOTIFICATION = 'NOTIFICATION',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  RETAILER = 'RETAILER',
}

@ObjectType('SecurityAuditLog')
@Entity({ name: 'audit_logs' })
export class AuditLog {
  @Field((type) => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship (primary - the user who performed the action)
  @Field(() => User)
  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  // Staff relationship (optional - for staff-specific actions)
  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Field({ nullable: true })
  @Column({ name: 'staff_id', nullable: true })
  staffId: string;

  // Customer relationship (optional - for customer-specific actions)
  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field({ nullable: true })
  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  // Retailer relationship (optional - for retailer-specific actions)
  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { eager: false })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field({ nullable: true })
  @Column({ name: 'retailer_id', nullable: true })
  retailerId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: AuditActionType,
  })
  action: AuditActionType;

  @Field()
  @Column({
    type: 'enum',
    enum: AuditResourceType,
  })
  resourceType: AuditResourceType;

  @Field()
  @Column({ nullable: true })
  resourceId: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  resourceName: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  oldValues: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  newValues: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  endpoint: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  method: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  requestId: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  isSuccessful: boolean;

  @Field()
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Field()
  @Column({ type: 'int', nullable: true })
  responseTime: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
