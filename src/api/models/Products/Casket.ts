import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';

@ObjectType()
@Entity({ name: 'caskets' })
export class Casket extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OneToOne relationship with Product
  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.casket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field({ nullable: true })
  @Column({ name: 'product_name', nullable: true })
  productName: string;

  @Field({ nullable: true })
  @Column({ name: 'theme', nullable: true })
  theme: string;

  @Field(() => [String], { nullable: true })
  @Column({ name: 'extras', type: 'json', nullable: true })
  extras: string[];

  @Field(() => [String], { nullable: true })
  @Column({ name: 'attachments', type: 'json', nullable: true })
  attachments: string[];

  @Field({ nullable: true })
  @Column({ name: 'delivery_location', nullable: true })
  deliveryLocation: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'delivery_time', type: 'time', nullable: true })
  deliveryTime: string;

  @Field({ nullable: true })
  @Column({ name: 'comments_or_delivery_instructions', type: 'text', nullable: true })
  commentsOrDeliveryInstructions: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

