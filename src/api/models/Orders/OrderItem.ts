import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { Product, ProductType } from '../Products/Product';
import { Color } from '../Products/Color';
import { DeliverySchedule } from './DeliverySchedule';

// Re-export ProductType for backward compatibility
export { ProductType } from '../Products/Product';

// Enum for engraving position
export enum EngravingPosition {
  TOP = 'top',
  FRONT = 'front',
}

// Enum for gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// Enum for cremation type
export enum CremationType {
  PICKUP = 'pickup',
  DROPOFF = 'dropoff',
}

// Enum for witness type
export enum WitnessType {
  ONSET_30MIN = 'onset_30min',
  ENTIRE_PROCESS = 'entire_process',
}

// Enum for grave type
export enum GraveType {
  TRADITIONAL = 'traditional',
  ADULT = 'adult',
  OVERSIZED = 'oversized',
}

registerEnumType(EngravingPosition, {
  name: 'EngravingPosition',
  description: 'Engraving position types',
});

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender types',
});

registerEnumType(CremationType, {
  name: 'CremationType',
  description: 'Cremation types',
});

registerEnumType(WitnessType, {
  name: 'WitnessType',
  description: 'Witness types',
});

registerEnumType(GraveType, {
  name: 'GraveType',
  description: 'Grave types',
});

@ObjectType()
@Entity({ name: 'order_items' })
export class OrderItem extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Delivery schedules relationship
  @Field(() => [DeliverySchedule], { nullable: true })
  @OneToMany(() => DeliverySchedule, (deliverySchedule) => deliverySchedule.orderItem, { cascade: true })
  deliverySchedules: DeliverySchedule[];

  @Field(() => String)
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  // Product relationship
  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => String, { nullable: true })
  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string;

  @Field(() => ProductType, { nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
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

  @Field(() => EngravingPosition, { nullable: true })
  @Column({
    name: 'engraving_position',
    type: 'varchar',
    length: 50,
    nullable: true,
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

  // Paint color relationship
  @Field(() => Color, { nullable: true })
  @ManyToOne(() => Color, (color) => color.orderItems, { nullable: true })
  @JoinColumn({ name: 'paint_color_id' })
  paintColor: Color;

  @Field(() => String, { nullable: true })
  @Column({ name: 'paint_color_id', type: 'uuid', nullable: true })
  paintColorId: string;

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

  // Deceased information
  @Field({ nullable: true })
  @Column({ nullable: true })
  height: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  weight: string;

  @Field(() => Gender, { nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  gender: Gender;

  @Field({ nullable: true })
  @Column({ name: 'is_embalmed', nullable: true })
  isEmbalmed: boolean;

  @Field({ nullable: true })
  @Column({ name: 'body_container', nullable: true })
  bodyContainer: string;

  // Cremation specific fields
  @Field(() => CremationType, { nullable: true })
  @Column({
    name: 'cremation_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cremationType: CremationType;

  @Field({ nullable: true })
  @Column({ name: 'witnesses_present', nullable: true })
  witnessesPresent: boolean;

  @Field(() => WitnessType, { nullable: true })
  @Column({
    name: 'witness_type',
    type: 'varchar',
    length: 50,
    nullable: true,
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

  @Field(() => GraveType, { nullable: true })
  @Column({
    name: 'grave_type',
    type: 'varchar',
    length: 50,
    nullable: true,
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

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

