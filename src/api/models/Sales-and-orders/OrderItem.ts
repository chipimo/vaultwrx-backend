import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Order } from './Order';
// Note: Product model doesn't exist yet, using string reference for now
import { DeliverySchedule } from './DeliverySchedule';

// Enum for product types based on UI
export enum ProductType {
  VAULT = 'vault',
  CASKET = 'casket',
  URN = 'urn',
  GRAVE_DIGGING = 'grave_digging',
  CREMATION = 'cremation',
  MONUMENT = 'monument',
  BULK_PRECAST = 'bulk_precast'
}

// Enum for item types
export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service',
  PACKAGE = 'package',
  CUSTOM = 'custom'
}

// Enum for engraving position
export enum EngravingPosition {
  TOP = 'top',
  FRONT = 'front'
}

// Enum for gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

// Enum for cremation type
export enum CremationType {
  PICKUP = 'pickup',
  DROPOFF = 'dropoff'
}

// Enum for witness type
export enum WitnessType {
  ONSET_30MIN = 'onset_30min',
  ENTIRE_PROCESS = 'entire_process'
}

// Enum for grave type
export enum GraveType {
  TRADITIONAL = 'traditional',
  ADULT = 'adult',
  OVERSIZED = 'oversized'
}

@ObjectType()
@Entity({ name: 'order_items' })
export class OrderItem {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, order => order.orderItems, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Product relationship removed - using productId directly

  // Delivery schedules relationship
  @Field(() => [DeliverySchedule])
  @OneToMany(() => DeliverySchedule, deliverySchedule => deliverySchedule.orderItem, { cascade: true, eager: false })
  deliverySchedules: DeliverySchedule[];

  @Field()
  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  // Product relationship
  @Field()
  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ProductType,
    nullable: true
  })
  productType: ProductType;

  // Quantity and pricing
  @Field()
  @Column({ type: 'int' })
  quantity: number;

  @Field()
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Field()
  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  // Customization
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  customization: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  engraving: string;

  @Field({ nullable: true })
  @Column({ 
    name: 'engraving_position',
    type: 'enum',
    enum: EngravingPosition,
    nullable: true 
  })
  engravingPosition: EngravingPosition;

  @Field({ nullable: true })
  @Column({ name: 'engraving_font', nullable: true })
  engravingFont: string;

  @Field({ nullable: true })
  @Column({ name: 'engraving_color', nullable: true })
  engravingColor: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  theme: string;

  // Delivery details
  @Field({ nullable: true })
  @Column({ name: 'deliver_by', type: 'date', nullable: true })
  deliverBy: Date;

  @Field({ nullable: true })
  @Column({ name: 'delivery_time', type: 'time', nullable: true })
  deliveryTime: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_location', nullable: true })
  deliveryLocation: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comments: string;

  // Deceased information (for cremation and other services)
  @Field({ nullable: true })
  @Column({ nullable: true })
  height: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  weight: string;

  @Field({ nullable: true })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Field({ nullable: true })
  @Column({ name: 'is_embalmed', nullable: true })
  isEmbalmed: boolean;

  @Field({ nullable: true })
  @Column({ name: 'body_container', nullable: true })
  bodyContainer: string;

  // Cremation specific fields
  @Field({ nullable: true })
  @Column({
    name: 'cremation_type',
    type: 'enum',
    enum: CremationType,
    nullable: true
  })
  cremationType: CremationType;

  @Field({ nullable: true })
  @Column({ name: 'witnesses_present', nullable: true })
  witnessesPresent: boolean;

  @Field({ nullable: true })
  @Column({
    name: 'witness_type',
    type: 'enum',
    enum: WitnessType,
    nullable: true
  })
  witnessType: WitnessType;

  @Field({ nullable: true })
  @Column({ name: 'cremains_container', nullable: true })
  cremainsContainer: string;

  // Monument specific fields
  @Field({ nullable: true })
  @Column({ name: 'last_day_lettering', nullable: true })
  lastDayLettering: boolean;

  @Field({ nullable: true })
  @Column({ name: 'monument_in_place', nullable: true })
  monumentInPlace: boolean;

  @Field({ nullable: true })
  @Column({ name: 'name_on_stone', nullable: true })
  nameOnStone: string;

  @Field({ nullable: true })
  @Column({
    name: 'grave_type',
    type: 'enum',
    enum: GraveType,
    nullable: true
  })
  graveType: GraveType;

  @Field({ nullable: true })
  @Column({ name: 'grave_opening_closing', nullable: true })
  graveOpeningClosing: boolean;

  @Field({ nullable: true })
  @Column({ name: 'grave_opening_only', nullable: true })
  graveOpeningOnly: boolean;

  @Field({ nullable: true })
  @Column({ name: 'grave_closing_only', nullable: true })
  graveClosingOnly: boolean;

  // Burial details
  @Field({ nullable: true })
  @Column({ nullable: true })
  cemetery: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  section: string;

  @Field({ nullable: true })
  @Column({ name: 'grave_space', nullable: true })
  graveSpace: string;

  @Field({ nullable: true })
  @Column({ name: 'service_time', type: 'time', nullable: true })
  serviceTime: string;

  @Field({ nullable: true })
  @Column({ name: 'service_date', type: 'date', nullable: true })
  serviceDate: Date;

  // Completion
  @Field({ nullable: true })
  @Column({ name: 'requested_completion_date', type: 'date', nullable: true })
  requestedCompletionDate: Date;

  // Audit fields
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
