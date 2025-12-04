import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { ServiceExtra } from '../Products/ServiceExtra';

@ObjectType()
@Entity({ name: 'order_extra_charges' })
export class OrderExtraCharge extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.orderExtraCharges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => String)
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  // Service extra relationship
  @Field(() => ServiceExtra, { nullable: true })
  @ManyToOne(() => ServiceExtra, (serviceExtra) => serviceExtra.orderExtraCharges, { nullable: true })
  @JoinColumn({ name: 'service_extra_id' })
  serviceExtra: ServiceExtra;

  @Field(() => String, { nullable: true })
  @Column({ name: 'service_extra_id', type: 'uuid', nullable: true })
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

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

