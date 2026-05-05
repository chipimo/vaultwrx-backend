import { Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from './User';
import { Company } from '../Company/Company';
import { Order } from '../Orders/Order';

/** Stored in customers.pricelist_selections (jsonb). */
export interface CustomerPricelistSelection {
  categoryId: string;
  enabled: boolean;
  pricelistId?: string | null;
  locationId?: string | null;
}

@ObjectType()
@Entity({ name: 'customers' })
export class Customer extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  user_id: string;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @Column({ name: 'company_id', type: 'uuid' })
  company_id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.customers)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field({ nullable: true })
  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ name: 'address', nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ name: 'city', nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ name: 'state', nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Field({ nullable: true })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Field({ nullable: true })
  @Column({ name: 'preferred_contact_method', nullable: true })
  preferredContactMethod: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ name: 'business_name', nullable: true })
  businessName: string;

  @Field({ nullable: true })
  @Column({ name: 'business_email', nullable: true })
  businessEmail: string;

  @Field({ nullable: true })
  @Column({ name: 'fax', nullable: true })
  fax: string;

  @Field({ nullable: true })
  @Column({ name: 'country', nullable: true })
  country: string;

  @Field({ nullable: true })
  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Field({ nullable: true })
  @Column({ name: 'sales_representative', nullable: true })
  salesRepresentative: string;

  @Field({ nullable: true })
  @Column({ name: 'billing_option', nullable: true })
  billingOption: string;

  @Field({ nullable: true })
  @Column({ name: 'tags', nullable: true })
  tags: string;

  @Field({ nullable: true })
  @Column({ name: 'special_order_instructions', type: 'text', nullable: true })
  specialOrderInstructions: string;

  @Field({ nullable: true })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'pricelist_selections', type: 'jsonb', nullable: true })
  pricelistSelections: CustomerPricelistSelection[] | null;

  @Field({ nullable: true })
  @Column({ name: 'allow_customer_see_prices', default: false })
  allowCustomerSeePrices: boolean;

  // Order relationships
  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.customer, { cascade: false })
  customerOrders: Order[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

