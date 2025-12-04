import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';

export enum EngravingLocation {
  TOP = 'top',
  FRONT = 'front',
}

registerEnumType(EngravingLocation, {
  name: 'EngravingLocation',
  description: 'Engraving location options',
});

@ObjectType()
@Entity({ name: 'urns' })
export class Urn extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OneToOne relationship with Product
  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.urn, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field({ nullable: true })
  @Column({ name: 'has_engraving', type: 'boolean', default: false })
  hasEngraving: boolean;

  @Field(() => EngravingLocation, { nullable: true })
  @Column({
    name: 'engraving_location',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  engravingLocation: EngravingLocation;

  @Field({ nullable: true })
  @Column({ name: 'engraving_message', type: 'text', nullable: true })
  engravingMessage: string;

  @Field({ nullable: true })
  @Column({ name: 'engraving_font', nullable: true })
  engravingFont: string;

  @Field({ nullable: true })
  @Column({ name: 'engraving_fill_color', nullable: true })
  engravingFillColor: string;

  @Field(() => [String], { nullable: true })
  @Column({ name: 'extras', type: 'json', nullable: true })
  extras: string[];

  @Field({ nullable: true })
  @Column({ name: 'has_customization', type: 'boolean', default: false })
  hasCustomization: boolean;

  @Field({ nullable: true })
  @Column({ name: 'artwork_reference', nullable: true })
  artworkReference: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_location', nullable: true })
  deliveryLocation: string;

  @Field({ nullable: true })
  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'delivery_time', type: 'time', nullable: true })
  deliveryTime: string;

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

