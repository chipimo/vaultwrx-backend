import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { Customer } from '../Users/Customer';
import { User } from '../Users/User';

@ObjectType()
@Entity({ name: 'comments' })
export class Comment extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => String)
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String, { nullable: true })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Field(() => String, { nullable: true })
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @Field()
  @Column({ type: 'text' })
  comment: string;

  @Field({ nullable: true })
  @Column({ name: 'comment_type', nullable: true })
  commentType: string; 

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

