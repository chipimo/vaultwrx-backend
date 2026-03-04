import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from '../Auth/User';
import { Customer } from '../Store-employee-management/Customer';
import { Staff } from '../Store-employee-management/Staff';
import { Order } from '../Sales-and-orders/Order';
import { AuditLog } from '../Security-access-control/AuditLog';

// Enum for retailer status
export enum RetailerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval'
}

// Enum for business type
export enum BusinessType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  ECOMMERCE = 'ecommerce',
  BOTH = 'both'
}

// Enum for payment frequency
export enum PaymentFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

@ObjectType('CompanyRetailer')
@Entity({ name: 'retailers' })
export class Retailer {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country: string;

  @Field()
  @Column({
    type: 'enum',
    enum: RetailerStatus,
    default: RetailerStatus.ACTIVE
  })
  status: RetailerStatus;

  @Field()
  @Column({
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.RETAIL
  })
  businessType: BusinessType;

  @Field()
  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY
  })
  paymentFrequency: PaymentFrequency;

  @Field({ nullable: true })
  @Column({ name: 'website', nullable: true })
  website: string;

  @Field({ nullable: true })
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Field()
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date;

  // Owner relationship
  @Field(() => User)
  @ManyToOne(() => User, user => user.ownedRetailers, { eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Field()
  @Column({ name: 'owner_id' })
  ownerId: string;

  // Relationships
  @Field(() => [Customer])
  @OneToMany(() => Customer, customer => customer.retailer)
  customers: Customer[];

  @Field(() => [Staff])
  @OneToMany(() => Staff, staff => staff.retailer)
  staff: Staff[];

  @Field(() => [Order])
  @OneToMany(() => Order, order => order.retailer)
  orders: Order[];

  @Field(() => [AuditLog])
  @OneToMany(() => AuditLog, auditLog => auditLog.retailer)
  auditLogs: AuditLog[];

  // Timestamps
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
}

