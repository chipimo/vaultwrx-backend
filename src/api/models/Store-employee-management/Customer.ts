import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { User } from '../Auth/User';
import { UserProfile } from '../Auth/UserProfile';
import { Retailer } from '../Company/Retailer';
import { Order } from '../Sales-and-orders/Order';
import { AuditLog } from '../Security-access-control/AuditLog';

// Enum for customer status
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

// Enum for customer type
export enum CustomerType {
  INDIVIDUAL = 'individual',
  FAMILY = 'family',
  BUSINESS = 'business',
  ORGANIZATION = 'organization'
}

@ObjectType('StoreCustomer')
@Entity({ name: 'customers' })
export class Customer {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship (optional - customer can exist without user account)
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field({ nullable: true })
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  // Retailer relationship
  @Field(() => Retailer)
  @ManyToOne(() => Retailer, retailer => retailer.customers, { eager: false })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field()
  @Column({ name: 'retailer_id', nullable: true })
  retailerId: string;

  @Field()
  @Column({ nullable: true })
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field()
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Field({ nullable: true })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  @Column({ name: 'tax_type', nullable: true })
  taxType: string;

  @Field({ nullable: true })
  @Column({ name: 'tax_id_number', nullable: true })
  taxIdNumber: string;

  @Field({ nullable: true })
  @Column({ name: 'is_company', default: false })
  isCompany: boolean;

  @Field({ nullable: true })
  @Column({ name: 'parent_company', nullable: true })
  parentCompany: string;

  @Field({ nullable: true })
  @Column({ name: 'loyalty_points', default: 0 })
  loyaltyPoints: number;

  @Field({ nullable: true })
  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE
  })
  status: CustomerStatus;

  @Field()
  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL
  })
  customerType: CustomerType;

  // Address Information
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

  // Additional Information
  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @Field({ nullable: true })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  // Emergency Contact Information
  @Field({ nullable: true })
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Field({ nullable: true })
  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Field({ nullable: true })
  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string;

  @Field({ nullable: true })
  @Column({ name: 'preferred_contact_method', nullable: true })
  preferredContactMethod: string;

  @Field({ nullable: true })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relationships
  @Field(() => [UserProfile])
  @OneToMany(() => UserProfile, userProfile => userProfile.customer)
  userProfiles: UserProfile[];

  @Field(() => [Order])
  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @Field(() => [AuditLog])
  @OneToMany(() => AuditLog, auditLog => auditLog.customer)
  auditLogs: AuditLog[];

  // Payments relationship (returns orders with payment info for now)
  @Field(() => [Order], { nullable: true })
  get payments(): Order[] {
    return this.orders?.filter(order => order.paymentStatus === 'paid') || [];
  }

  // Invoices relationship (returns orders with invoice info for now)
  @Field(() => [Order], { nullable: true })
  get invoices(): Order[] {
    return this.orders?.filter(order => order.invoiceNumber) || [];
  }

  // Timestamps
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
}