import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';

@ObjectType()
@Entity({ name: 'monuments' })
export class Monument extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OneToOne relationship with Product
  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.monument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field({ nullable: true })
  @Column({ name: 'last_day_lettering', type: 'boolean', nullable: true })
  lastDayLettering: boolean;

  @Field({ nullable: true })
  @Column({ name: 'cemetery_name', nullable: true })
  cemeteryName: string;

  @Field({ nullable: true })
  @Column({ name: 'cemetery_state', nullable: true })
  cemeteryState: string;

  @Field({ nullable: true })
  @Column({ name: 'section', nullable: true })
  section: string;

  @Field({ nullable: true })
  @Column({ name: 'grave_space', nullable: true })
  graveSpace: string;

  @Field({ nullable: true })
  @Column({ name: 'requested_completion_date', type: 'date', nullable: true })
  requestedCompletionDate: Date;

  @Field(() => [String], { nullable: true })
  @Column({ name: 'extras', type: 'json', nullable: true })
  extras: string[];

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

