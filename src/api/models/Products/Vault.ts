import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';
import { ServiceType } from '../Orders/Order';

@ObjectType()
@Entity({ name: 'vaults' })
export class Vault extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.vault, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field({ nullable: true })
  @Column({ name: 'cemetery_name', nullable: true })
  cemeteryName: string;

  @Field({ nullable: true })
  @Column({ name: 'cemetery_state', nullable: true })
  cemeteryState: string;

  @Field(() => ServiceType, { nullable: true })
  @Column({
    name: 'funeral_service_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  funeralServiceType: ServiceType;

  @Field({ nullable: true })
  @Column({ name: 'service_location', nullable: true })
  serviceLocation: string;

  @Field({ nullable: true })
  @Column({ name: 'service_date', type: 'date', nullable: true })
  serviceDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'service_start_time', type: 'time', nullable: true })
  serviceStartTime: string;

  @Field({ nullable: true })
  @Column({ name: 'arrival_at_graveside', type: 'time', nullable: true })
  arrivalAtGraveside: string;

  @Field(() => [String], { nullable: true })
  @Column({ name: 'extras', type: 'json', nullable: true })
  extras: string[]; 

  @Field({ nullable: true })
  @Column({ name: 'has_customization', type: 'boolean', default: false })
  hasCustomization: boolean;

  @Field({ nullable: true })
  @Column({ name: 'artwork_reference', nullable: true })
  artworkReference: string; 

  @Field(() => [String], { nullable: true })
  @Column({ name: 'attachments', type: 'json', nullable: true })
  attachments: string[]; 

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

