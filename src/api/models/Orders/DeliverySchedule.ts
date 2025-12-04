import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { OrderItem } from './OrderItem';
import { Staff } from '../Users/Staff';

// Enum for delivery status
export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

// Enum for delivery grave type (different from OrderItem GraveType)
export enum DeliveryGraveType {
  TRADITIONAL = 'traditional',
  ADULT = 'adult',
  OVERSIZED = 'oversized',
  CREMATION = 'cremation',
}

registerEnumType(DeliveryStatus, {
  name: 'DeliveryStatus',
  description: 'Delivery status types',
});

registerEnumType(DeliveryGraveType, {
  name: 'DeliveryGraveType',
  description: 'Delivery grave types',
});

@ObjectType()
@Entity({ name: 'delivery_schedules' })
export class DeliverySchedule extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order item relationship
  @Field(() => OrderItem)
  @ManyToOne(() => OrderItem, (orderItem) => orderItem.deliverySchedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  // Staff relationship
  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff: Staff;

  @Field(() => String)
  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  // Delivery location details
  @Field({ nullable: true })
  @Column({ nullable: true })
  cemetery: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  section: string;

  @Field({ nullable: true })
  @Column({ name: 'plot_number', nullable: true })
  plotNumber: string;

  @Field(() => DeliveryGraveType, { nullable: true })
  @Column({
    name: 'grave_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  graveType: DeliveryGraveType;

  // Delivery timing
  @Field({ nullable: true })
  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'delivery_time', type: 'time', nullable: true })
  deliveryTime: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_at_graveside', type: 'time', nullable: true })
  arrivalAtGraveside: string;

  // Staff assignment
  @Field(() => String, { nullable: true })
  @Column({ name: 'assigned_staff_id', type: 'uuid', nullable: true })
  assignedStaffId: string;

  // Status
  @Field(() => DeliveryStatus)
  @Column({
    type: 'varchar',
    length: 50,
    default: DeliveryStatus.SCHEDULED,
  })
  status: DeliveryStatus;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

