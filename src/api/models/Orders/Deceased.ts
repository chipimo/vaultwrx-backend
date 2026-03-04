import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Order } from './Order';
import { OrderHistory } from './OrderHistory';
import { Gender } from './OrderItem';

@ObjectType()
@Entity({ name: 'deceased' })
export class Deceased extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.deceased, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Field(() => String, { nullable: true })
  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @Field(() => OrderHistory, { nullable: true })
  @ManyToOne(() => OrderHistory, (orderHistory) => orderHistory.deceased, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'order_history_id' })
  orderHistory: OrderHistory;

  @Field(() => String, { nullable: true })
  @Column({ name: 'order_history_id', type: 'uuid', nullable: true })
  orderHistoryId: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'death_date', type: 'date', nullable: true })
  deathDate: Date;

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

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

