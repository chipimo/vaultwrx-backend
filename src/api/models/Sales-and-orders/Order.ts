import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Customer } from '../Store-employee-management/Customer';
import { Staff } from '../Store-employee-management/Staff';
import { Retailer } from '../Company/Retailer';
import { OrderItem } from './OrderItem';
import { Deceased } from './Deceased';
import { Photo } from './Photo';
import { OrderExtraCharge } from './OrderExtraCharge';

// Enum for order status based on UI requirements
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered'
}

// Enum for service types
export enum ServiceType {
  TRADITIONAL = 'traditional',
  CREMATION = 'cremation',
  MEMORIAL = 'memorial',
  GRAVESIDE = 'graveside'
}

@ObjectType()
@Entity({ name: 'orders' })
export class Order {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User and retailer relationships
  @Field()
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Field()
  @Column({ name: 'retailer_id', nullable: true })
  retailerId: string;

  @Field()
  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Field({ nullable: true })
  @Column({ name: 'director_id', nullable: true })
  directorId: string;

  @Field({ nullable: true })
  @Column({ name: 'staff_id', nullable: true })
  staffId: string;

  // Order status
  @Field()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT
  })
  status: OrderStatus;

  // Financial information
  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salesTax: number;

  @Field()
  @Column({ name: 'apply_platform_fee', default: false })
  applyPlatformFee: boolean;

  // Service details
  @Field({ nullable: true })
  @Column({ name: 'service_type_name', nullable: true })
  serviceTypeName: string;

  @Field()
  @Column({ name: 'service_type_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceTypePrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cemetery: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  location: string;

  @Field({ nullable: true })
  @Column({ name: 'date_of_service', type: 'date', nullable: true })
  dateOfService: Date;

  @Field({ nullable: true })
  @Column({ name: 'time_of_service', type: 'time', nullable: true })
  timeOfService: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_time', type: 'time', nullable: true })
  arrivalTime: string;

  // Contact information (for quick reference)
  @Field({ nullable: true })
  @Column({ nullable: true })
  contact: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ name: 'cell_phone', nullable: true })
  cellPhone: string;

  // Order status flags
  @Field()
  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Field()
  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Field()
  @Column({ name: 'is_parent', default: false })
  isParent: boolean;

  @Field()
  @Column({ default: false })
  delivered: boolean;

  @Field()
  @Column({ default: false })
  confirmed: boolean;

  @Field()
  @Column({ name: 'new_order_notifications_sent', default: false })
  newOrderNotificationsSent: boolean;

  // Order details
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comments: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_instructions', type: 'text', nullable: true })
  deliveryInstructions: string;

  @Field({ nullable: true })
  @Column({ name: 'order_d_status', nullable: true })
  orderDStatus: string;

  @Field({ nullable: true })
  @Column({ name: 'product_paint_color_options', nullable: true })
  productPaintColorOptions: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  emblem: string;

  @Field({ nullable: true })
  @Column({ name: 'service_extras', type: 'text', nullable: true })
  serviceExtras: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image: string;

  // Store information
  @Field({ nullable: true })
  @Column({ name: 'store_name', nullable: true })
  storeName: string;

  @Field({ nullable: true })
  @Column({ name: 'store_address1', nullable: true })
  storeAddress1: string;

  @Field({ nullable: true })
  @Column({ name: 'store_address2', nullable: true })
  storeAddress2: string;

  @Field({ nullable: true })
  @Column({ name: 'store_city', nullable: true })
  storeCity: string;

  @Field({ nullable: true })
  @Column({ name: 'store_state', nullable: true })
  storeState: string;

  @Field({ nullable: true })
  @Column({ name: 'store_zip', nullable: true })
  storeZip: string;

  // Relationships
  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: false })
  orderItems: OrderItem[];

  @Field(() => [Deceased])
  @OneToMany(() => Deceased, deceased => deceased.order, { cascade: true, eager: false })
  deceased: Deceased[];

  @Field(() => [Photo])
  @OneToMany(() => Photo, photo => photo.order, { cascade: true, eager: false })
  photos: Photo[];

  @Field(() => [OrderExtraCharge])
  @OneToMany(() => OrderExtraCharge, orderExtraCharge => orderExtraCharge.order, { cascade: true, eager: false })
  orderExtraCharges: OrderExtraCharge[];

  // User relationships (using Customer as the user entity)
  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: Customer;

  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { eager: false })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'director_id' })
  director: Staff;

  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
