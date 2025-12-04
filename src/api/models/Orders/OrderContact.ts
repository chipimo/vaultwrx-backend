import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { Customer } from '../Users/Customer';

@ObjectType()
@Entity({ name: 'order_contacts' })
export class OrderContact extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order relationship
  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => String)
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  // Customer relationship
  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field(() => String, { nullable: true })
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  // Contact information
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  relationship: string; // Relationship to deceased or customer

  // Primary contact flag
  @Field()
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  // Order for display (1-10)
  @Field()
  @Column({ type: 'int', default: 1 })
  displayOrder: number;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

