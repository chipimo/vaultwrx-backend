import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Order } from './Order';
// Note: ServiceExtra model doesn't exist yet, using string reference for now

@ObjectType('SalesOrderExtraCharge')
@Entity({ name: 'order_extra_charges' })
export class OrderExtraCharge {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, order => order.orderExtraCharges, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Service Extra relationship removed - using serviceExtraId directly

  @Field()
  @Column({ name: 'order_id' })
  orderId: string;

  // Service extra relationship
  @Field({ nullable: true })
  @Column({ name: 'service_extra_id', nullable: true })
  serviceExtraId: string;

  // Extra charge details
  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field()
  @Column({ name: 'delivered_quantity', type: 'int', default: 0 })
  deliveredQuantity: number;

  @Field()
  @Column({ name: 'is_delivered', default: false })
  isDelivered: boolean;

  // Timestamps
  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
