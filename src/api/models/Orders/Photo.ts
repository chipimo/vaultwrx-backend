import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { OrderHistory } from './OrderHistory';
import { Customer } from '../Users/Customer';

// Enum for photo types
export enum PhotoType {
  CERTIFICATE = 'certificate',
  TRAVEL = 'travel',
  PERMIT = 'permit',
  AUTHORIZATION = 'authorization',
  CREMATION = 'cremation',
  CUSTOMIZATION = 'customization',
  OTHER = 'other',
}

registerEnumType(PhotoType, {
  name: 'PhotoType',
  description: 'Photo types',
});

@ObjectType()
@Entity({ name: 'photos' })
export class Photo extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship (current order)
  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.photos, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => String, { nullable: true })
  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  // Order history relationship (archived order)
  @Field(() => OrderHistory, { nullable: true })
  @ManyToOne(() => OrderHistory, (orderHistory) => orderHistory.photos, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'order_history_id' })
  orderHistory: OrderHistory;

  @Field(() => String, { nullable: true })
  @Column({ name: 'order_history_id', type: 'uuid', nullable: true })
  orderHistoryId: string;

  // User relationship
  @Field(() => Customer)
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'user_id' })
  user: Customer;

  @Field(() => String)
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // File information
  @Field()
  @Column()
  url: string;

  @Field(() => PhotoType)
  @Column({
    type: 'varchar',
    length: 50,
    default: PhotoType.OTHER,
  })
  type: PhotoType;

  @Field({ nullable: true })
  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Field({ nullable: true })
  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number;

  @Field({ nullable: true })
  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

