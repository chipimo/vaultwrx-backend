import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { OrderItem } from './OrderItem';
import { Staff } from '../Store-employee-management/Staff';

// Enum for delivery status
export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

// Enum for grave type
export enum GraveType {
  TRADITIONAL = 'traditional',
  ADULT = 'adult',
  OVERSIZED = 'oversized',
  CREMATION = 'cremation'
}

@ObjectType()
@Entity({ name: 'delivery_schedules' })
export class DeliverySchedule {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order item relationship
  @Field(() => OrderItem)
  @ManyToOne(() => OrderItem, orderItem => orderItem.deliverySchedules, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  // Staff relationship
  @Field(() => Staff, { nullable: true })
  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff: Staff;

  @Field()
  @Column({ name: 'order_item_id' })
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

  @Field({ nullable: true })
  @Column({
    name: 'grave_type',
    type: 'enum',
    enum: GraveType,
    nullable: true
  })
  graveType: GraveType;

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
  @Field({ nullable: true })
  @Column({ name: 'assigned_staff_id', nullable: true })
  assignedStaffId: string;

  // Status
  @Field()
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.SCHEDULED
  })
  status: DeliveryStatus;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
