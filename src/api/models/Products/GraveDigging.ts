import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';

export enum BurialType {
  TRADITIONAL = 'traditional',
  CREMATION = 'cremation',
}

export enum GraveSize {
  TRADITIONAL = 'traditional',
  ADULT = 'adult',
  OVERSIZED = 'oversized',
}

registerEnumType(BurialType, {
  name: 'BurialType',
  description: 'Burial type options',
});

registerEnumType(GraveSize, {
  name: 'GraveSize',
  description: 'Grave size options',
});

@ObjectType()
@Entity({ name: 'grave_diggings' })
export class GraveDigging extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OneToOne relationship with Product
  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.graveDigging, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => BurialType, { nullable: true })
  @Column({
    name: 'burial_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  burialType: BurialType;

  @Field({ nullable: true })
  @Column({ name: 'grave_opening_and_closing', type: 'boolean', default: false })
  graveOpeningAndClosing: boolean;

  @Field({ nullable: true })
  @Column({ name: 'grave_opening_only', type: 'boolean', default: false })
  graveOpeningOnly: boolean;

  @Field({ nullable: true })
  @Column({ name: 'grave_closing_only', type: 'boolean', default: false })
  graveClosingOnly: boolean;

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
  @Column({ name: 'service_time', type: 'time', nullable: true })
  serviceTime: string;

  @Field({ nullable: true })
  @Column({ name: 'service_date', type: 'date', nullable: true })
  serviceDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'monument_in_place', type: 'boolean', default: false })
  monumentInPlace: boolean;

  @Field({ nullable: true })
  @Column({ name: 'name_on_the_stone', nullable: true })
  nameOnTheStone: string;

  @Field(() => GraveSize, { nullable: true })
  @Column({
    name: 'grave_size',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  graveSize: GraveSize;

  @Field(() => [String], { nullable: true })
  @Column({ name: 'attachments', type: 'json', nullable: true })
  attachments: string[];

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

